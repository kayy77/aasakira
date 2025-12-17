import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const status = url.searchParams.get('status'); // PARSED, REJECTED, or null for all
    const symbol = url.searchParams.get('symbol');
    const limit = parseInt(url.searchParams.get('limit') || '50');

    let query = supabase
      .from('parsed_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) {
      query = query.eq('status', status.toUpperCase());
    }

    if (symbol) {
      query = query.eq('symbol', symbol.toUpperCase());
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching parsed signals:', error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group by status for summary
    const parsed = data?.filter(s => s.status === 'PARSED') || [];
    const rejected = data?.filter(s => s.status === 'REJECTED') || [];

    return new Response(
      JSON.stringify({ 
        success: true, 
        signals: data,
        summary: {
          total: data?.length || 0,
          parsed: parsed.length,
          rejected: rejected.length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});