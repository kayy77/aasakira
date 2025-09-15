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
    
    // Try NewsAPI first
    let articles = [];
    const newsApiKey = Deno.env.get("NEWSAPI_KEY");
    
    if (newsApiKey) {
      console.log('Fetching from NewsAPI...');
      const newsRes = await fetch(
        `https://newsapi.org/v2/everything?q=forex OR stocks OR crypto OR economy OR trading OR market OR fed OR inflation OR gdp&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`
      );
      
      if (newsRes.ok) {
        const newsData = await newsRes.json();
        articles = newsData.articles || [];
        console.log(`Fetched ${articles.length} articles from NewsAPI`);
      } else {
        console.log(`NewsAPI failed: ${newsRes.status}`);
      }
    }
    
    // Fallback to Finnhub if NewsAPI failed
    if (articles.length === 0) {
      const finnhubKey = Deno.env.get("FINNHUB_KEY");
      if (finnhubKey) {
        console.log('Falling back to Finnhub...');
        const finnhubRes = await fetch(
          `https://finnhub.io/api/v1/news?category=forex&token=${finnhubKey}`
        );
        
        if (finnhubRes.ok) {
          const finnhubData = await finnhubRes.json();
          // Transform Finnhub format to match NewsAPI
          articles = finnhubData.map((item: any) => ({
            title: item.headline,
            description: item.summary,
            source: { name: item.source },
            author: null,
            url: item.url,
            publishedAt: new Date(item.datetime * 1000).toISOString(),
            content: item.summary
          }));
          console.log(`Fetched ${articles.length} articles from Finnhub`);
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