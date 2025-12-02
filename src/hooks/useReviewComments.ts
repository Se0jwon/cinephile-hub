import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useReviewComments = (reviewId: string) => {
  return useQuery({
    queryKey: ["review-comments", reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("review_comments")
        .select("*")
        .eq("review_id", reviewId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", comment.user_id)
            .maybeSingle();

          return {
            ...comment,
            profiles: profile,
          };
        })
      );

      return commentsWithProfiles;
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      reviewId,
      commentText,
    }: {
      reviewId: string;
      commentText: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("review_comments")
        .insert({
          review_id: reviewId,
          user_id: user.id,
          comment_text: commentText,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-comments"] });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("review_comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["review-comments"] });
    },
  });
};
