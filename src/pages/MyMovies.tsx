import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Loader2, Trash2, Edit } from "lucide-react";
import { useUserMovies, useDeleteMovie } from "@/hooks/useMovies";
import { useUpdateReview, useDeleteReview } from "@/hooks/useReviews";
import { getImageUrl } from "@/hooks/useTMDB";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReviewForm from "@/components/ReviewForm";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MyMovies = () => {
  const { data: userMovies, isLoading } = useUserMovies();
  const deleteMovieMutation = useDeleteMovie();
  const deleteReviewMutation = useDeleteReview();
  const updateReviewMutation = useUpdateReview();
  const { toast } = useToast();
  
  const [editingReview, setEditingReview] = useState<any>(null);
  const [deletingMovie, setDeletingMovie] = useState<string | null>(null);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);

  const moviesWithReviews = userMovies?.filter(
    (movie) => movie.reviews && movie.reviews.length > 0
  );

  const averageRating =
    moviesWithReviews && moviesWithReviews.length > 0
      ? (
          moviesWithReviews.reduce((sum, movie) => {
            const avgMovieRating =
              movie.reviews.reduce((s: number, r: any) => s + r.rating, 0) /
              movie.reviews.length;
            return sum + avgMovieRating;
          }, 0) / moviesWithReviews.length
        ).toFixed(1)
      : "0.0";

  const handleDeleteMovie = async (movieId: string) => {
    try {
      await deleteMovieMutation.mutateAsync(movieId);
      toast({
        title: "영화가 삭제되었습니다",
      });
      setDeletingMovie(null);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReviewMutation.mutateAsync(reviewId);
      toast({
        title: "리뷰가 삭제되었습니다",
      });
      setDeletingReview(null);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateReview = async (data: {
    rating: number;
    reviewText?: string;
    watchedDate?: string;
    isPublic: boolean;
  }) => {
    if (!editingReview) return;

    try {
      await updateReviewMutation.mutateAsync({
        reviewId: editingReview.id,
        ...data,
      });
      toast({
        title: "리뷰가 수정되었습니다",
      });
      setEditingReview(null);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-16">
        <Navigation />

        <div className="container mx-auto px-4 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">내가 본 영화</h1>
            <div className="flex items-center gap-6 text-muted-foreground">
              <p>총 {moviesWithReviews?.length || 0}편의 영화를 감상했습니다</p>
              {moviesWithReviews && moviesWithReviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-semibold text-foreground">
                    평균 평점: {averageRating}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : moviesWithReviews && moviesWithReviews.length > 0 ? (
            <div className="grid gap-6">
              {moviesWithReviews.map((movie: any) => {
                const review = movie.reviews[0];
                const posterUrl = getImageUrl(movie.poster_path);

                return (
                  <Card key={movie.id} className="overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                    <CardContent className="p-0">
                      <div className="grid md:grid-cols-[200px_1fr] gap-6 p-6">
                        <Link to={`/movie/${movie.tmdb_id}`} className="mx-auto md:mx-0">
                          <img
                            src={posterUrl}
                            alt={movie.title}
                            className="w-full max-w-[200px] rounded-lg shadow-lg hover:scale-105 transition-transform"
                          />
                        </Link>

                        <div className="space-y-4">
                          <div>
                            <Link to={`/movie/${movie.tmdb_id}`}>
                              <h3 className="text-2xl font-bold mb-1 hover:text-primary transition-colors">
                                {movie.title}
                              </h3>
                            </Link>
                            {movie.release_date && (
                              <p className="text-muted-foreground">
                                {movie.release_date.split("-")[0]}
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

                          {review.review_text && (
                            <div>
                              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                                내 리뷰
                              </h4>
                              <p className="text-foreground/90 leading-relaxed line-clamp-3">
                                {review.review_text}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingReview(review)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              리뷰 수정
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeletingReview(review.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              리뷰 삭제
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeletingMovie(movie.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              영화 삭제
                            </Button>
                          </div>
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
                아직 감상한 영화가 없습니다.
              </p>
              <Link to="/">
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  영화 찾아보기
                </button>
              </Link>
            </div>
          )}
        </div>

        <Dialog open={!!editingReview} onOpenChange={() => setEditingReview(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>리뷰 수정</DialogTitle>
            </DialogHeader>
            {editingReview && (
              <ReviewForm
                onSubmit={handleUpdateReview}
                initialData={{
                  rating: editingReview.rating,
                  reviewText: editingReview.review_text,
                  watchedDate: editingReview.watched_date,
                  isPublic: editingReview.is_public,
                }}
                submitLabel="수정하기"
              />
            )}
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deletingMovie} onOpenChange={() => setDeletingMovie(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>영화를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다. 영화와 관련된 모든 리뷰가 함께 삭제됩니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletingMovie && handleDeleteMovie(deletingMovie)}>
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!deletingReview} onOpenChange={() => setDeletingReview(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>리뷰를 삭제하시겠습니까?</AlertDialogTitle>
              <AlertDialogDescription>
                이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={() => deletingReview && handleDeleteReview(deletingReview)}>
                삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ProtectedRoute>
  );
};

export default MyMovies;
