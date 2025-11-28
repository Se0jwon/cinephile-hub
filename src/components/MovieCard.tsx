import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl } from "@/hooks/useTMDB";

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
  const imageUrl = getImageUrl(posterPath);

  return (
    <Link to={`/movie/${id}`}>
      <Card className="group cursor-pointer overflow-hidden hover:ring-2 hover:ring-primary transition-all duration-300">
        <div className="relative aspect-[2/3] overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
          />
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
