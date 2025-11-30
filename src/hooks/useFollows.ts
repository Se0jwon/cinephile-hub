import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useFollowers = (userId: string) => {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("follower_id")
        .eq("following_id", userId);

      if (error) throw error;
      return data;
    },
  });
};

export const useFollowing = (userId: string) => {
  return useQuery({
    queryKey: ["following", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", userId);

      if (error) throw error;
      return data;
    },
  });
};

export const useIsFollowing = (followingId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-following", user?.id, followingId],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", followingId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!followingId,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (followingId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("follows")
        .insert({
          follower_id: user.id,
          following_id: followingId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["is-following"] });
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (followingId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", followingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followers"] });
      queryClient.invalidateQueries({ queryKey: ["following"] });
      queryClient.invalidateQueries({ queryKey: ["is-following"] });
    },
  });
};

export const useFollowingReviews = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["following-reviews", user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get list of users I'm following
      const { data: following, error: followingError } = await supabase
        .from("follows")
        .select("following_id")
        .eq("follower_id", user.id);

      if (followingError) throw followingError;
      if (!following || following.length === 0) return [];

      const followingIds = following.map((f) => f.following_id);

      // Get reviews from users I'm following
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select("*, movies(*)")
        .in("user_id", followingIds)
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20);

      if (reviewsError) throw reviewsError;

      // Get profiles for the review authors
      const reviewsWithProfiles = await Promise.all(
        (reviews || []).map(async (review) => {
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
    enabled: !!user,
  });
};
