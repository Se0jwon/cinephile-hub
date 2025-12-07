-- Create function to automatically create notification when a comment is added
CREATE OR REPLACE FUNCTION public.handle_new_review_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  review_owner_id uuid;
  commenter_username text;
  movie_title text;
BEGIN
  -- Get the review owner
  SELECT r.user_id INTO review_owner_id
  FROM reviews r
  WHERE r.id = NEW.review_id;
  
  -- Don't notify if commenting on own review
  IF review_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get commenter username
  SELECT p.username INTO commenter_username
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Get movie title
  SELECT m.title INTO movie_title
  FROM reviews r
  JOIN movies m ON r.movie_id = m.id
  WHERE r.id = NEW.review_id;
  
  -- Check if user has comment notifications enabled
  IF EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = review_owner_id AND np.review_comment = true
  ) OR NOT EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = review_owner_id
  ) THEN
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      review_owner_id,
      'review_comment',
      '새로운 댓글',
      COALESCE(commenter_username, '익명') || '님이 "' || COALESCE(movie_title, '영화') || '" 리뷰에 댓글을 남겼습니다.',
      '/movie/' || (SELECT tmdb_id FROM movies WHERE id = (SELECT movie_id FROM reviews WHERE id = NEW.review_id))
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new comments
DROP TRIGGER IF EXISTS on_review_comment_created ON public.review_comments;
CREATE TRIGGER on_review_comment_created
  AFTER INSERT ON public.review_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_review_comment();