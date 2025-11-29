-- Create review_likes table for like/reaction functionality
CREATE TABLE public.review_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(review_id, user_id)
);

ALTER TABLE public.review_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all review likes"
  ON public.review_likes
  FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own likes"
  ON public.review_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON public.review_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create movie_lists table for shared movie collections
CREATE TABLE public.movie_lists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.movie_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public lists or their own lists"
  ON public.movie_lists
  FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists"
  ON public.movie_lists
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
  ON public.movie_lists
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
  ON public.movie_lists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create list_movies table (junction table)
CREATE TABLE public.list_movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.movie_lists(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  poster_path TEXT,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(list_id, tmdb_id)
);

ALTER TABLE public.list_movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view movies in public lists or their own lists"
  ON public.list_movies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists
      WHERE movie_lists.id = list_movies.list_id
      AND (movie_lists.is_public = true OR movie_lists.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert movies to their own lists"
  ON public.list_movies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movie_lists
      WHERE movie_lists.id = list_movies.list_id
      AND movie_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete movies from their own lists"
  ON public.list_movies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists
      WHERE movie_lists.id = list_movies.list_id
      AND movie_lists.user_id = auth.uid()
    )
  );

-- Create trigger for updating movie_lists updated_at
CREATE TRIGGER update_movie_lists_updated_at
  BEFORE UPDATE ON public.movie_lists
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();