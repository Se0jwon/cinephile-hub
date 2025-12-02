import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export type ReactionType = "like" | "love" | "laugh" | "surprised" | "sad" | "angry";

export const useReviewReactions = (reviewId: string) => {
  return useQuery({
    queryKey: ["review-reactions", reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_reactions")
        .select("*")
        .eq("review_id", reviewId);

      if (error) throw error;
      return data || [];
    },
  });
};

export const useUserReactions = (reviewId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-reactions", reviewId, user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("review_reactions")
        .select("*")
        .eq("review_id", reviewId)
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });
};

export const useToggleReaction = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reviewId,
      reaction,
      isActive,
    }: {
      reviewId: string;
      reaction: ReactionType;
      isActive: boolean;
    }) => {
      if (!user) throw new Error("User not authenticated");

      if (isActive) {
        // Remove reaction
        const { error } = await supabase
          .from("review_reactions")
          .delete()
          .eq("review_id", reviewId)
          .eq("user_id", user.id)
          .eq("reaction", reaction);

        if (error) throw error;
      } else {
        // Add reaction
        const { error } = await supabase
          .from("review_reactions")
          .insert({
            review_id: reviewId,
            user_id: user.id,
            reaction,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-reactions"] });
      queryClient.invalidateQueries({ queryKey: ["user-reactions"] });
    },
  });
};
