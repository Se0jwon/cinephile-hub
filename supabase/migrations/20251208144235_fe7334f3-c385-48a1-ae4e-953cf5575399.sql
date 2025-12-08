
-- Create function to handle list collaboration notifications
CREATE OR REPLACE FUNCTION public.handle_new_list_collaborator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  list_owner_username text;
  list_name_val text;
BEGIN
  -- Get list owner username
  SELECT p.username INTO list_owner_username
  FROM movie_lists ml
  JOIN profiles p ON ml.user_id = p.id
  WHERE ml.id = NEW.list_id;
  
  -- Get list name
  SELECT ml.name INTO list_name_val
  FROM movie_lists ml
  WHERE ml.id = NEW.list_id;
  
  -- Check if user has list collaboration notifications enabled
  IF EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = NEW.user_id AND np.list_collaboration = true
  ) OR NOT EXISTS (
    SELECT 1 FROM notification_preferences np
    WHERE np.user_id = NEW.user_id
  ) THEN
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_id,
      'list_collaboration',
      '리스트 협업 초대',
      COALESCE(list_owner_username, '익명') || '님이 "' || COALESCE(list_name_val, '영화 리스트') || '" 리스트에 협업자로 초대했습니다.',
      '/lists'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for list collaboration
DROP TRIGGER IF EXISTS on_new_list_collaborator ON public.list_collaborators;
CREATE TRIGGER on_new_list_collaborator
  AFTER INSERT ON public.list_collaborators
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_list_collaborator();

-- Create function to handle new review from following notifications
CREATE OR REPLACE FUNCTION public.handle_new_review_from_following()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  reviewer_username text;
  movie_title_val text;
  follower_record RECORD;
BEGIN
  -- Get reviewer username
  SELECT p.username INTO reviewer_username
  FROM profiles p
  WHERE p.id = NEW.user_id;
  
  -- Get movie title
  SELECT m.title INTO movie_title_val
  FROM movies m
  WHERE m.id = NEW.movie_id;
  
  -- Only notify for public reviews
  IF NEW.is_public = false THEN
    RETURN NEW;
  END IF;
  
  -- Loop through all followers and create notifications
  FOR follower_record IN 
    SELECT f.follower_id 
    FROM follows f 
    WHERE f.following_id = NEW.user_id
  LOOP
    -- Check if follower has new review notifications enabled
    IF EXISTS (
      SELECT 1 FROM notification_preferences np
      WHERE np.user_id = follower_record.follower_id AND np.new_review_from_following = true
    ) OR NOT EXISTS (
      SELECT 1 FROM notification_preferences np
      WHERE np.user_id = follower_record.follower_id
    ) THEN
      -- Create notification
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (
        follower_record.follower_id,
        'new_review_from_following',
        '새 리뷰',
        COALESCE(reviewer_username, '익명') || '님이 "' || COALESCE(movie_title_val, '영화') || '"에 대한 리뷰를 작성했습니다.',
        '/movie/' || (SELECT tmdb_id FROM movies WHERE id = NEW.movie_id)
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new review from following
DROP TRIGGER IF EXISTS on_new_review_from_following ON public.reviews;
CREATE TRIGGER on_new_review_from_following
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_review_from_following();
