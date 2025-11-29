import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Lock, Heart } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useReviewLikes, useUserLikedReview, useToggleReviewLike } from "@/hooks/useReviewLikes";

interface Review {
  id: string;
  rating: number;
  review_text: string | null;
  watched_date: string | null;
  created_at: string;
  is_public: boolean;
  profiles: {
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewListProps {
  reviews: Review[];
  currentUserId?: string;
}

const ReviewList = ({ reviews, currentUserId }: ReviewListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">아직 작성된 리뷰가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} currentUserId={currentUserId} />
      ))}
    </div>
  );
};

const ReviewCard = ({ review, currentUserId }: { review: Review; currentUserId?: string }) => {
  const { data: likes = [] } = useReviewLikes(review.id);
  const { data: isLiked = false } = useUserLikedReview(review.id, currentUserId);
  const toggleLike = useToggleReviewLike();

  const handleLikeClick = () => {
    if (!currentUserId) return;
    toggleLike.mutate({
      reviewId: review.id,
      userId: currentUserId,
      isLiked,
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarFallback>
              {review.profiles?.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  {review.profiles?.username || "익명"}
                </p>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                  {review.watched_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(new Date(review.watched_date), "yyyy년 M월 d일", {
                          locale: ko,
                        })}
                      </span>
                    </div>
                  )}
                  {!review.is_public && (
                    <div className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      <span>비공개</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? "fill-primary text-primary"
                      : "text-muted"
                  }`}
                />
              ))}
            </div>

            {review.review_text && (
              <p className="text-foreground/90 leading-relaxed">
                {review.review_text}
              </p>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.created_at), "yyyy년 M월 d일 작성", {
                  locale: ko,
                })}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLikeClick}
                disabled={!currentUserId}
                className="gap-2"
              >
                <Heart 
                  className={`h-4 w-4 ${isLiked ? "fill-accent text-accent" : ""}`} 
                />
                <span className="text-sm">{likes.length}</span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewList;
