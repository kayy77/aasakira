import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
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
    
    if (!stripeKey) {
      logStep("ERROR", "STRIPE_SECRET_KEY not configured");
      return new Response(JSON.stringify({ error: "Stripe not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    let event: Stripe.Event;
    
    // Verify webhook signature if secret is configured
    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        logStep('Webhook signature verified', { type: event.type, id: event.id });
      } catch (err) {
        logStep('Webhook signature verification failed', err);
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      // Parse without verification (for development/testing)
      event = JSON.parse(body);
      logStep('Event received (unverified)', { type: event.type, id: event.id });
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
            // Get subscription details for period end
            let periodEnd: string | null = null;
            if (subscriptionId) {
              try {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                periodEnd = new Date(subscription.current_period_end * 1000).toISOString();
              } catch (e) {
                logStep('Could not fetch subscription details', e);
                periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
              }
            }

            // Find user by email using auth admin
            const { data: users } = await supabaseAdmin.auth.admin.listUsers();
            const user = users?.users?.find(u => u.email === email);
            const userId = user?.id || session.metadata?.user_id;

            if (userId) {
              // Update user_profiles - grant premium access
              const { error: profileError } = await supabaseAdmin
                .from('user_profiles')
                .update({
                  is_premium: true,
                  subscription_status: 'active',
                  stripe_customer_id: customerId,
                  stripe_subscription_id: subscriptionId,
                  premium_expires_at: periodEnd,
                  plan_type: 'premium',
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

              if (profileError) {
                logStep('Error updating user_profiles', profileError);
              } else {
                logStep('✅ Premium access granted via user_profiles', { userId, email });
              }
            }

            // Upsert subscription record
            const { error: subError } = await supabaseAdmin
              .from('subscriptions')
              .upsert({
                user_id: userId,
                email: email,
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                status: 'active',
                plan_name: 'premium',
                plan_type: 'monthly',
                current_period_start: new Date().toISOString(),
                current_period_end: periodEnd,
                updated_at: new Date().toISOString()
              }, { onConflict: 'email' });

            if (subError) {
              logStep('Error upserting subscription', subError);
            } else {
              logStep('Subscription created/updated successfully');
            }

            // Update Premium table
            const { error: premiumError } = await supabaseAdmin
              .from('Premium')
              .upsert({
                email: email,
                user_id: userId,
                subscribed: true,
                stripe_customer_id: customerId,
                subscription_tier: 'premium',
                subscription_end: periodEnd,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'email' });

            if (premiumError) {
              logStep('Error updating Premium table', premiumError);
            }
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          logStep('Processing invoice.payment_succeeded');
          const invoice = payload as Stripe.Invoice;
          const customerId = invoice.customer as string;
          const customerEmail = invoice.customer_email;

          // Update subscription status
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);

          // Ensure premium access is active
          await supabaseAdmin
            .from('user_profiles')
            .update({
              is_premium: true,
              subscription_status: 'active',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);
          
          logStep('✅ Payment succeeded - premium access confirmed', { customerId, customerEmail });
          break;
        }

        case 'invoice.payment_failed': {
          logStep('Processing invoice.payment_failed');
          const invoice = payload as Stripe.Invoice;
          const customerId = invoice.customer as string;

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);

          await supabaseAdmin
            .from('user_profiles')
            .update({
              subscription_status: 'past_due',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);
          
          logStep('⚠️ Payment failed - subscription marked past_due', { customerId });
          break;
        }

        case 'customer.subscription.deleted': {
          logStep('Processing customer.subscription.deleted');
          const subscription = payload as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const subscriptionId = subscription.id;

          // Revoke premium access
          await supabaseAdmin
            .from('user_profiles')
            .update({
              is_premium: false,
              subscription_status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: 'canceled',
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscriptionId);

          await supabaseAdmin
            .from('Premium')
            .update({
              subscribed: false,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);

          logStep('❌ Subscription cancelled - premium access revoked', { customerId });
          break;
        }

        case 'customer.subscription.updated': {
          logStep('Processing customer.subscription.updated');
          const subscription = payload as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const status = subscription.status;
          const subscriptionId = subscription.id;
          const periodEnd = new Date(subscription.current_period_end * 1000).toISOString();

          const isPremium = status === 'active' || status === 'trialing';

          await supabaseAdmin
            .from('user_profiles')
            .update({
              is_premium: isPremium,
              subscription_status: status,
              premium_expires_at: periodEnd,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: status,
              stripe_subscription_id: subscriptionId,
              current_period_end: periodEnd,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_customer_id', customerId);

          logStep('Subscription updated', { status, isPremium, periodEnd });
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
