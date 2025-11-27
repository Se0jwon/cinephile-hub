import Navigation from "@/components/Navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar, Loader2 } from "lucide-react";
import { useUserMovies } from "@/hooks/useMovies";
import { getImageUrl } from "@/hooks/useTMDB";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import ProtectedRoute from "@/components/ProtectedRoute";

const MyMovies = () => {
  const { data: userMovies, isLoading } = useUserMovies();

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
                  <Link key={movie.id} to={`/movie/${movie.tmdb_id}`}>
                    <Card className="overflow-hidden hover:ring-2 hover:ring-primary transition-all">
                      <CardContent className="p-0">
                        <div className="grid md:grid-cols-[200px_1fr] gap-6 p-6">
                          <div className="mx-auto md:mx-0">
                            <img
                              src={posterUrl}
                              alt={movie.title}
                              className="w-full max-w-[200px] rounded-lg shadow-lg"
                            />
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h3 className="text-2xl font-bold mb-1">
                                {movie.title}
                              </h3>
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
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
      </div>
    </ProtectedRoute>
  );
};

export default MyMovies;
