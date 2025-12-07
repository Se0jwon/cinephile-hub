-- Create function for new follower notification
CREATE OR REPLACE FUNCTION public.handle_new_follower()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  follower_username text;
BEGIN
  -- Get follower username
  SELECT p.username INTO follower_username
  FROM profiles p
  WHERE p.id = NEW.follower_id;
  
  -- Check if user has new follower notifications enabled
  IF EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = NEW.following_id AND np.new_follower = true
  ) OR NOT EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = NEW.following_id
  ) THEN
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.following_id,
      'new_follower',
      '새로운 팔로워',
      COALESCE(follower_username, '익명') || '님이 회원님을 팔로우하기 시작했습니다.',
      '/profile/' || NEW.follower_id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new follower
CREATE TRIGGER on_new_follower
  AFTER INSERT ON public.follows
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_follower();

-- Create function for review like notification
CREATE OR REPLACE FUNCTION public.handle_new_review_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  review_owner_id uuid;
  liker_username text;
  movie_title text;
BEGIN
  -- Get the review owner
  SELECT r.user_id INTO review_owner_id
  FROM reviews r
  WHERE r.id = NEW.review_id;
  
  -- Don't notify if liking own review
  IF review_owner_id = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker username
  SELECT p.username INTO liker_username
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Get movie title
  SELECT m.title INTO movie_title
  FROM reviews r
  JOIN movies m ON r.movie_id = m.id
  WHERE r.id = NEW.review_id;
  
  -- Check if user has like notifications enabled
  IF EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = review_owner_id AND np.review_like = true
  ) OR NOT EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = review_owner_id
  ) THEN
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      review_owner_id,
      'review_like',
      '리뷰 좋아요',
      COALESCE(liker_username, '익명') || '님이 "' || COALESCE(movie_title, '영화') || '" 리뷰를 좋아합니다.',
      '/movie/' || (SELECT tmdb_id FROM movies WHERE id = (SELECT movie_id FROM reviews WHERE id = NEW.review_id))
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for review like
CREATE TRIGGER on_new_review_like
  AFTER INSERT ON public.review_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_review_like();