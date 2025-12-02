-- Create list_collaborators table for list sharing/collaboration
CREATE TABLE public.list_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES public.movie_lists(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  can_edit BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(list_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.list_collaborators ENABLE ROW LEVEL SECURITY;

-- Create policies for list_collaborators
CREATE POLICY "List owners can manage collaborators"
  ON public.list_collaborators
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists
      WHERE movie_lists.id = list_collaborators.list_id
      AND movie_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view collaborators of lists they can access"
  ON public.list_collaborators
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists
      WHERE movie_lists.id = list_collaborators.list_id
      AND (movie_lists.is_public = true OR movie_lists.user_id = auth.uid())
    )
    OR user_id = auth.uid()
  );

-- Create index for faster queries
CREATE INDEX idx_list_collaborators_list_id ON public.list_collaborators(list_id);
CREATE INDEX idx_list_collaborators_user_id ON public.list_collaborators(user_id);

-- Create review_reactions table for emoji reactions on reviews
CREATE TYPE public.reaction_type AS ENUM ('like', 'love', 'laugh', 'surprised', 'sad', 'angry');

CREATE TABLE public.review_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction reaction_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(review_id, user_id, reaction)
);

-- Enable Row Level Security
ALTER TABLE public.review_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for review_reactions
CREATE POLICY "Users can view reactions on public reviews"
  ON public.review_reactions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = review_reactions.review_id
      AND reviews.is_public = true
    )
  );

CREATE POLICY "Users can add their own reactions"
  ON public.review_reactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON public.review_reactions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_review_reactions_review_id ON public.review_reactions(review_id);
CREATE INDEX idx_review_reactions_user_id ON public.review_reactions(user_id);

-- Update RLS policies for list_movies to allow collaborators to edit
DROP POLICY IF EXISTS "Users can insert movies to their own lists" ON public.list_movies;
DROP POLICY IF EXISTS "Users can delete movies from their own lists" ON public.list_movies;

CREATE POLICY "Users can insert movies to lists they own or collaborate on"
  ON public.list_movies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.movie_lists
      WHERE movie_lists.id = list_movies.list_id
      AND movie_lists.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.list_id = list_movies.list_id
      AND list_collaborators.user_id = auth.uid()
      AND list_collaborators.can_edit = true
    )
  );

CREATE POLICY "Users can delete movies from lists they own or collaborate on"
  ON public.list_movies
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.movie_lists
      WHERE movie_lists.id = list_movies.list_id
      AND movie_lists.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.list_collaborators
      WHERE list_collaborators.list_id = list_movies.list_id
      AND list_collaborators.user_id = auth.uid()
      AND list_collaborators.can_edit = true
    )
  );