import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import { mockMovies } from "@/data/mockMovies";
import { Film, TrendingUp } from "lucide-react";

const Index = () => {
  const popularMovies = mockMovies.slice(0, 3);
  const latestMovies = mockMovies.slice(3, 6);

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="relative h-[70vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${mockMovies[0].backdrop})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center pt-16">
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              오늘 뭐 볼까?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground">
              최고의 영화들을 발견하고, 리뷰하고, 기록하세요
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 space-y-16">
        <section>
          <div className="flex items-center space-x-3 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold">인기 영화</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {popularMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center space-x-3 mb-8">
            <Film className="h-8 w-8 text-accent" />
            <h2 className="text-3xl font-bold">최신 영화</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {latestMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
