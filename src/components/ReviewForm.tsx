import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Star, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const REVIEW_TAGS = [
  { id: "touching", label: "감동적인", emoji: "😢" },
  { id: "funny", label: "재미있는", emoji: "😂" },
  { id: "scary", label: "무서운", emoji: "😱" },
  { id: "thought-provoking", label: "생각하게 하는", emoji: "🤔" },
  { id: "romantic", label: "로맨틱한", emoji: "💕" },
  { id: "exciting", label: "긴장감 넘치는", emoji: "🔥" },
  { id: "beautiful", label: "아름다운", emoji: "✨" },
  { id: "boring", label: "지루한", emoji: "😴" },
];

interface ReviewFormProps {
  onSubmit: (data: {
    rating: number;
    reviewText?: string;
    watchedDate?: string;
    isPublic: boolean;
    tags?: string[];
    hasSpoiler?: boolean;
  }) => Promise<void>;
  initialData?: {
    rating: number;
    reviewText?: string;
    watchedDate?: string;
    isPublic: boolean;
    tags?: string[];
    hasSpoiler?: boolean;
  };
  submitLabel?: string;
}

const ReviewForm = ({ onSubmit, initialData, submitLabel = "리뷰 작성" }: ReviewFormProps) => {
  const [rating, setRating] = useState(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(initialData?.reviewText || "");
  const [watchedDate, setWatchedDate] = useState(initialData?.watchedDate || "");
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData?.tags || []);
  const [hasSpoiler, setHasSpoiler] = useState(initialData?.hasSpoiler ?? false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((t) => t !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: "평점을 선택해주세요",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        rating,
        reviewText: reviewText || undefined,
        watchedDate: watchedDate || undefined,
        isPublic,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        hasSpoiler,
      });

      if (!initialData) {
        setRating(0);
        setReviewText("");
        setWatchedDate("");
        setIsPublic(true);
        setSelectedTags([]);
        setHasSpoiler(false);
      }

      toast({
        title: "성공",
        description: initialData ? "리뷰가 수정되었습니다." : "리뷰가 작성되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>평점 *</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoveredRating || rating)
                    ? "fill-primary text-primary"
                    : "text-muted"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reviewText">리뷰</Label>
        <Textarea
          id="reviewText"
          placeholder="영화에 대한 생각을 자유롭게 작성해주세요..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="watchedDate">관람일</Label>
        <input
          type="date"
          id="watchedDate"
          value={watchedDate}
          onChange={(e) => setWatchedDate(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label>태그 (선택)</Label>
        <div className="flex flex-wrap gap-2">
          {REVIEW_TAGS.map((tag) => (
            <Badge
              key={tag.id}
              variant={selectedTags.includes(tag.id) ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/80 transition-colors"
              onClick={() => toggleTag(tag.id)}
            >
              {tag.emoji} {tag.label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          <Label htmlFor="hasSpoiler">스포일러 포함</Label>
        </div>
        <Switch
          id="hasSpoiler"
          checked={hasSpoiler}
          onCheckedChange={setHasSpoiler}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="isPublic">공개 리뷰</Label>
        <Switch
          id="isPublic"
          checked={isPublic}
          onCheckedChange={setIsPublic}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "저장 중..." : submitLabel}
      </Button>
    </form>
  );
};

export default ReviewForm;
