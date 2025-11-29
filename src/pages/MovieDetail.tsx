import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Star, Clock, Calendar, Plus, Check, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navigation from "@/components/Navigation";
import ReviewForm from "@/components/ReviewForm";
import ReviewList from "@/components/ReviewList";
import { useTMDBMovieDetails, getImageUrl } from "@/hooks/useTMDB";
import { useMovieReviews, useAddReview } from "@/hooks/useReviews";
import { useAddMovie, useCheckMovieAdded } from "@/hooks/useMovies";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const MovieDetail = () => {
  const { id } = useParams();
  const movieId = Number(id);
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);

  const { data: movie, isLoading } = useTMDBMovieDetails(movieId);
  const { data: reviews, isLoading: reviewsLoading } = useMovieReviews(movieId);
  const { data: movieAdded } = useCheckMovieAdded(movieId);
  const addMovieMutation = useAddMovie();
  const addReviewMutation = useAddReview();

  const handleAddMovie = async () => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        variant: "destructive",
      });
      return;
    }

    if (!movie) return;

    try {
      const addedMovie = await addMovieMutation.mutateAsync(movie);
      setReviewDialogOpen(true);
    } catch (error: any) {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleReviewSubmit = async (data: {
    rating: number;
    reviewText?: string;
    watchedDate?: string;
    isPublic: boolean;
  }) => {
    if (!movieAdded?.id) {
      toast({
        title: "영화를 먼저 추가해주세요",
        variant: "destructive",
      });
      return;
    }

    await addReviewMutation.mutateAsync({
      movieId: movieAdded.id,
      ...data,
    });

    setReviewDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="flex justify-center items-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen pt-16">
        <Navigation />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">영화를 찾을 수 없습니다</h1>
          <Link to="/">
            <Button variant="default">홈으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    );
  }

  const director = movie.credits?.crew.find((c) => c.job === "Director");
  const backdropUrl = getImageUrl(movie.backdrop_path, "original");
  const posterUrl = getImageUrl(movie.poster_path, "w500");
  const averageRating =
    reviews && reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>

        <div className="relative container mx-auto px-4 h-full flex items-end pb-8">
          <Link to="/">
            <Button variant="secondary" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              뒤로가기
            </Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid md:grid-cols-[300px_1fr] gap-8 mb-12">
          <div className="mx-auto md:mx-0">
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-full max-w-[300px] rounded-lg shadow-2xl"
            />
          </div>

          <div className="space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
                <div className="flex items-center space-x-2 bg-primary/20 px-3 py-1.5 rounded-full">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-bold text-lg">
                    {movie.vote_average.toFixed(1)}
                  </span>
                </div>

                {averageRating && (
                  <div className="flex items-center space-x-2 bg-accent/20 px-3 py-1.5 rounded-full">
                    <span className="text-sm text-muted-foreground">사용자 평균</span>
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="font-bold">{averageRating}</span>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.release_date?.split("-")[0]}</span>
                </div>

                {movie.runtime && (
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{movie.runtime}분</span>
                  </div>
                )}
              </div>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {movie['watch/providers']?.results?.KR?.flatrate && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                  <Tv className="h-4 w-4" />
                  시청 가능 플랫폼
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie['watch/providers'].results.KR.flatrate.map((provider: any) => (
                    <Badge key={provider.provider_id} variant="secondary" className="px-3 py-1.5">
                      {provider.provider_name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {director && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    감독
                  </h3>
                  <p className="text-lg">{director.name}</p>
                </div>
              )}

              {movie.overview && (
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    줄거리
                  </h3>
                  <p className="text-base leading-relaxed text-foreground/90">
                    {movie.overview}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              {!movieAdded ? (
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleAddMovie}
                  disabled={addMovieMutation.isPending || !user}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  내 영화에 추가
                </Button>
              ) : (
                <Button size="lg" variant="secondary" className="flex-1" disabled>
                  <Check className="h-5 w-5 mr-2" />
                  추가됨
                </Button>
              )}

              <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="lg"
                    variant="secondary"
                    className="flex-1"
                    disabled={!movieAdded || !user}
                  >
                    리뷰 작성
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>리뷰 작성</DialogTitle>
                  </DialogHeader>
                  <ReviewForm onSubmit={handleReviewSubmit} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <Separator className="my-12" />

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">
            리뷰 ({reviews?.length || 0})
          </h2>
          {reviewsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReviewList reviews={reviews || []} currentUserId={user?.id} />
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
