import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Film, Star, TrendingUp, Clock, Award } from "lucide-react";

interface AnnualStatsProps {
  userId: string;
}

const AnnualStats = ({ userId }: AnnualStatsProps) => {
  const currentYear = new Date().getFullYear();

  const { data: annualStats } = useQuery({
    queryKey: ["annual-stats", userId, currentYear],
    queryFn: async () => {
      const startOfYear = `${currentYear}-01-01`;
      const endOfYear = `${currentYear}-12-31`;

      // Get all reviews for this year
      const { data: reviews, error: reviewsError } = await supabase
        .from("reviews")
        .select(`
          id,
          rating,
          watched_date,
          tags,
          movies(title, runtime, genres)
        `)
        .eq("user_id", userId)
        .gte("watched_date", startOfYear)
        .lte("watched_date", endOfYear);

      if (reviewsError) throw reviewsError;

      if (!reviews || reviews.length === 0) {
        return null;
      }

      // Calculate statistics
      const totalMovies = reviews.length;
      const totalRuntime = reviews.reduce((sum, r) => sum + ((r.movies as any)?.runtime || 0), 0);
      const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / totalMovies;

      // Monthly distribution
      const monthlyCount: Record<number, number> = {};
      reviews.forEach((r) => {
        if (r.watched_date) {
          const month = new Date(r.watched_date).getMonth();
          monthlyCount[month] = (monthlyCount[month] || 0) + 1;
        }
      });

      const mostActiveMonth = Object.entries(monthlyCount).sort(
        (a, b) => b[1] - a[1]
      )[0];

      // Genre distribution
      const genreCount: Record<string, number> = {};
      reviews.forEach((r) => {
        ((r.movies as any)?.genres || []).forEach((genre: string) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      });

      const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0];

      // Tag distribution
      const tagCount: Record<string, number> = {};
      reviews.forEach((r) => {
        (r.tags || []).forEach((tag: string) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      });

      // Best rated movie
      const bestRated = reviews.reduce((best, r) => 
        !best || r.rating > best.rating ? r : best
      , null as typeof reviews[0] | null);

      const monthNames = [
        "1월", "2월", "3월", "4월", "5월", "6월",
        "7월", "8월", "9월", "10월", "11월", "12월"
      ];

      return {
        totalMovies,
        totalRuntime,
        averageRating: averageRating.toFixed(1),
        mostActiveMonth: mostActiveMonth
          ? { name: monthNames[parseInt(mostActiveMonth[0])], count: mostActiveMonth[1] }
          : null,
        topGenre: topGenre ? { name: topGenre[0], count: topGenre[1] } : null,
        bestRatedMovie: bestRated ? (bestRated.movies as any)?.title : null,
      };
    },
    enabled: !!userId,
  });

  if (!annualStats) {
    return null;
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {currentYear}년 연간 시청 통계
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <Film className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{annualStats.totalMovies}</p>
            <p className="text-xs text-muted-foreground">총 시청 영화</p>
          </div>

          <div className="bg-accent/10 rounded-lg p-4 text-center">
            <Clock className="h-6 w-6 mx-auto mb-2 text-accent" />
            <p className="text-lg font-bold">{formatRuntime(annualStats.totalRuntime)}</p>
            <p className="text-xs text-muted-foreground">총 시청 시간</p>
          </div>

          <div className="bg-yellow-500/10 rounded-lg p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
            <p className="text-2xl font-bold">{annualStats.averageRating}</p>
            <p className="text-xs text-muted-foreground">평균 평점</p>
          </div>

          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
            <p className="text-lg font-bold">
              {annualStats.mostActiveMonth?.name || "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              가장 활발한 달 ({annualStats.mostActiveMonth?.count || 0}편)
            </p>
          </div>

          <div className="bg-purple-500/10 rounded-lg p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-purple-500" />
            <p className="text-sm font-bold truncate">
              {annualStats.topGenre?.name || "-"}
            </p>
            <p className="text-xs text-muted-foreground">
              최다 장르 ({annualStats.topGenre?.count || 0}편)
            </p>
          </div>

          <div className="bg-rose-500/10 rounded-lg p-4 text-center">
            <Star className="h-6 w-6 mx-auto mb-2 text-rose-500 fill-rose-500" />
            <p className="text-sm font-bold truncate" title={annualStats.bestRatedMovie || undefined}>
              {annualStats.bestRatedMovie || "-"}
            </p>
            <p className="text-xs text-muted-foreground">최고 평점 영화</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnnualStats;
