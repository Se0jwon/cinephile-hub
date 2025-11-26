-- Create movies table for user's saved movies
CREATE TABLE IF NOT EXISTS public.movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  overview TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  release_date TEXT,
  vote_average NUMERIC(3,1),
  genres TEXT[],
  director TEXT,
  runtime INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, tmdb_id)
);

-- Create reviews table for user's movie reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 10),
  review_text TEXT,
  watched_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, movie_id)
);

-- Enable Row Level Security
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for movies table
CREATE POLICY "Users can view their own movies"
  ON public.movies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own movies"
  ON public.movies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own movies"
  ON public.movies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own movies"
  ON public.movies FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reviews table
CREATE POLICY "Users can view their own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for reviews table
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_movies_user_id ON public.movies(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_tmdb_id ON public.movies(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie_id ON public.reviews(movie_id);