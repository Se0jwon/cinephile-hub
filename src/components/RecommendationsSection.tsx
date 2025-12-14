import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RefreshCw, TrendingUp, Clock, Star } from "lucide-react";
import { useTMDBGenres, useTMDBByGenre, useTMDBMovieDetails } from "@/hooks/useTMDB";
import MovieCard from "./MovieCard";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface WatchPattern {
  preferredGenres: { id: number; name: string; score: number }[];
  preferredDecades: { decade: string; count: number }[];
  averageRating: number;
  recentGenres: number[];
  watchedMovieIds: number[];
}

const RecommendationsSection = () => {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [showPreferences, setShowPreferences] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: genresData } = useTMDBGenres();
  const { user } = useAuth();

  // Enhanced: Get comprehensive user watch pattern data
  const { data: watchPattern, isLoading: patternLoading } = useQuery({
    queryKey: ['user-watch-pattern', user?.id],
    queryFn: async (): Promise<WatchPattern | null> => {
      if (!user) return null;

      // Get all movies with their genres and release dates
      const { data: movies } = await supabase
        .from('movies')
        .select('genres, release_date, tmdb_id')
        .eq('user_id', user.id);

      // Get reviews with ratings
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, movies(genres, release_date, tmdb_id), created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Calculate genre scores with weighted ratings
      const genreScores: Record<string, { score: number; count: number }> = {};
      const decadeCounts: Record<string, number> = {};
      const watchedMovieIds: number[] = [];
      let totalRating = 0;
      let ratingCount = 0;

      // Process movies
      movies?.forEach((movie: any) => {
        if (movie.tmdb_id) watchedMovieIds.push(movie.tmdb_id);
        
        movie.genres?.forEach((genre: string) => {
          if (!genreScores[genre]) genreScores[genre] = { score: 0, count: 0 };
          genreScores[genre].score += 1;
          genreScores[genre].count += 1;
        });

        if (movie.release_date) {
          const year = parseInt(movie.release_date.substring(0, 4));
          const decade = `${Math.floor(year / 10) * 10}s`;
          decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
        }
      });

      // Process reviews with rating weight
      const recentGenreIds: number[] = [];
      reviews?.slice(0, 10).forEach((review: any) => {
        if (review.rating) {
          totalRating += review.rating;
          ratingCount++;
        }

        const ratingWeight = review.rating >= 4 ? 2 : review.rating >= 3 ? 1 : 0.5;
        
        review.movies?.genres?.forEach((genre: string) => {
          if (!genreScores[genre]) genreScores[genre] = { score: 0, count: 0 };
          genreScores[genre].score += ratingWeight;
          genreScores[genre].count += 1;
        });
      });

      // Sort genres by weighted score
      const sortedGenres = Object.entries(genreScores)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.score - a.score);

      // Sort decades by count
      const sortedDecades = Object.entries(decadeCounts)
        .map(([decade, count]) => ({ decade, count }))
        .sort((a, b) => b.count - a.count);

      return {
        preferredGenres: sortedGenres.slice(0, 5).map(g => ({
          id: 0, // Will be mapped to TMDB ID later
          name: g.name,
          score: g.score,
        })),
        preferredDecades: sortedDecades.slice(0, 3),
        averageRating: ratingCount > 0 ? totalRating / ratingCount : 3.5,
        recentGenres: recentGenreIds,
        watchedMovieIds,
      };
    },
    enabled: !!user,
  });

  // Map genre names to TMDB IDs and set selected genres
  useEffect(() => {
    if (watchPattern && genresData && watchPattern.preferredGenres.length > 0) {
      const genreIds = watchPattern.preferredGenres
        .map(pg => genresData.genres.find(g => g.name === pg.name)?.id)
        .filter(Boolean) as number[];
      
      if (genreIds.length > 0) {
        setSelectedGenres(genreIds.slice(0, 3));
        localStorage.setItem("favoriteGenres", JSON.stringify(genreIds.slice(0, 3)));
        return;
      }
    }

    // Fallback to saved preferences
    const saved = localStorage.getItem("favoriteGenres");
    if (saved) {
      setSelectedGenres(JSON.parse(saved));
    } else {
      setShowPreferences(true);
    }
  }, [watchPattern, genresData]);

  // Fetch movies for multiple genres for better variety
  const { data: genre1Movies, isLoading: loading1 } = useTMDBByGenre(
    selectedGenres[0] || 0,
    1 + refreshKey
  );
  const { data: genre2Movies, isLoading: loading2 } = useTMDBByGenre(
    selectedGenres[1] || 0,
    1 + refreshKey
  );
  const { data: genre3Movies, isLoading: loading3 } = useTMDBByGenre(
    selectedGenres[2] || 0,
    2 + refreshKey
  );

  // Combine and filter recommendations
  const recommendedMovies = useMemo(() => {
    const allMovies = [
      ...(genre1Movies?.results || []),
      ...(genre2Movies?.results || []),
      ...(genre3Movies?.results || []),
    ];

    // Remove duplicates
    const uniqueMovies = allMovies.filter((movie, index, self) =>
      index === self.findIndex(m => m.id === movie.id)
    );

    // Filter out already watched movies
    const unwatchedMovies = uniqueMovies.filter(
      movie => !watchPattern?.watchedMovieIds.includes(movie.id)
    );

    // Sort by user preferences
    const scoredMovies = unwatchedMovies.map(movie => {
      let score = movie.vote_average || 0;
      
      // Boost movies with higher ratings if user prefers high-rated content
      if (watchPattern && watchPattern.averageRating >= 4) {
        score += movie.vote_average >= 7 ? 2 : 0;
      }

      return { ...movie, recommendScore: score };
    });

    // Sort by recommendation score and return top 15
    return scoredMovies
      .sort((a, b) => b.recommendScore - a.recommendScore)
      .slice(0, 15);
  }, [genre1Movies, genre2Movies, genre3Movies, watchPattern, refreshKey]);

  const isLoading = loading1 || loading2 || loading3 || patternLoading;

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) => {
      const newGenres = prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId].slice(0, 3);
      
      localStorage.setItem("favoriteGenres", JSON.stringify(newGenres));
      return newGenres;
    });
  };

  const savePreferences = () => {
    if (selectedGenres.length > 0) {
      setShowPreferences(false);
    }
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
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
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              {selectedGenres.map((genreId) => {
                const genre = genresData.genres.find((g) => g.id === genreId);
                return (
                  <Badge key={genreId} variant="secondary" className="text-xs">
                    {genre?.name}
                  </Badge>
                );
              })}
              {watchPattern && watchPattern.preferredGenres.length > 0 && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  시청 패턴 기반
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreferences(true)}
          >
            설정 변경
          </Button>
        </div>
      </div>

      {/* Watch Pattern Insights */}
      {watchPattern && (watchPattern.preferredDecades.length > 0 || watchPattern.averageRating > 0) && (
        <div className="flex gap-4 mb-6 flex-wrap">
          {watchPattern.averageRating > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="h-4 w-4" />
              <span>평균 평점: {watchPattern.averageRating.toFixed(1)}</span>
            </div>
          )}
          {watchPattern.preferredDecades[0] && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>선호 시대: {watchPattern.preferredDecades[0].decade}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>시청한 영화: {watchPattern.watchedMovieIds.length}편</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : recommendedMovies && recommendedMovies.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {recommendedMovies.map((movie) => (
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
