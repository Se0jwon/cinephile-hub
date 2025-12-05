import { useState } from "react";
import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Loader2, User, AlertTriangle, Eye, RefreshCw } from "lucide-react";
import { useFollowingReviews } from "@/hooks/useFollows";
import { getImageUrl } from "@/hooks/useTMDB";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import ProtectedRoute from "@/components/ProtectedRoute";
import SuggestedFollowers from "@/components/SuggestedFollowers";

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
  const { data: reviews, isLoading, isFetching, refetch } = useFollowingReviews();
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-16">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">팔로잉 피드</h1>
              <p className="text-muted-foreground">
                내가 팔로우하는 사용자들의 최근 리뷰 (실시간 업데이트)
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${isFetching ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="grid lg:grid-cols-[1fr_300px] gap-8">
            <div>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="grid gap-6">
              {reviews.map((review: any) => {
                const posterUrl = getImageUrl(review.movies?.poster_path);

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
                          <div>
                            <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                              <User className="h-4 w-4" />
                              <span className="font-medium">
                                {review.profiles?.username || '익명'}
                              </span>
                              <span>•</span>
                              <span>
                                {format(
                                  new Date(review.created_at),
                                  "yyyy년 M월 d일",
                                  { locale: ko }
                                )}
                              </span>
                            </div>
                            
                            <Link to={`/movie/${review.movies?.tmdb_id}`}>
                              <h3 className="text-2xl font-bold mb-1 hover:text-primary transition-colors">
                                {review.movies?.title}
                              </h3>
                            </Link>
                            {review.movies?.release_date && (
                              <p className="text-muted-foreground">
                                {review.movies.release_date.split("-")[0]}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-sm">
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
                                  )}
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
              ) : (
                <div className="text-center py-24">
                  <p className="text-muted-foreground text-lg mb-6">
                    팔로우하는 사용자가 없거나 최근 리뷰가 없습니다.
                  </p>
                  <Link to="/profile">
                    <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                      프로필로 이동
                    </button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Suggested Followers Sidebar */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <SuggestedFollowers />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Following;
