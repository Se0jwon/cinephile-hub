import { Movie } from "@/types/movie";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <Link to={`/movie/${movie.id}`}>
      <div className="group relative overflow-hidden rounded-lg bg-card transition-all duration-300 hover:scale-105 hover:shadow-glow-primary">
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.titleKo}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-1">
              {movie.titleKo}
            </h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
              {movie.title}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <span className="text-sm font-semibold text-foreground">
                  {movie.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {movie.year}
              </span>
            </div>
          </div>
        </div>

        <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md">
          <div className="flex items-center space-x-1">
            <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
            <span className="text-xs font-bold text-primary-foreground">
              {movie.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
