import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      // Get average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('user_id', userId);

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

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
      };
    },
    enabled: !!userId,
  });
};
