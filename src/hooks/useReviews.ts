import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
    }: {
      movieId: string;
      rating: number;
      reviewText?: string;
      watchedDate?: string;
      isPublic: boolean;
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
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["user-movies"] });
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
    }: {
      reviewId: string;
      rating: number;
      reviewText?: string;
      watchedDate?: string;
      isPublic: boolean;
    }) => {
      const { data, error } = await supabase
        .from("reviews")
        .update({
          rating,
          review_text: reviewText,
          watched_date: watchedDate,
          is_public: isPublic,
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
