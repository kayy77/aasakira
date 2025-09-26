import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (req.method === 'POST') {
      const body = await req.json()
      console.log("Incoming ManyChat Signal:", body)

      // Save the incoming signal data to a signals table
      // You can customize this based on your signal structure
      const { data, error } = await supabase
        .from('incoming_signals')
        .insert({
          source: 'manychat',
          raw_data: body,
          timestamp: new Date().toISOString(),
          processed: false
        })

      if (error) {
        console.error('Database error:', error)
        return new Response(
          JSON.stringify({ success: false, error: error.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('Signal saved successfully:', data)

      // Trigger your signal processing engine here if needed
      // await processSignal(body)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Signal received and stored',
          id: (data as any)?.[0]?.id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})