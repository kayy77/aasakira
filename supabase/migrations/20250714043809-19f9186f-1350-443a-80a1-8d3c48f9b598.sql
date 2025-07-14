-- Create comprehensive user activity tracking tables
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'signal_view', 'meme_scan', 'trade_game', 'chat_message', 'chart_analysis'
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user progress tracking
CREATE TABLE public.user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_study_time_minutes INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  charts_analyzed INTEGER NOT NULL DEFAULT 0,
  signals_viewed INTEGER NOT NULL DEFAULT 0,
  meme_coins_scanned INTEGER NOT NULL DEFAULT 0,
  trading_games_played INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  current_streak INTEGER NOT NULL DEFAULT 0,
  max_streak INTEGER NOT NULL DEFAULT 0,
  skills_mastered TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  trading_style TEXT,
  risk_tolerance TEXT,
  preferred_timeframes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create learning sessions tracking
CREATE TABLE public.learning_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL, -- 'chat', 'chart_analysis', 'course', 'trading_game'
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  interactions_count INTEGER DEFAULT 0,
  performance_score DECIMAL(5,2),
  topics_covered TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create AI memory for personalized responses
CREATE TABLE public.ai_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  memory_type TEXT NOT NULL, -- 'conversation', 'preference', 'mistake', 'strength'
  content TEXT NOT NULL,
  importance_score INTEGER DEFAULT 5, -- 1-10 scale
  context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;

-- Create policies for user activities
CREATE POLICY "Users can view their own activities" 
ON public.user_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
ON public.user_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for user progress
CREATE POLICY "Users can view their own progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.user_progress 
FOR ALL
USING (auth.uid() = user_id);

-- Create policies for learning sessions
CREATE POLICY "Users can manage their own sessions" 
ON public.learning_sessions 
FOR ALL
USING (auth.uid() = user_id);

-- Create policies for AI memory
CREATE POLICY "Users can manage their own AI memory" 
ON public.ai_memory 
FOR ALL
USING (auth.uid() = user_id);

-- Create function to update user progress
CREATE OR REPLACE FUNCTION public.update_user_progress(
  p_user_id UUID,
  p_activity_type TEXT,
  p_performance_score DECIMAL DEFAULT NULL,
  p_duration_minutes INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Insert or update user progress
  INSERT INTO public.user_progress (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Update specific metrics based on activity type
  UPDATE public.user_progress SET
    total_study_time_minutes = total_study_time_minutes + COALESCE(p_duration_minutes, 0),
    messages_sent = CASE WHEN p_activity_type = 'chat_message' THEN messages_sent + 1 ELSE messages_sent END,
    charts_analyzed = CASE WHEN p_activity_type = 'chart_analysis' THEN charts_analyzed + 1 ELSE charts_analyzed END,
    signals_viewed = CASE WHEN p_activity_type = 'signal_view' THEN signals_viewed + 1 ELSE signals_viewed END,
    meme_coins_scanned = CASE WHEN p_activity_type = 'meme_scan' THEN meme_coins_scanned + 1 ELSE meme_coins_scanned END,
    trading_games_played = CASE WHEN p_activity_type = 'trade_game' THEN trading_games_played + 1 ELSE trading_games_played END,
    updated_at = now()
  WHERE user_id = p_user_id;
  
  -- Update win rate and streak if performance score provided
  IF p_performance_score IS NOT NULL THEN
    UPDATE public.user_progress SET
      win_rate = (
        SELECT AVG(performance_score)
        FROM public.learning_sessions 
        WHERE user_id = p_user_id AND performance_score IS NOT NULL
      ),
      current_streak = CASE 
        WHEN p_performance_score >= 70 THEN current_streak + 1 
        ELSE 0 
      END,
      max_streak = CASE 
        WHEN p_performance_score >= 70 AND current_streak + 1 > max_streak 
        THEN current_streak + 1 
        ELSE max_streak 
      END
    WHERE user_id = p_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_progress_updated_at
BEFORE UPDATE ON public.user_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_memory_updated_at
BEFORE UPDATE ON public.ai_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();