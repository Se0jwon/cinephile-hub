import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import { useTMDBPopular, useTMDBNowPlaying, useTMDBByProvider } from "@/hooks/useTMDB";
import { useTopRatedMovies } from "@/hooks/useTopRatedMovies";
import { Loader2, ChevronRight, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const Index = () => {
  const { data: popularData, isLoading: popularLoading } = useTMDBPopular();
  const { data: nowPlayingData, isLoading: nowPlayingLoading } = useTMDBNowPlaying();
  
  // Platform-specific movies (Netflix: 8, Disney+: 337, Watcha: 97)
  const { data: netflixData, isLoading: netflixLoading } = useTMDBByProvider(8);
  const { data: disneyData, isLoading: disneyLoading } = useTMDBByProvider(337);
  const { data: watchaData, isLoading: watchaLoading } = useTMDBByProvider(97);
  
  // Top rated movies from user reviews
  const { data: topRatedData, isLoading: topRatedLoading } = useTopRatedMovies(10);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1489599849927-2ee91cede3ba')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            영화의 모든 것,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              CineView
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in">
            당신의 영화 취향을 발견하고 관리하세요
          </p>
        </div>
      </section>

      {/* Popular Movies */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">인기 영화</h2>
          <Link to="/category/popular">
            <Button variant="secondary" size="sm">
              더보기
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {popularLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {popularData?.results.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        )}
      </section>

      {/* Now Playing Movies */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">현재 상영중</h2>
          <Link to="/category/now-playing">
            <Button variant="secondary" size="sm">
              더보기
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
        {nowPlayingLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {nowPlayingData?.results.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        )}
      </section>

      {/* Top Rated by Users */}
      {topRatedData && topRatedData.length > 0 && (
        <section className="container mx-auto px-4 py-16 bg-muted/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <h2 className="text-3xl font-bold">평점 높은 영화</h2>
            </div>
          </div>
          {topRatedLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {topRatedData.map((movie) => (
                <Link key={movie.tmdb_id} to={`/movie/${movie.tmdb_id}`}>
                  <Card className="group cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-300">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <img
                        src={movie.poster_path 
                          ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                          : 'https://via.placeholder.com/500x750?text=No+Image'
                        }
                        alt={movie.title}
                        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-white">
                          {movie.average_rating.toFixed(1)}
                        </span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-primary/80 backdrop-blur-sm rounded-full px-2 py-1">
                        <span className="text-xs font-semibold text-primary-foreground">
                          {movie.review_count}명 평가
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {movie.title}
                      </h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Netflix Movies */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">🎬 Netflix</h2>
        </div>
        {netflixLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {netflixData?.results.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        )}
      </section>

      {/* Disney+ Movies */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">✨ Disney+</h2>
        </div>
        {disneyLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {disneyData?.results.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        )}
      </section>

      {/* Watcha Movies */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">🎯 Watcha</h2>
        </div>
        {watchaLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {watchaData?.results.slice(0, 10).map((movie) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterPath={movie.poster_path}
                voteAverage={movie.vote_average}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
