import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, X } from "lucide-react";
import { useTMDBGenres, useTMDBByGenre } from "@/hooks/useTMDB";
import MovieCard from "./MovieCard";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const RecommendationsSection = () => {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const { data: genresData } = useTMDBGenres();
  const { user } = useAuth();

  // Get user's watch history and ratings
  const { data: userMovies } = useQuery({
    queryKey: ['user-movies-for-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: movies } = await supabase
        .from('movies')
        .select('genres')
        .eq('user_id', user.id);

      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, movies(genres)')
        .eq('user_id', user.id)
        .gte('rating', 4);

      return { movies, reviews };
    },
    enabled: !!user,
  });

  // Calculate recommended genres based on user's watch history
  useEffect(() => {
    if (userMovies && genresData) {
      const genreScores: Record<string, number> = {};

      // Count genres from watched movies
      userMovies.movies?.forEach((movie: any) => {
        movie.genres?.forEach((genre: string) => {
          genreScores[genre] = (genreScores[genre] || 0) + 1;
        });
      });

      // Weight genres from highly-rated movies more heavily
      userMovies.reviews?.forEach((review: any) => {
        review.movies?.genres?.forEach((genre: string) => {
          genreScores[genre] = (genreScores[genre] || 0) + (review.rating / 2);
        });
      });

      // Get top 3 genres
      const topGenres = Object.entries(genreScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([genre]) => genre);

      if (topGenres.length > 0) {
        const genreIds = topGenres
          .map(genreName => genresData.genres.find(g => g.name === genreName)?.id)
          .filter(Boolean) as number[];
        
        if (genreIds.length > 0) {
          setSelectedGenres(genreIds);
          localStorage.setItem("favoriteGenres", JSON.stringify(genreIds));
          return;
        }
      }
    }

    // Fallback to saved preferences
    const saved = localStorage.getItem("favoriteGenres");
    if (saved) {
      setSelectedGenres(JSON.parse(saved));
    } else {
      setShowPreferences(true);
    }
  }, [userMovies, genresData]);

  // Fetch movies for the first selected genre
  const { data: recommendedMovies, isLoading } = useTMDBByGenre(
    selectedGenres.length > 0 ? selectedGenres[0] : 0,
    1
  );

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) => {
      const newGenres = prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId].slice(0, 3); // Max 3 genres
      
      localStorage.setItem("favoriteGenres", JSON.stringify(newGenres));
      return newGenres;
    });
  };

  const savePreferences = () => {
    if (selectedGenres.length > 0) {
      setShowPreferences(false);
    }
  };

  if (!genresData) return null;

  if (showPreferences || selectedGenres.length === 0) {
    return (
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <Card className="p-8 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">맞춤 추천 설정</h2>
          </div>
          <p className="text-muted-foreground mb-6">
            좋아하는 장르를 최대 3개까지 선택하면 맞춤 영화를 추천해드립니다
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
            {genresData.genres.map((genre) => (
              <Badge
                key={genre.id}
                variant={selectedGenres.includes(genre.id) ? "default" : "outline"}
                className="cursor-pointer py-3 justify-center text-sm hover:scale-105 transition-transform"
                onClick={() => toggleGenre(genre.id)}
              >
                {genre.name}
              </Badge>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={savePreferences}
              disabled={selectedGenres.length === 0}
              className="flex-1"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              추천 영화 보기
            </Button>
            {selectedGenres.length > 0 && (
              <Button
                variant="outline"
                onClick={() => setSelectedGenres([])}
              >
                선택 초기화
              </Button>
            )}
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16 bg-muted/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold">맞춤 추천 영화</h2>
            <div className="flex gap-2 mt-2">
              {selectedGenres.map((genreId) => {
                const genre = genresData.genres.find((g) => g.id === genreId);
                return (
                  <Badge key={genreId} variant="secondary" className="text-xs">
                    {genre?.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPreferences(true)}
        >
          설정 변경
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : recommendedMovies && recommendedMovies.results.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {recommendedMovies.results.slice(0, 10).map((movie) => (
            <MovieCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterPath={movie.poster_path}
              voteAverage={movie.vote_average}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">추천 영화를 불러올 수 없습니다</p>
        </div>
      )}
    </section>
  );
};

export default RecommendationsSection;
