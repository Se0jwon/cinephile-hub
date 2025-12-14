import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Film, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { getImageUrl, TMDBResponse } from "@/hooks/useTMDB";

interface SimilarMoviesProps {
  movieId: number;
  currentGenres?: Array<{ id: number; name: string }>;
}

const SimilarMovies = ({ movieId, currentGenres }: SimilarMoviesProps) => {
  // Fetch similar movies
  const { data: similarMovies, isLoading: similarLoading } = useQuery({
    queryKey: ['tmdb-similar', movieId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { action: 'similar', movieId }
      });
      if (error) throw error;
      return data as TMDBResponse;
    },
    enabled: !!movieId,
  });

  // Fetch recommended movies
  const { data: recommendedMovies, isLoading: recommendedLoading } = useQuery({
    queryKey: ['tmdb-recommendations', movieId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { action: 'recommendations', movieId }
      });
      if (error) throw error;
      return data as TMDBResponse;
    },
    enabled: !!movieId,
  });

  const isLoading = similarLoading || recommendedLoading;

  // Combine and deduplicate movies
  const allMovies = [
    ...(recommendedMovies?.results || []),
    ...(similarMovies?.results || []),
  ];
  
  const uniqueMovies = allMovies
    .filter((movie, index, self) => 
      index === self.findIndex(m => m.id === movie.id) && movie.id !== movieId
    )
    .slice(0, 12);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!uniqueMovies || uniqueMovies.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Film className="h-5 w-5 text-primary" />
          비슷한 영화 추천
        </CardTitle>
        {currentGenres && currentGenres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {currentGenres.slice(0, 3).map(genre => (
              <Badge key={genre.id} variant="outline" className="text-xs">
                {genre.name}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {uniqueMovies.map((movie) => (
            <Link
              key={movie.id}
              to={`/movie/${movie.id}`}
              className="group"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
                <img
                  src={getImageUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium line-clamp-2">
                      {movie.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-primary text-xs">★</span>
                      <span className="text-white/80 text-xs">
                        {movie.vote_average?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
                {movie.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {movie.release_date?.split('-')[0]}
              </p>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimilarMovies;
