import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, subMonths, addMonths, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WatchingCalendarProps {
  userId: string;
}

interface MovieWatch {
  date: string;
  count: number;
  movies: { title: string; poster_path: string | null }[];
}

const WatchingCalendar = ({ userId }: WatchingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: watchData } = useQuery({
    queryKey: ['watching-calendar', userId, format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);

      const { data, error } = await supabase
        .from('movies')
        .select('created_at, title, poster_path')
        .eq('user_id', userId)
        .gte('created_at', start.toISOString())
        .lte('created_at', end.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, MovieWatch> = {};
      data?.forEach((movie) => {
        const date = format(new Date(movie.created_at), 'yyyy-MM-dd');
        if (!grouped[date]) {
          grouped[date] = { date, count: 0, movies: [] };
        }
        grouped[date].count++;
        grouped[date].movies.push({ 
          title: movie.title, 
          poster_path: movie.poster_path 
        });
      });

      return grouped;
    },
    enabled: !!userId,
  });

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const firstDayOfWeek = getDay(startOfMonth(currentMonth));

  const getIntensityClass = (count: number) => {
    if (count === 0) return "bg-muted";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    if (count === 3) return "bg-primary/70";
    return "bg-primary";
  };

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const totalMoviesThisMonth = useMemo(() => {
    if (!watchData) return 0;
    return Object.values(watchData).reduce((sum, day) => sum + day.count, 0);
  }, [watchData]);

  return (
    <Card className="mb-12">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            월별 시청 현황
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="font-medium min-w-[120px] text-center">
              {format(currentMonth, 'yyyy년 M월', { locale: ko })}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">
          이번 달 시청: <span className="font-semibold text-foreground">{totalMoviesThisMonth}편</span>
        </div>

        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs text-muted-foreground font-medium py-1"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <TooltipProvider>
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of month */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}

            {/* Actual days */}
            {daysInMonth.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayData = watchData?.[dateKey];
              const count = dayData?.count || 0;
              const isToday = isSameDay(day, new Date());

              return (
                <Tooltip key={dateKey}>
                  <TooltipTrigger asChild>
                    <div
                      className={`
                        aspect-square rounded-md flex items-center justify-center text-xs cursor-default
                        ${getIntensityClass(count)}
                        ${isToday ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                        transition-all hover:scale-110
                      `}
                    >
                      {format(day, 'd')}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-sm">
                      <div className="font-medium mb-1">
                        {format(day, 'M월 d일', { locale: ko })}
                      </div>
                      {count > 0 ? (
                        <div>
                          <div className="text-muted-foreground mb-1">{count}편 시청</div>
                          <ul className="space-y-0.5">
                            {dayData?.movies.slice(0, 3).map((movie, i) => (
                              <li key={i} className="text-xs truncate max-w-[150px]">
                                • {movie.title}
                              </li>
                            ))}
                            {count > 3 && (
                              <li className="text-xs text-muted-foreground">
                                외 {count - 3}편
                              </li>
                            )}
                          </ul>
                        </div>
                      ) : (
                        <div className="text-muted-foreground">시청 기록 없음</div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>

        {/* Legend */}
        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>적음</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded bg-muted" />
            <div className="w-3 h-3 rounded bg-primary/30" />
            <div className="w-3 h-3 rounded bg-primary/50" />
            <div className="w-3 h-3 rounded bg-primary/70" />
            <div className="w-3 h-3 rounded bg-primary" />
          </div>
          <span>많음</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchingCalendar;
