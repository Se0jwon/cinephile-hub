import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Trophy, TrendingUp, Pencil, Loader2 } from "lucide-react";
import { useWatchGoal, useSetWatchGoal, useWatchProgress } from "@/hooks/useWatchGoals";
import { useToast } from "@/hooks/use-toast";

interface WatchGoalCardProps {
  userId: string;
  isOwnProfile: boolean;
}

const WatchGoalCard = ({ userId, isOwnProfile }: WatchGoalCardProps) => {
  const currentYear = new Date().getFullYear();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [targetInput, setTargetInput] = useState("");
  
  const { data: goal, isLoading: goalLoading } = useWatchGoal(currentYear);
  const { data: progress, isLoading: progressLoading } = useWatchProgress(currentYear);
  const setGoal = useSetWatchGoal();
  const { toast } = useToast();

  const targetMovies = goal?.target_movies || 50;
  const watchedMovies = progress?.count || 0;
  const percentage = Math.min((watchedMovies / targetMovies) * 100, 100);
  const remaining = Math.max(targetMovies - watchedMovies, 0);
  const isCompleted = watchedMovies >= targetMovies;

  const handleSetGoal = () => {
    const target = parseInt(targetInput);
    if (isNaN(target) || target < 1 || target > 1000) {
      toast({
        title: "유효하지 않은 목표",
        description: "1~1000 사이의 숫자를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setGoal.mutate(
      { year: currentYear, targetMovies: target },
      {
        onSuccess: () => {
          toast({ title: "목표가 설정되었습니다!" });
          setIsDialogOpen(false);
          setTargetInput("");
        },
      }
    );
  };

  if (goalLoading || progressLoading) {
    return (
      <Card className="mb-8">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 overflow-hidden">
      <div className={`h-2 ${isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-primary/50 to-primary"}`} />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            {currentYear}년 시청 목표
          </CardTitle>
          {isOwnProfile && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>시청 목표 설정</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {currentYear}년에 몇 편의 영화를 볼까요?
                    </label>
                    <Input
                      type="number"
                      placeholder="예: 100"
                      value={targetInput}
                      onChange={(e) => setTargetInput(e.target.value)}
                      min={1}
                      max={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      현재 목표: {targetMovies}편 | 시청 완료: {watchedMovies}편
                    </p>
                  </div>
                  <Button
                    onClick={handleSetGoal}
                    disabled={setGoal.isPending}
                    className="w-full"
                  >
                    {setGoal.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    목표 설정
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">진행률</span>
          <span className="font-semibold">{percentage.toFixed(1)}%</span>
        </div>
        <Progress value={percentage} className="h-3" />
        
        <div className="grid grid-cols-3 gap-4 pt-2">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{watchedMovies}</p>
            <p className="text-xs text-muted-foreground">시청 완료</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold">{targetMovies}</p>
            <p className="text-xs text-muted-foreground">목표</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">{remaining}</p>
            <p className="text-xs text-muted-foreground">남은 영화</p>
          </div>
        </div>

        {isCompleted && (
          <div className="flex items-center justify-center gap-2 pt-2 text-green-600 dark:text-green-400">
            <Trophy className="h-5 w-5" />
            <span className="font-semibold">목표 달성! 🎉</span>
          </div>
        )}

        {!isCompleted && remaining > 0 && (
          <div className="flex items-center justify-center gap-2 pt-2 text-muted-foreground text-sm">
            <TrendingUp className="h-4 w-4" />
            <span>목표까지 {remaining}편 남았습니다</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WatchGoalCard;
