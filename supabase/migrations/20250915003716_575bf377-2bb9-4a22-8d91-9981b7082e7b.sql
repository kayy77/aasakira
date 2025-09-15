-- Create ai_news table for storing live news articles
CREATE TABLE IF NOT EXISTS public.ai_news (
  id BIGSERIAL PRIMARY KEY,
  title TEXT,
  description TEXT,
  source TEXT,
  author TEXT,
  url TEXT UNIQUE,
  content TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_news ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to news
CREATE POLICY "AI news is viewable by everyone" 
ON public.ai_news 
FOR SELECT 
USING (true);

-- Service role can manage news
CREATE POLICY "Service role can manage AI news" 
ON public.ai_news 
FOR ALL 
USING (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_ai_news_published_at ON public.ai_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_news_url ON public.ai_news(url);