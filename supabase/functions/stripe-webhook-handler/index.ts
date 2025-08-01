
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
        
        if (customerEmail) {
          logStep("Processing checkout completion", { email: customerEmail });
          
          // Update user to premium status
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            session.metadata?.user_id || '',
            { user_metadata: { role: 'premium' } }
          );

          if (updateError) {
            logStep("Error updating user auth", { error: updateError });
          }

          // Also update any user profiles table if you have one
          const { error: profileError } = await supabaseAdmin
            .from('user_profiles')
            .update({ role: 'premium' })
            .eq('email', customerEmail);

          if (profileError) {
            logStep("No user_profiles table or update failed", { error: profileError });
          }

          logStep("User upgraded to premium", { email: customerEmail });
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (customer && !customer.deleted && customer.email) {
          logStep("Processing subscription cancellation", { email: customer.email });
          
          // Downgrade user from premium
          const { error: downgradeError } = await supabaseAdmin
            .from('user_profiles')
            .update({ role: 'free' })
            .eq('email', customer.email);

          if (downgradeError) {
            logStep("Error downgrading user", { error: downgradeError });
          }

          logStep("User downgraded to free", { email: customer.email });
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
    logStep("Webhook error", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
