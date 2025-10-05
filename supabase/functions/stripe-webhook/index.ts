import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function logStep(step: string, details?: any) {
  console.log(`[Stripe Webhook] ${step}`, details ? JSON.stringify(details, null, 2) : '');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
      logStep('Event received', { type: event.type, id: event.id });
    } catch (err) {
      logStep('Webhook signature verification failed', err);
      return new Response(`Webhook Error: ${err}`, { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const eventType = event.type;
    const payload = event.data.object as any;

    try {
      switch (eventType) {
        case 'checkout.session.completed': {
          logStep('Processing checkout.session.completed');
          const session = payload as Stripe.Checkout.Session;
          const email = session.customer_details?.email || session.customer_email;
          const customerId = session.customer as string;
          const subscriptionId = session.subscription as string;

          if (email) {
            // Find user by email
            const { data: profile } = await supabaseAdmin
              .from('user_profiles')
              .select('user_id')
              .eq('user_id', session.metadata?.userId || '')
              .limit(1)
              .maybeSingle();

            const userId = profile?.user_id;

            if (userId) {
              // Upsert subscription
              const { error } = await supabaseAdmin
                .from('subscriptions')
                .upsert({
                  user_id: userId,
                  email: email,
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscriptionId,
                  status: 'active',
                  plan_name: session.metadata?.plan || 'premium',
                  plan_type: 'monthly',
                  current_period_start: new Date().toISOString(),
                  current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                  updated_at: new Date().toISOString()
                }, { onConflict: 'user_id' });

              if (error) {
                logStep('Error upserting subscription', error);
              } else {
                logStep('Subscription created/updated successfully');
              }
            }
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          logStep('Processing invoice.payment_succeeded');
          const invoice = payload as Stripe.Invoice;
          const customerId = invoice.customer as string;

          const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .limit(1)
            .maybeSingle();

          if (subscription) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('stripe_customer_id', customerId);
            
            logStep('Payment succeeded - subscription activated');
          }
          break;
        }

        case 'invoice.payment_failed': {
          logStep('Processing invoice.payment_failed');
          const invoice = payload as Stripe.Invoice;
          const customerId = invoice.customer as string;

          const { data: subscription } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .limit(1)
            .maybeSingle();

          if (subscription) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: 'past_due',
                updated_at: new Date().toISOString()
              })
              .eq('stripe_customer_id', customerId);
            
            logStep('Payment failed - subscription marked past_due');
          }
          break;
        }

        case 'customer.subscription.deleted': {
          logStep('Processing customer.subscription.deleted');
          const subscription = payload as Stripe.Subscription;
          const subscriptionId = subscription.id;

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId);

          logStep('Subscription cancelled');
          break;
        }

        case 'customer.subscription.updated': {
          logStep('Processing customer.subscription.updated');
          const subscription = payload as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const status = subscription.status;
          const subscriptionId = subscription.id;

          const { data: existingSub } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .limit(1)
            .maybeSingle();

          if (existingSub) {
            await supabaseAdmin
              .from('subscriptions')
              .update({
                status: status,
                stripe_subscription_id: subscriptionId,
                updated_at: new Date().toISOString()
              })
              .eq('stripe_customer_id', customerId);

            logStep('Subscription updated', { status });
          }
          break;
        }

        default:
          logStep('Unhandled event type', { type: eventType });
      }

      // Audit log
      try {
        await supabaseAdmin.from('subscription_events').insert({
          user_id: null,
          stripe_event_id: event.id,
          event_type: event.type,
          payload: event.data.object,
          created_at: new Date().toISOString()
        });
      } catch (auditError) {
        logStep('Failed to insert audit log', auditError);
      }

      return new Response(JSON.stringify({ received: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (handlerError) {
      logStep('Error handling webhook event', handlerError);
      return new Response(JSON.stringify({ error: String(handlerError) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }
  } catch (error) {
    logStep('Webhook error', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});