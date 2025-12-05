import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const REVIEW_TAGS: Record<string, { label: string; emoji: string }> = {
  touching: { label: "감동적인", emoji: "😢" },
  funny: { label: "재미있는", emoji: "😂" },
  scary: { label: "무서운", emoji: "😱" },
  "thought-provoking": { label: "생각하게 하는", emoji: "🤔" },
  romantic: { label: "로맨틱한", emoji: "💕" },
  exciting: { label: "긴장감 넘치는", emoji: "🔥" },
  beautiful: { label: "아름다운", emoji: "✨" },
  boring: { label: "지루한", emoji: "😴" },
};

export const useUserStats = (userId?: string) => {
  return useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      // Get total movies
      const { count: moviesCount } = await supabase
        .from('movies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get total reviews
      const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Get reviews with ratings and tags
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, tags')
        .eq('user_id', userId);

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      // Get tag statistics
      const tagCount: Record<string, number> = {};
      reviews?.forEach(review => {
        review.tags?.forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([tagId, count]) => ({
          id: tagId,
          label: REVIEW_TAGS[tagId]?.label || tagId,
          emoji: REVIEW_TAGS[tagId]?.emoji || "🏷️",
          count,
        }));

      // Get genre distribution
      const { data: movies } = await supabase
        .from('movies')
        .select('genres')
        .eq('user_id', userId);

      const genreCount: Record<string, number> = {};
      movies?.forEach(movie => {
        movie.genres?.forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      });

      const topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([genre, count]) => ({ genre, count }));

      return {
        totalMovies: moviesCount || 0,
        totalReviews: reviewsCount || 0,
        averageRating: averageRating.toFixed(1),
        topGenres,
        topTags,
      };
    },
    enabled: !!userId,
  });
};
