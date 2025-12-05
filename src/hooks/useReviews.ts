import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

// Function to notify followers when a new public review is added
const notifyFollowers = async (userId: string, movieTitle: string, tmdbId: number) => {
  // Get all followers of this user
  const { data: followers } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', userId);

  if (!followers || followers.length === 0) return;

  // Get the reviewer's username
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', userId)
    .single();

  const username = profile?.username || '사용자';

  // Create notifications for all followers
  const notifications = followers.map(follower => ({
    user_id: follower.follower_id,
    type: 'new_review',
    title: `${username}님이 새 리뷰를 작성했습니다`,
    message: `"${movieTitle}"에 대한 리뷰를 확인해보세요!`,
    link: `/movie/${tmdbId}`,
  }));

  await supabase.from('notifications').insert(notifications);
};

export const useMovieReviews = (tmdbId: number) => {
  return useQuery({
    queryKey: ["movie-reviews", tmdbId],
    queryFn: async () => {
      const { data: moviesData, error: moviesError } = await supabase
        .from("movies")
        .select("id")
        .eq("tmdb_id", tmdbId);

      if (moviesError) throw moviesError;
      if (!moviesData || moviesData.length === 0) return [];

      const movieIds = moviesData.map((m) => m.id);

      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .in("movie_id", movieIds)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewsWithProfiles = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", review.user_id)
            .maybeSingle();

          return {
            ...review,
            profiles: profile,
          };
        })
      );

      return reviewsWithProfiles;
    },
  });
};

export const useAddReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      movieId,
      rating,
      reviewText,
      watchedDate,
      isPublic,
      tags,
      hasSpoiler,
    }: {
      movieId: string;
      rating: number;
      reviewText?: string;
      watchedDate?: string;
      isPublic: boolean;
      tags?: string[];
      hasSpoiler?: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("reviews")
        .insert({
          user_id: user.id,
          movie_id: movieId,
          rating,
          review_text: reviewText,
          watched_date: watchedDate,
          is_public: isPublic,
          tags: tags || null,
          has_spoiler: hasSpoiler || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-movies"] });
      queryClient.invalidateQueries({ queryKey: ["following-reviews"] });
      
      // Notify followers if review is public
      if (variables.isPublic && user) {
        // Get movie details for notification
        const { data: movie } = await supabase
          .from('movies')
          .select('title, tmdb_id')
          .eq('id', variables.movieId)
          .single();
        
        if (movie) {
          notifyFollowers(user.id, movie.title, movie.tmdb_id);
        }
      }
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      reviewId,
      rating,
      reviewText,
      watchedDate,
      isPublic,
      tags,
      hasSpoiler,
    }: {
      reviewId: string;
      rating: number;
      reviewText?: string;
      watchedDate?: string;
      isPublic: boolean;
      tags?: string[];
      hasSpoiler?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          rating,
          review_text: reviewText,
          watched_date: watchedDate,
          is_public: isPublic,
          tags: tags || null,
          has_spoiler: hasSpoiler || false,
        })
        .eq("id", reviewId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-movies"] });
      queryClient.invalidateQueries({ queryKey: ["following-reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-movies"] });
    },
  });
};
