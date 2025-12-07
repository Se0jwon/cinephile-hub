import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileEditDialog from "@/components/ProfileEditDialog";
import FollowersFollowingModal from "@/components/FollowersFollowingModal";
import { Loader2, Film, Star, TrendingUp, Heart, UserPlus, UserMinus, Share2, Tags } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUserStats } from "@/hooks/useUserStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Link } from "react-router-dom";
import { useIsFollowing, useFollowUser, useUnfollowUser, useFollowers, useFollowing } from "@/hooks/useFollows";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewUserId = searchParams.get("user") || user?.id;
  const isOwnProfile = viewUserId === user?.id;
  
  const { data: stats, isLoading: statsLoading } = useUserStats(viewUserId);
  const { data: isFollowing } = useIsFollowing(viewUserId || "");
  const { data: followers } = useFollowers(viewUserId || "");
  const { data: following } = useFollowing(viewUserId || "");
  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, navigate]);

  const handleFollowToggle = () => {
    if (!viewUserId) return;

    if (isFollowing) {
      unfollowUser.mutate(viewUserId, {
        onSuccess: () => {
          toast({
            title: "언팔로우했습니다",
          });
        },
      });
    } else {
      followUser.mutate(viewUserId, {
        onSuccess: () => {
          toast({
            title: "팔로우했습니다",
          });
        },
      });
    }
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile?user=${viewUserId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "링크가 복사되었습니다",
      description: "클립보드에 프로필 링크가 복사되었습니다",
    });
  };

  const { data: recentReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['user-recent-reviews', viewUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          movies(title, poster_path, tmdb_id)
        `)
        .eq('user_id', viewUserId!)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!viewUserId,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', viewUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', viewUserId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!viewUserId,
  });

  if (!isAuthenticated || statsLoading) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="mb-12">
          <Card className="overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20" />
            <CardContent className="relative pt-0 pb-8">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 -mt-16 md:-mt-12">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={profile?.avatar_url || undefined} />
                  <AvatarFallback className="text-4xl">
                    {profile?.username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold mb-2">
                    {profile?.username || "사용자"}
                  </h1>
                  <p className="text-muted-foreground">
                    영화 애호가 · CineView 멤버
                  </p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <FollowersFollowingModal 
                      userId={viewUserId!} 
                      followersCount={followers?.length || 0}
                      followingCount={following?.length || 0}
                      defaultTab="followers"
                    >
                      <button className="hover:underline">
                        <span className="font-semibold">{followers?.length || 0}</span>
                        <span className="text-muted-foreground ml-1">팔로워</span>
                      </button>
                    </FollowersFollowingModal>
                    <FollowersFollowingModal 
                      userId={viewUserId!} 
                      followersCount={followers?.length || 0}
                      followingCount={following?.length || 0}
                      defaultTab="following"
                    >
                      <button className="hover:underline">
                        <span className="font-semibold">{following?.length || 0}</span>
                        <span className="text-muted-foreground ml-1">팔로잉</span>
                      </button>
                    </FollowersFollowingModal>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShareProfile}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                {isOwnProfile ? (
                    <ProfileEditDialog profile={profile}>
                      <Button variant="outline">프로필 편집</Button>
                    </ProfileEditDialog>
                  ) : (
                    <Button
                      onClick={handleFollowToggle}
                      disabled={followUser.isPending || unfollowUser.isPending}
                      variant={isFollowing ? "outline" : "default"}
                    >
                      {isFollowing ? (
                        <>
                          <UserMinus className="h-4 w-4 mr-2" />
                          언팔로우
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          팔로우
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Film className="h-4 w-4" />
                내 영화
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalMovies || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4" />
                작성한 리뷰
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.totalReviews || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                평균 평점
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats?.averageRating || "0.0"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Heart className="h-4 w-4" />
                선호 장르
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold">
                {stats?.topGenres?.[0]?.genre || "없음"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Genres */}
        {stats?.topGenres && stats.topGenres.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>선호 장르 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {stats.topGenres.map((item, index) => (
                  <Badge
                    key={item.genre}
                    variant={index === 0 ? "default" : "secondary"}
                    className="px-4 py-2 text-sm"
                  >
                    {item.genre} ({item.count})
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tag Statistics */}
        {stats?.topTags && stats.topTags.length > 0 && (
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                자주 사용하는 태그
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.topTags.map((tag, index) => {
                  const maxCount = stats.topTags[0].count;
                  const percentage = (tag.count / maxCount) * 100;
                  
                  return (
                    <div key={tag.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{tag.emoji}</span>
                          <span className="font-medium">{tag.label}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {tag.count}회
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2"
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 작성한 리뷰</CardTitle>
              <Link to="/my-movies">
                <Button variant="ghost" size="sm">
                  전체 보기
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentReviews && recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review: any) => (
                  <Link 
                    key={review.id} 
                    to={`/movie/${review.movies?.tmdb_id}`}
                    className="block"
                  >
                    <Card className="hover:ring-2 hover:ring-primary transition-all">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          {review.movies?.poster_path && (
                            <img
                              src={`https://image.tmdb.org/t/p/w200${review.movies.poster_path}`}
                              alt={review.movies.title}
                              className="w-16 h-24 object-cover rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold mb-2">
                              {review.movies?.title}
                            </h3>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-primary text-primary"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            {review.review_text && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {review.review_text}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(review.created_at), "yyyy년 M월 d일", {
                                locale: ko,
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">아직 작성한 리뷰가 없습니다</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
