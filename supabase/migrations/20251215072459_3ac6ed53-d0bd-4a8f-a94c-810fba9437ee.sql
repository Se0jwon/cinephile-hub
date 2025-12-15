-- Create watch_goals table for storing user watch goals
CREATE TABLE public.watch_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  target_movies INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, year)
);

-- Enable RLS
ALTER TABLE public.watch_goals ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own goals" 
ON public.watch_goals 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" 
ON public.watch_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" 
ON public.watch_goals 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" 
ON public.watch_goals 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_watch_goals_updated_at
BEFORE UPDATE ON public.watch_goals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();