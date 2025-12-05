import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useSuggestedFollowers = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['suggested-followers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      // Get list of users the current user is already following
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = followingData?.map(f => f.following_id) || [];
      followingIds.push(user.id); // Exclude self

      // Get profiles with review counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .not('id', 'in', `(${followingIds.join(',')})`);

      if (profilesError) throw profilesError;

      // Get review counts for each profile
      const profilesWithStats = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { count: reviewCount } = await supabase
            .from('reviews')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .eq('is_public', true);

          const { count: followersCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profile.id);

          return {
            ...profile,
            reviewCount: reviewCount || 0,
            followersCount: followersCount || 0,
            score: (reviewCount || 0) * 2 + (followersCount || 0), // Weighted score
          };
        })
      );

      // Sort by score and return top 5
      return profilesWithStats
        .filter(p => p.reviewCount > 0) // Only users with at least 1 review
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    },
    enabled: !!user?.id,
  });
};
