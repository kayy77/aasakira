
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
          
          // Find user by email and update to premium status
          const { data: users, error: userFetchError } = await supabaseAdmin.auth.admin.listUsers();
          
          if (userFetchError) {
            logStep("Error fetching users", { error: userFetchError });
            return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
          }
          
          const user = users.users.find(u => u.email === customerEmail);
          
          if (user) {
            // Update user metadata to premium
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
                updated_at: new Date().toISOString()
              }, { onConflict: 'email' });

            if (subscriberError) {
              logStep("Error updating subscribers table", { error: subscriberError });
            }

            logStep("User upgraded to premium", { email: customerEmail, userId: user.id });
          } else {
            logStep("User not found", { email: customerEmail });
          }
        }
        break;

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        
        if (customer && !customer.deleted && customer.email) {
          logStep("Processing subscription cancellation", { email: customer.email });
          
          // Find user by email and downgrade
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const user = users.users.find(u => u.email === customer.email);
          
          if (user) {
            // Update user metadata to free
            await supabaseAdmin.auth.admin.updateUserById(
              user.id,
              { user_metadata: { ...user.user_metadata, role: 'free', subscription_tier: 'free' } }
            );
            
            // Update subscribers table
            await supabaseAdmin
              .from('subscribers')
              .update({ 
                subscribed: false, 
                subscription_tier: 'free',
                updated_at: new Date().toISOString() 
              })
              .eq('email', customer.email);

            logStep("User downgraded to free", { email: customer.email });
          }
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
