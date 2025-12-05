import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  new_follower: boolean;
  new_review_from_following: boolean;
  review_like: boolean;
  review_comment: boolean;
  list_collaboration: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationPreferences = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Return default preferences if none exist
      if (!data) {
        return {
          new_follower: true,
          new_review_from_following: true,
          review_like: true,
          review_comment: true,
          list_collaboration: true,
        } as Partial<NotificationPreferences>;
      }
      
      return data as NotificationPreferences;
    },
    enabled: !!user?.id,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error("Not authenticated");

      // Check if preferences exist
      const { data: existing } = await supabase
        .from('notification_preferences')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('notification_preferences')
          .update(preferences)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            ...preferences,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
    },
  });
};
