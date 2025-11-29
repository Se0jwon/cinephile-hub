import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Play, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl, useTMDBMovieDetails } from "@/hooks/useTMDB";

interface MovieCardProps {
  id: number;
  title: string;
  posterPath: string | null;
  voteAverage: number;
  platform?: 'netflix' | 'disney' | 'watcha';
}

const platformInfo = {
  netflix: { label: 'Netflix', emoji: '🎬' },
  disney: { label: 'Disney+', emoji: '✨' },
  watcha: { label: 'Watcha', emoji: '🎯' },
};

const MovieCard = ({ id, title, posterPath, voteAverage, platform }: MovieCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getImageUrl(posterPath);
  const { data: movie } = useTMDBMovieDetails(id);

  return (
    <Link to={`/movie/${id}`}>
      <Card 
        className="group cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Hover Overlay */}
          {isHovered && movie && (
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col justify-end p-4 animate-fade-in">
              <p className="text-white text-sm line-clamp-3 mb-3">
                {movie.overview || "줄거리 정보가 없습니다"}
              </p>
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" variant="secondary">
                  <Play className="h-3 w-3 mr-1" />
                  자세히
                </Button>
              </div>
            </div>
          )}
          
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold text-white">
              {voteAverage.toFixed(1)}
            </span>
          </div>
          {platform && (
            <div className="absolute top-2 left-2">
              <Badge variant="secondary" className="bg-black/80 text-white backdrop-blur-sm">
                {platformInfo[platform].emoji} {platformInfo[platform].label}
              </Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
        </div>
      </Card>
    </Link>
  );
};

export default MovieCard;
