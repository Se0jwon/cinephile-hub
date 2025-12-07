import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { BarChart3 } from "lucide-react";

interface GenreData {
  genre: string;
  count: number;
}

interface TagData {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

interface UserStatsChartProps {
  topGenres?: GenreData[];
  topTags?: TagData[];
  totalMovies: number;
  totalReviews: number;
  averageRating: string;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(45, 93%, 47%)",
  "hsl(142, 76%, 36%)",
  "hsl(199, 89%, 48%)",
];

const UserStatsChart = ({
  topGenres = [],
  topTags = [],
  totalMovies,
  totalReviews,
  averageRating,
}: UserStatsChartProps) => {
  const genreChartData = topGenres.map((item, index) => ({
    name: item.genre,
    value: item.count,
    fill: COLORS[index % COLORS.length],
  }));

  const tagChartData = topTags.slice(0, 5).map((item) => ({
    name: `${item.emoji} ${item.label}`,
    count: item.count,
  }));

  const summaryData = [
    { name: "내 영화", value: totalMovies },
    { name: "리뷰", value: totalReviews },
  ];

  if (topGenres.length === 0 && topTags.length === 0) {
    return null;
  }

  return (
    <Card className="mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          나의 영화 통계
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Genre Pie Chart */}
          {topGenres.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">장르 분포</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={genreChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {genreChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}편`, "영화 수"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Tag Bar Chart */}
          {tagChartData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-center">태그 사용 빈도</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={tagChartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value}회`, "사용 횟수"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="hsl(var(--primary))"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-primary/10">
            <p className="text-3xl font-bold text-primary">{totalMovies}</p>
            <p className="text-sm text-muted-foreground">시청한 영화</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-accent/10">
            <p className="text-3xl font-bold text-accent-foreground">{totalReviews}</p>
            <p className="text-sm text-muted-foreground">작성한 리뷰</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-secondary">
            <p className="text-3xl font-bold">⭐ {averageRating}</p>
            <p className="text-sm text-muted-foreground">평균 평점</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserStatsChart;
