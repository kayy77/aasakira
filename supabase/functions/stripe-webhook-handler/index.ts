
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Webhook received");

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
      logStep("Webhook verified", { type: event.type });
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err });
      return new Response(`Webhook Error: ${err}`, { status: 400 });
    }

    // Handle the event
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail = session.customer_details?.email;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        
        if (customerEmail) {
          logStep("Processing checkout completion", { email: customerEmail, customerId, subscriptionId });
          
          // Find user by email
          const { data: users, error: userFetchError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (userFetchError) {
            logStep("Error fetching users", { error: userFetchError });
            return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
          }
          
          const user = users.users.find(u => u.email === customerEmail);
          
          if (user) {
            // Update user metadata
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
              user.id,
              { user_metadata: { ...user.user_metadata, role: 'premium', subscription_tier: 'premium' } }
            );

            if (updateError) {
              logStep("Error updating user auth", { error: updateError });
            }

            // Update subscribers table
            const { error: subscriberError } = await supabaseAdmin
              .from('subscribers')
              .upsert({
                user_id: user.id,
                email: customerEmail,
                subscribed: true,
                subscription_tier: 'premium',
                stripe_customer_id: customerId,
                updated_at: new Date().toISOString()
              }, { onConflict: 'email' });

            if (subscriberError) {
              logStep("Error updating subscribers table", { error: subscriberError });
            }

            // Update user_profiles table
            const { error: profileError } = await supabaseAdmin
              .from('user_profiles')
              .update({
                is_premium: true,
                plan_type: 'monthly',
                stripe_customer_id: customerId,
                stripe_subscription_id: subscriptionId,
                subscription_status: 'active',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);

            if (profileError) {
              logStep("Error updating user_profiles table", { error: profileError });
            }

            // Log event
            await supabaseAdmin.from('subscription_events').insert({
              user_id: user.id,
              stripe_event_id: event.id,
              event_type: event.type,
              payload: event.data.object,
            });

            logStep("User upgraded to premium", { email: customerEmail, userId: user.id });
          } else {
            logStep("User not found", { email: customerEmail });
          }
        }
        break;

      case 'invoice.payment_succeeded':
        const successInvoice = event.data.object as Stripe.Invoice;
        const successCustomerId = successInvoice.customer as string;
        
        const { data: successUsers } = await supabaseAdmin.auth.admin.listUsers();
        const successUser = successUsers.users.find(u => u.user_metadata?.stripe_customer_id === successCustomerId);
        
        if (successUser) {
          await supabaseAdmin.from('user_profiles').update({
            is_premium: true,
            subscription_status: 'active',
            updated_at: new Date().toISOString()
          }).eq('user_id', successUser.id);
          
          await supabaseAdmin.from('subscription_events').insert({
            user_id: successUser.id,
            stripe_event_id: event.id,
            event_type: event.type,
            payload: event.data.object,
          });
          
          logStep("Payment succeeded", { userId: successUser.id });
        }
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        const failedCustomerId = failedInvoice.customer as string;
        
        const { data: failedUsers } = await supabaseAdmin.auth.admin.listUsers();
        const failedUser = failedUsers.users.find(u => u.user_metadata?.stripe_customer_id === failedCustomerId);
        
        if (failedUser) {
          await supabaseAdmin.from('user_profiles').update({
            is_premium: false,
            subscription_status: 'past_due',
            updated_at: new Date().toISOString()
          }).eq('user_id', failedUser.id);
          
          await supabaseAdmin.from('subscription_events').insert({
            user_id: failedUser.id,
            stripe_event_id: event.id,
            event_type: event.type,
            payload: event.data.object,
          });
          
          logStep("Payment failed", { userId: failedUser.id });
        }
        break;

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        const subCustomerId = subscription.customer as string;
        const status = subscription.status;
        
        const { data: subUsers } = await supabaseAdmin.auth.admin.listUsers();
        const subUser = subUsers.users.find(u => u.user_metadata?.stripe_customer_id === subCustomerId);
        
        if (subUser) {
          const isPremium = status === 'active' || status === 'trialing';
          
          await supabaseAdmin.auth.admin.updateUserById(
            subUser.id,
            { user_metadata: { ...subUser.user_metadata, role: isPremium ? 'premium' : 'free' } }
          );
          
          await supabaseAdmin.from('subscribers').update({ 
            subscribed: isPremium, 
            subscription_tier: isPremium ? 'premium' : 'free',
            updated_at: new Date().toISOString() 
          }).eq('user_id', subUser.id);
          
          await supabaseAdmin.from('user_profiles').update({
            is_premium: isPremium,
            subscription_status: status,
            stripe_subscription_id: subscription.id,
            updated_at: new Date().toISOString()
          }).eq('user_id', subUser.id);
          
          await supabaseAdmin.from('subscription_events').insert({
            user_id: subUser.id,
            stripe_event_id: event.id,
            event_type: event.type,
            payload: event.data.object,
          });

          logStep("Subscription updated", { userId: subUser.id, status, isPremium });
        }
        break;

      default:
        logStep(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("Webhook error", { error: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
