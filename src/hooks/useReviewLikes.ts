import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useReviewLikes = (reviewId: string) => {
  return useQuery({
    queryKey: ['review-likes', reviewId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('review_likes')
        .select('*')
        .eq('review_id', reviewId);
      
      if (error) throw error;
      return data;
    },
  });
};

export const useUserLikedReview = (reviewId: string, userId?: string) => {
  return useQuery({
    queryKey: ['user-liked-review', reviewId, userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!userId,
  });
};

export const useToggleReviewLike = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ reviewId, userId, isLiked }: { 
      reviewId: string; 
      userId: string; 
      isLiked: boolean 
    }) => {
      if (isLiked) {
        const { error } = await supabase
          .from('review_likes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('review_likes')
          .insert({ review_id: reviewId, user_id: userId });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review-likes', variables.reviewId] });
      queryClient.invalidateQueries({ queryKey: ['user-liked-review', variables.reviewId, variables.userId] });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
