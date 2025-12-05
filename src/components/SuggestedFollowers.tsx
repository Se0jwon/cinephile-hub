import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, Star, Users, Loader2 } from "lucide-react";
import { useSuggestedFollowers } from "@/hooks/useSuggestedFollowers";
import { useFollowUser } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const SuggestedFollowers = () => {
  const { data: suggestions, isLoading } = useSuggestedFollowers();
  const followUser = useFollowUser();
  const { toast } = useToast();

  const handleFollow = (userId: string, username: string) => {
    followUser.mutate(userId, {
      onSuccess: () => {
        toast({
          title: `${username}님을 팔로우했습니다`,
        });
      },
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            추천 팔로우
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="h-5 w-5" />
          추천 팔로우
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <Link to={`/profile?user=${user.id}`}>
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {user.username?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile?user=${user.id}`}>
                <p className="font-medium truncate hover:text-primary transition-colors">
                  {user.username || "사용자"}
                </p>
              </Link>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  리뷰 {user.reviewCount}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  팔로워 {user.followersCount}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleFollow(user.id, user.username || "사용자")}
              disabled={followUser.isPending}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              팔로우
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default SuggestedFollowers;
