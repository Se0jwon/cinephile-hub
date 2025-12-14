import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ko } from "date-fns/locale";

interface MonthlyTrendChartProps {
  userId: string;
}

const MonthlyTrendChart = ({ userId }: MonthlyTrendChartProps) => {
  const { data: trendData, isLoading } = useQuery({
    queryKey: ['monthly-trend', userId],
    queryFn: async () => {
      const months: { date: Date; label: string }[] = [];
      for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        months.push({
          date,
          label: format(date, 'M월', { locale: ko }),
        });
      }

      const results = await Promise.all(
        months.map(async ({ date, label }) => {
          const start = startOfMonth(date).toISOString();
          const end = endOfMonth(date).toISOString();

          const [moviesResult, reviewsResult] = await Promise.all([
            supabase
              .from('movies')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', userId)
              .gte('created_at', start)
              .lte('created_at', end),
            supabase
              .from('reviews')
              .select('rating')
              .eq('user_id', userId)
              .gte('created_at', start)
              .lte('created_at', end),
          ]);

          const avgRating = reviewsResult.data && reviewsResult.data.length > 0
            ? reviewsResult.data.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.data.length
            : 0;

          return {
            month: label,
            movies: moviesResult.count || 0,
            reviews: reviewsResult.data?.length || 0,
            avgRating: Number(avgRating.toFixed(1)),
          };
        })
      );

      return results;
    },
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <Card className="mb-12">
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!trendData || trendData.every(d => d.movies === 0 && d.reviews === 0)) {
    return null;
  }

  const totalMovies = trendData.reduce((sum, d) => sum + d.movies, 0);
  const totalReviews = trendData.reduce((sum, d) => sum + d.reviews, 0);
  const avgRatings = trendData.filter(d => d.avgRating > 0);
  const overallAvgRating = avgRatings.length > 0
    ? (avgRatings.reduce((sum, d) => sum + d.avgRating, 0) / avgRatings.length).toFixed(1)
    : "0.0";

  return (
    <Card className="mb-12">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            월별 시청 트렌드
          </CardTitle>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>총 {totalMovies}편 시청</span>
            <span>리뷰 {totalReviews}개</span>
            <span>평균 ★{overallAvgRating}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trendData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="left"
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right"
                domain={[0, 5]}
                className="text-xs"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="movies" 
                name="시청한 영화" 
                fill="hsl(var(--primary))" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                yAxisId="left"
                dataKey="reviews" 
                name="작성한 리뷰" 
                fill="hsl(var(--accent))" 
                radius={[4, 4, 0, 0]}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgRating" 
                name="평균 평점"
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--destructive))' }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyTrendChart;
