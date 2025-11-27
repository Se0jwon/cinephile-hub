import { useParams, useSearchParams, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import { Button } from "@/components/ui/button";
import { useTMDBPopular, useTMDBNowPlaying } from "@/hooks/useTMDB";
import { Loader2, ArrowLeft } from "lucide-react";

const CategoryMovies = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const page = parseInt(searchParams.get("page") || "1");

  const { data, isLoading } =
    category === "popular"
      ? useTMDBPopular(page)
      : useTMDBNowPlaying(page);

  const categoryTitle = category === "popular" ? "인기 영화" : "현재 상영중";

  return (
    <div className="min-h-screen pt-16">
      <Navigation />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center gap-4">
          <Link to="/">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              홈으로
            </Button>
          </Link>
          <h1 className="text-4xl font-bold">{categoryTitle}</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data?.results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  voteAverage={movie.vote_average}
                />
              ))}
            </div>

            <div className="flex justify-center gap-4 mt-12">
              <Link
                to={`/category/${category}?page=${Math.max(1, page - 1)}`}
              >
                <Button
                  variant="secondary"
                  disabled={page === 1}
                >
                  이전
                </Button>
              </Link>
              <span className="flex items-center px-4 text-sm">
                {page} / {data?.total_pages}
              </span>
              <Link
                to={`/category/${category}?page=${Math.min(
                  data?.total_pages || 1,
                  page + 1
                )}`}
              >
                <Button
                  variant="secondary"
                  disabled={page >= (data?.total_pages || 1)}
                >
                  다음
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryMovies;
