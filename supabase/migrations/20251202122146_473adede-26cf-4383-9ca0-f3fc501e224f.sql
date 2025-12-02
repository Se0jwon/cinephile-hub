-- Create review_comments table for review commenting feature
CREATE TABLE public.review_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.review_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for review_comments
CREATE POLICY "Users can view comments on public reviews"
  ON public.review_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.reviews
      WHERE reviews.id = review_comments.review_id
      AND reviews.is_public = true
    )
  );

CREATE POLICY "Users can insert their own comments"
  ON public.review_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.review_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.review_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_review_comments_review_id ON public.review_comments(review_id);
CREATE INDEX idx_review_comments_user_id ON public.review_comments(user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_review_comments_updated_at
  BEFORE UPDATE ON public.review_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();