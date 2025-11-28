import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TopRatedMovie {
  tmdb_id: number;
  title: string;
  poster_path: string | null;
  average_rating: number;
  review_count: number;
}

export const useTopRatedMovies = (limit: number = 10, minReviews: number = 3) => {
  return useQuery({
    queryKey: ['topRatedMovies', limit, minReviews],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          movie_id,
          rating,
          movies!inner (
            tmdb_id,
            title,
            poster_path
          )
        `)
        .eq('is_public', true);

      if (error) throw error;

      // Group by movie and calculate average ratings
      const movieRatings = data.reduce((acc: any, review: any) => {
        const tmdbId = review.movies.tmdb_id;
        if (!acc[tmdbId]) {
          acc[tmdbId] = {
            tmdb_id: tmdbId,
            title: review.movies.title,
            poster_path: review.movies.poster_path,
            ratings: [],
          };
        }
        acc[tmdbId].ratings.push(review.rating);
        return acc;
      }, {});

      // Calculate averages, filter by minimum reviews, and sort
      const topRated: TopRatedMovie[] = Object.values(movieRatings)
        .map((movie: any) => ({
          tmdb_id: movie.tmdb_id,
          title: movie.title,
          poster_path: movie.poster_path,
          average_rating: movie.ratings.reduce((sum: number, r: number) => sum + r, 0) / movie.ratings.length,
          review_count: movie.ratings.length,
        }))
        .filter((movie: TopRatedMovie) => movie.review_count >= minReviews)
        .sort((a: TopRatedMovie, b: TopRatedMovie) => b.average_rating - a.average_rating)
        .slice(0, limit);

      return topRated;
    },
  });
};
