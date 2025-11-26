import { useParams, Link } from "react-router-dom";
import { mockMovies } from "@/data/mockMovies";
import { ArrowLeft, Star, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";

const MovieDetail = () => {
  const { id } = useParams();
  const movie = mockMovies.find((m) => m.id === Number(id));

  if (!movie) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">영화를 찾을 수 없습니다</h1>
          <Link to="/">
            <Button variant="default">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="relative h-[60vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${movie.backdrop})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <Link to="/">
            <Button variant="secondary" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
          <div className="mx-auto md:mx-0">
            <img
              src={movie.poster}
              alt={movie.titleKo}
              className="w-full max-w-[300px] rounded-lg shadow-2xl"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {movie.titleKo}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {movie.title}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-primary/20 px-3 py-1.5 rounded-full">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-bold text-lg">{movie.rating.toFixed(1)}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.year}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{movie.runtime}분</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genre.map((genre) => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  감독
                </h3>
                <p className="text-lg">{movie.director}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  출연
                </h3>
                <p className="text-lg">{movie.cast.join(", ")}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  줄거리
                </h3>
                <p className="text-base leading-relaxed text-foreground/90">
                  {movie.plot}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button size="lg" className="flex-1">
                내 영화에 추가
              </Button>
              <Button size="lg" variant="secondary" className="flex-1">
                리뷰 작성
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
