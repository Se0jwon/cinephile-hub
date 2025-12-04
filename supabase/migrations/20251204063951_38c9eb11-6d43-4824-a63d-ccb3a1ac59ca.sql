-- Add tags and has_spoiler columns to reviews table
ALTER TABLE public.reviews 
ADD COLUMN tags text[] DEFAULT NULL,
ADD COLUMN has_spoiler boolean NOT NULL DEFAULT false;

-- Enable realtime for reviews table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;