import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Calendar, Loader2, User, AlertTriangle, Eye, RefreshCw, MessageSquare, Heart, TrendingUp, Clock } from "lucide-react";
import { useFollowingReviews } from "@/hooks/useFollows";
import { getImageUrl } from "@/hooks/useTMDB";
import { Link } from "react-router-dom";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuggestedFollowers from "@/components/SuggestedFollowers";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const REVIEW_TAGS: Record<string, { label: string; emoji: string }> = {
  touching: { label: "감동적인", emoji: "😢" },
  funny: { label: "재미있는", emoji: "😂" },
  scary: { label: "무서운", emoji: "😱" },
  "thought-provoking": { label: "생각하게 하는", emoji: "🤔" },
  romantic: { label: "로맨틱한", emoji: "💕" },
  exciting: { label: "긴장감 넘치는", emoji: "🔥" },
  beautiful: { label: "아름다운", emoji: "✨" },
  boring: { label: "지루한", emoji: "😴" },
};

const Following = () => {
  const { user } = useAuth();
  const { data: reviews, isLoading, isFetching, refetch } = useFollowingReviews();
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("all");

  // Get like counts for reviews
  const { data: likeCounts } = useQuery({
    queryKey: ['review-likes-counts', reviews?.map(r => r.id)],
    queryFn: async () => {
      if (!reviews) return {};
      const counts: Record<string, number> = {};
      
      await Promise.all(
        reviews.map(async (review) => {
          const { count } = await supabase
            .from('review_likes')
            .select('*', { count: 'exact', head: true })
            .eq('review_id', review.id);
          counts[review.id] = count || 0;
        })
      );
      
      return counts;
    },
    enabled: !!reviews && reviews.length > 0,
  });

  // Get comment counts for reviews
  const { data: commentCounts } = useQuery({
    queryKey: ['review-comments-counts', reviews?.map(r => r.id)],
    queryFn: async () => {
      if (!reviews) return {};
      const counts: Record<string, number> = {};
      
      await Promise.all(
        reviews.map(async (review) => {
          const { count } = await supabase
            .from('review_comments')
            .select('*', { count: 'exact', head: true })
            .eq('review_id', review.id);
          counts[review.id] = count || 0;
        })
      );
      
      return counts;
    },
    enabled: !!reviews && reviews.length > 0,
  });

  // Filter reviews based on active tab
  const filteredReviews = reviews?.filter(review => {
    if (activeTab === "all") return true;
    if (activeTab === "high-rated") return review.rating >= 4;
    if (activeTab === "recent") {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(review.created_at) > dayAgo;
    }
    return true;
  });

  // Get feed stats
  const feedStats = {
    totalReviews: reviews?.length || 0,
    highRatedCount: reviews?.filter(r => r.rating >= 4).length || 0,
    todayCount: reviews?.filter(r => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(r.created_at) >= today;
    }).length || 0,
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-16">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">팔로잉 피드</h1>
                <p className="text-muted-foreground">
                  내가 팔로우하는 사용자들의 최근 리뷰
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
                새로고침
              </Button>
            </div>

            {/* Feed Stats */}
            {reviews && reviews.length > 0 && (
              <div className="flex gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>총 {feedStats.totalReviews}개 리뷰</span>
                </div>
                <div className="flex items-center gap-2 text-sm bg-muted/50 px-3 py-1.5 rounded-full">
                  <Star className="h-4 w-4 text-primary" />
                  <span>높은 평점 {feedStats.highRatedCount}개</span>
                </div>
                {feedStats.todayCount > 0 && (
                  <div className="flex items-center gap-2 text-sm bg-primary/10 px-3 py-1.5 rounded-full">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>오늘 {feedStats.todayCount}개</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div>
              {/* Filter Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  <TabsTrigger value="high-rated">높은 평점 (4+)</TabsTrigger>
                  <TabsTrigger value="recent">최근 24시간</TabsTrigger>
                </TabsList>
              </Tabs>

              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredReviews && filteredReviews.length > 0 ? (
                <div className="grid gap-6">
                  {filteredReviews.map((review: any) => {
                    const posterUrl = getImageUrl(review.movies?.poster_path);
                    const likeCount = likeCounts?.[review.id] || 0;
                    const commentCount = commentCounts?.[review.id] || 0;
                    const timeAgo = formatDistanceToNow(new Date(review.created_at), { 
                      addSuffix: true, 
                      locale: ko 
                    });

                    return (
                      <Card key={review.id} className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                        <CardContent className="p-0">
                          <div className="grid md:grid-cols-[150px_1fr] gap-6 p-6">
                            <Link to={`/movie/${review.movies?.tmdb_id}`} className="mx-auto md:mx-0">
                              <img
                                src={posterUrl}
                                alt={review.movies?.title}
                                className="w-full max-w-[150px] rounded-lg shadow-lg hover:scale-105 transition-transform"
                              />
                            </Link>

                            <div className="space-y-4">
                              {/* User info */}
                              <div className="flex items-center gap-3">
                                <Link to={`/profile?user=${review.user_id}`}>
                                  <Avatar className="h-10 w-10 hover:ring-2 hover:ring-primary transition-all">
                                    <AvatarImage src={review.profiles?.avatar_url || undefined} />
                                    <AvatarFallback>
                                      {review.profiles?.username?.[0]?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                </Link>
                                <div>
                                  <Link 
                                    to={`/profile?user=${review.user_id}`}
                                    className="font-medium hover:text-primary transition-colors"
                                  >
                                    {review.profiles?.username || '익명'}
                                  </Link>
                                  <p className="text-xs text-muted-foreground">{timeAgo}</p>
                                </div>
                              </div>
                              
                              {/* Movie info */}
                              <div>
                                <Link to={`/movie/${review.movies?.tmdb_id}`}>
                                  <h3 className="text-2xl font-bold mb-1 hover:text-primary transition-colors">
                                    {review.movies?.title}
                                  </h3>
                                </Link>
                                {review.movies?.release_date && (
                                  <p className="text-muted-foreground text-sm">
                                    {review.movies.release_date.split("-")[0]}
                                  </p>
                                )}
                              </div>

                              {/* Rating and date */}
                              <div className="flex items-center gap-4 text-sm flex-wrap">
                                <div className="flex items-center space-x-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-5 w-5 ${
                                        i < review.rating
                                          ? "fill-primary text-primary"
                                          : "text-muted"
                                      }`}
                                    />
                                  ))}
                                </div>

                                {review.watched_date && (
                                  <div className="flex items-center space-x-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                      {format(
                                        new Date(review.watched_date),
                                        "yyyy년 M월 d일",
                                        { locale: ko }
                                      )} 시청
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Tags */}
                              {review.tags && review.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {review.tags.map((tagId: string) => {
                                    const tag = REVIEW_TAGS[tagId];
                                    return tag ? (
                                      <Badge key={tagId} variant="secondary" className="text-xs">
                                        {tag.emoji} {tag.label}
                                      </Badge>
                                    ) : null;
                                  })}
                                </div>
                              )}

                              {/* Review text with spoiler handling */}
                              {review.review_text && (
                                <div>
                                  {review.has_spoiler && !revealedSpoilers.has(review.id) ? (
                                    <div 
                                      className="bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted/70 transition-colors"
                                      onClick={() => setRevealedSpoilers(prev => new Set([...prev, review.id]))}
                                    >
                                      <div className="flex items-center gap-2 text-warning">
                                        <AlertTriangle className="h-4 w-4" />
                                        <span className="font-medium">스포일러 포함</span>
                                      </div>
                                      <p className="text-sm text-muted-foreground mt-1">
                                        클릭하여 내용을 확인하세요
                                      </p>
                                    </div>
                                  ) : (
                                    <div className="relative">
                                      {review.has_spoiler && (
                                        <div className="flex items-center gap-1 text-xs text-warning mb-2">
                                          <AlertTriangle className="h-3 w-3" />
                                          <span>스포일러</span>
                                          <button 
                                            onClick={() => setRevealedSpoilers(prev => {
                                              const newSet = new Set(prev);
                                              newSet.delete(review.id);
                                              return newSet;
                                            })}
                                            className="ml-2 text-muted-foreground hover:text-foreground"
                                          >
                                            <Eye className="h-3 w-3" />
                                          </button>
                                        </div>
                                      )}
                                      <p className="text-foreground/90 leading-relaxed">
                                        {review.review_text}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Engagement stats */}
                              <div className="flex items-center gap-4 pt-2 border-t border-border/50">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Heart className="h-4 w-4" />
                                  <span>{likeCount}</span>
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MessageSquare className="h-4 w-4" />
                                  <span>{commentCount}</span>
                                </div>
                                <Link 
                                  to={`/movie/${review.movies?.tmdb_id}`}
                                  className="ml-auto text-sm text-primary hover:underline"
                                >
                                  리뷰 보기 →
                                </Link>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="text-center py-16">
                  <CardContent>
                    <User className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-semibold mb-2">팔로잉 피드가 비어있습니다</h3>
                    <p className="text-muted-foreground mb-6">
                      팔로우하는 사용자가 없거나 최근 리뷰가 없습니다.
                    </p>
                    <Link to="/profile">
                      <Button>프로필로 이동</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
            
            {/* Suggested Followers Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                <SuggestedFollowers />
                
                {/* Quick Stats Card */}
                {user && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">내 활동</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <Link to="/my-movies" className="flex justify-between hover:text-primary transition-colors">
                        <span>내 영화</span>
                        <span className="text-muted-foreground">보기 →</span>
                      </Link>
                      <Link to="/lists" className="flex justify-between hover:text-primary transition-colors">
                        <span>내 리스트</span>
                        <span className="text-muted-foreground">보기 →</span>
                      </Link>
                      <Link to="/profile" className="flex justify-between hover:text-primary transition-colors">
                        <span>프로필</span>
                        <span className="text-muted-foreground">보기 →</span>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Following;
