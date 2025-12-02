import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, Lock, Heart, MessageCircle, Send, Trash2, Smile } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useReviewLikes, useUserLikedReview, useToggleReviewLike } from "@/hooks/useReviewLikes";
import { useReviewComments, useAddComment, useDeleteComment } from "@/hooks/useReviewComments";
import { useReviewReactions, useUserReactions, useToggleReaction, ReactionType } from "@/hooks/useReviewReactions";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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

const REACTION_EMOJIS: Record<ReactionType, { emoji: string; label: string }> = {
  like: { emoji: "👍", label: "좋아요" },
  love: { emoji: "❤️", label: "사랑해요" },
  laugh: { emoji: "😂", label: "웃겨요" },
  surprised: { emoji: "😲", label: "놀라워요" },
  sad: { emoji: "😢", label: "슬퍼요" },
  angry: { emoji: "😠", label: "화나요" },
};

const ReviewCard = ({ review, currentUserId }: { review: Review; currentUserId?: string }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const { data: likes = [] } = useReviewLikes(review.id);
  const { data: isLiked = false } = useUserLikedReview(review.id, currentUserId);
  const { data: comments = [] } = useReviewComments(review.id);
  const { data: reactions = [] } = useReviewReactions(review.id);
  const { data: userReactions = [] } = useUserReactions(review.id);
  const toggleLike = useToggleReviewLike();
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const toggleReaction = useToggleReaction();
  const { toast } = useToast();

  const handleLikeClick = () => {
    if (!currentUserId) return;
    toggleLike.mutate({
      reviewId: review.id,
      userId: currentUserId,
      isLiked,
    });
  };

  const handleAddComment = () => {
    if (!currentUserId || !commentText.trim()) return;
    
    addComment.mutate(
      {
        reviewId: review.id,
        commentText: commentText.trim(),
      },
      {
        onSuccess: () => {
          setCommentText("");
          toast({
            title: "댓글이 작성되었습니다",
          });
        },
        onError: () => {
          toast({
            title: "댓글 작성 실패",
            description: "다시 시도해주세요",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDeleteComment = (commentId: string) => {
    deleteComment.mutate(commentId, {
      onSuccess: () => {
        toast({
          title: "댓글이 삭제되었습니다",
        });
      },
    });
  };

  const handleReactionClick = (reaction: ReactionType) => {
    if (!currentUserId) return;
    
    const isActive = userReactions.some((r: any) => r.reaction === reaction);
    
    toggleReaction.mutate({
      reviewId: review.id,
      reaction,
      isActive,
    });
  };

  // Group reactions by type and count
  const reactionCounts = reactions.reduce((acc: Record<ReactionType, number>, r: any) => {
    acc[r.reaction as ReactionType] = (acc[r.reaction as ReactionType] || 0) + 1;
    return acc;
  }, {} as Record<ReactionType, number>);

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

            {/* Reaction badges */}
            {Object.keys(reactionCounts).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(Object.entries(reactionCounts) as [ReactionType, number][]).map(([type, count]) => (
                  <Badge
                    key={type}
                    variant="secondary"
                    className="cursor-pointer text-xs"
                    onClick={() => handleReactionClick(type)}
                  >
                    {REACTION_EMOJIS[type].emoji} {count}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.created_at), "yyyy년 M월 d일 작성", {
                  locale: ko,
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{comments.length}</span>
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!currentUserId}
                      className="gap-2"
                    >
                      <Smile className="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex gap-1">
                      {(Object.keys(REACTION_EMOJIS) as ReactionType[]).map((type) => {
                        const isActive = userReactions.some((r: any) => r.reaction === type);
                        return (
                          <Button
                            key={type}
                            variant={isActive ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleReactionClick(type)}
                            className="text-lg p-2 h-auto"
                          >
                            {REACTION_EMOJIS[type].emoji}
                          </Button>
                        );
                      })}
                    </div>
                  </PopoverContent>
                </Popover>
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

            {showComments && (
              <div className="mt-4 space-y-3 border-t pt-4">
                {comments.map((comment: any) => (
                  <div key={comment.id} className="flex items-start gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {comment.profiles?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {comment.profiles?.username || "익명"}
                        </p>
                        {currentUserId === comment.user_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-foreground/80 break-words">
                        {comment.comment_text}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(comment.created_at), "yyyy.MM.dd HH:mm", {
                          locale: ko,
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {currentUserId && (
                  <div className="flex gap-2 pt-2">
                    <Input
                      placeholder="댓글을 입력하세요..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleAddComment();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!commentText.trim() || addComment.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReviewList;
