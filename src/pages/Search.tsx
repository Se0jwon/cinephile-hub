import { useState } from "react";
import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2 } from "lucide-react";
import { useTMDBSearch } from "@/hooks/useTMDB";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useTMDBSearch(activeQuery, page);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">영화 검색</h1>
          <p className="text-muted-foreground">
            보고 싶은 영화를 검색해보세요
          </p>
        </div>

        <form onSubmit={handleSearch} className="mb-12">
          <div className="flex gap-4 max-w-2xl">
            <Input
              type="text"
              placeholder="영화 제목을 입력하세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-12 text-lg"
            />
            <Button type="submit" size="lg" disabled={isLoading || !searchQuery.trim()}>
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <SearchIcon className="h-5 w-5" />
              )}
              <span className="ml-2">검색</span>
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {data && data.results && data.results.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              검색 결과 ({data.total_results}개)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  voteAverage={movie.vote_average}
                />
              ))}
            </div>

            {data.total_pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  이전
                </Button>
                <div className="flex items-center px-4">
                  <span className="text-sm text-muted-foreground">
                    {page} / {data.total_pages}
                  </span>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(data.total_pages, p + 1))}
                  disabled={page === data.total_pages || isLoading}
                >
                  다음
                </Button>
              </div>
            )}
          </div>
        )}

        {data && data.results && data.results.length === 0 && activeQuery && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              "{activeQuery}"에 대한 검색 결과가 없습니다.
            </p>
          </div>
        )}

        {!activeQuery && (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              영화 제목을 입력하고 검색 버튼을 눌러보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
