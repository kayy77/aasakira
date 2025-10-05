import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BrevoContactRequest {
  email: string;
  attributes?: {
    FIRSTNAME?: string;
    LASTNAME?: string;
    COUNTRY?: string;
    [key: string]: any;
  };
  listIds?: number[];
}

function logStep(step: string, details?: any) {
  console.log(`[Brevo Contact] ${step}`, details ? JSON.stringify(details, null, 2) : '');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY not configured");
    }

    const { email, attributes = {}, listIds = [] }: BrevoContactRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    logStep('Adding contact to Brevo', { email, attributes });

    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brevoApiKey
      },
      body: JSON.stringify({
        email,
        attributes,
        listIds,
        updateEnabled: true // Update if contact exists
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Check if contact already exists (common case)
      if (data.code === 'duplicate_parameter') {
        logStep('Contact already exists, updating instead');
        
        // Update existing contact
        const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'api-key': brevoApiKey
          },
          body: JSON.stringify({
            attributes,
            listIds
          })
        });

        if (!updateResponse.ok) {
          const updateData = await updateResponse.json();
          throw new Error(`Failed to update contact: ${JSON.stringify(updateData)}`);
        }

        logStep('Contact updated successfully');
        return new Response(JSON.stringify({ success: true, updated: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      throw new Error(`Brevo API error: ${JSON.stringify(data)}`);
    }

    logStep('Contact added successfully', data);

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    logStep('Error adding contact', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error) 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});