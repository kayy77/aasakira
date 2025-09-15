import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting AI news fetch...');
    
    let articles = [];
    const fcsApiKey = Deno.env.get("FCS_API_KEY");
    
    if (fcsApiKey) {
      console.log('Fetching forex news from FCS API...');
      const fcsNewsRes = await fetch(
        `https://fcsapi.com/api-v3/forex/news?access_key=${fcsApiKey}&limit=30`
      );
      
      if (fcsNewsRes.ok) {
        const fcsData = await fcsNewsRes.json();
        const fcsArticles = fcsData.response || [];
        
        // Transform FCS format to standard format
        articles = fcsArticles.map((item: any) => ({
          title: item.title,
          description: item.content || item.description || '',
          source: { name: 'FCS Financial News' },
          author: null,
          url: item.url || '#',
          publishedAt: new Date(item.date * 1000).toISOString(), // Convert Unix timestamp
          content: item.content || item.description || ''
        }));
        console.log(`Fetched ${articles.length} articles from FCS API`);
      } else {
        console.log(`FCS API failed: ${fcsNewsRes.status}`);
      }
    }
    
    // Try NewsAPI as backup if available
    if (articles.length === 0) {
      const newsApiKey = Deno.env.get("NEWSAPI_KEY");
      if (newsApiKey) {
        console.log('Falling back to NewsAPI...');
        const newsRes = await fetch(
          `https://newsapi.org/v2/everything?q=forex OR trading OR market OR economy&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`
        );
        
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          articles = newsData.articles || [];
          console.log(`Fetched ${articles.length} articles from NewsAPI`);
        } else {
          console.log(`NewsAPI failed: ${newsRes.status}`);
        }
      }
    }

    if (articles.length === 0) {
      console.log('No articles found from any provider');
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'No news providers available or returned data' 
      }), { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // Filter out articles without essential data
    const validArticles = articles.filter((a: any) => 
      a.title && a.url && a.publishedAt
    );

    console.log(`Processing ${validArticles.length} valid articles`);

    // Transform articles for database insertion
    const rows = validArticles.map((a: any) => ({
      title: a.title,
      description: a.description || a.summary || '',
      source: a.source?.name || 'Unknown',
      author: a.author,
      url: a.url,
      published_at: a.publishedAt,
      content: a.content || a.description || a.summary || ''
    }));

    // Insert into Supabase with conflict resolution
    const { data, error } = await supabase
      .from("ai_news")
      .upsert(rows, { 
        onConflict: 'url',
        ignoreDuplicates: true 
      })
      .select();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Successfully inserted/updated ${data?.length || 0} articles`);

    return new Response(JSON.stringify({ 
      success: true,
      articlesProcessed: validArticles.length,
      inserted: data?.length || 0,
      message: `Processed ${validArticles.length} articles, inserted ${data?.length || 0} new ones`
    }), { 
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error('Error in fetch-ai-news:', err);
    return new Response(JSON.stringify({ 
      success: false,
      error: (err as Error).message 
    }), { 
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});