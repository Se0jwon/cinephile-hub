import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import { useTMDBPopular, useTMDBNowPlaying } from "@/hooks/useTMDB";
import { Loader2 } from "lucide-react";

const Index = () => {
  const { data: popularData, isLoading: popularLoading } = useTMDBPopular();
  const { data: nowPlayingData, isLoading: nowPlayingLoading } = useTMDBNowPlaying();

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
        <h2 className="text-3xl font-bold mb-8">인기 영화</h2>
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
        <h2 className="text-3xl font-bold mb-8">현재 상영중</h2>
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
    </div>
  );
};

export default Index;
