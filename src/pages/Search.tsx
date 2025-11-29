import { useState } from "react";
import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Loader2, SlidersHorizontal } from "lucide-react";
import { useTMDBSearch, useTMDBGenres, useTMDBByGenre, useTMDBByProvider } from "@/hooks/useTMDB";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const { data: genresData } = useTMDBGenres();
  
  const { data: searchData, isLoading: searchLoading } = useTMDBSearch(
    activeQuery, 
    page
  );
  
  const { data: genreData, isLoading: genreLoading } = useTMDBByGenre(
    selectedGenre ? Number(selectedGenre) : 0,
    page
  );
  
  const { data: platformData, isLoading: platformLoading } = useTMDBByProvider(
    selectedPlatform ? Number(selectedPlatform) : 0,
    page
  );

  const platforms = [
    { id: "8", name: "Netflix" },
    { id: "337", name: "Disney+" },
    { id: "97", name: "Watcha" },
  ];

  const isLoading = searchLoading || genreLoading || platformLoading;
  
  // Determine which data to show based on active filters
  let data = null;
  if (activeQuery) {
    data = searchData;
  } else if (selectedPlatform) {
    data = platformData;
  } else if (selectedGenre) {
    data = genreData;
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveQuery(searchQuery);
    setSelectedGenre("");
    setSelectedPlatform("");
    setPage(1);
  };

  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    setActiveQuery("");
    setSelectedPlatform("");
    setPage(1);
  };

  const handlePlatformChange = (value: string) => {
    setSelectedPlatform(value);
    setActiveQuery("");
    setSelectedGenre("");
    setPage(1);
  };

  const handleClearFilters = () => {
    setActiveQuery("");
    setSelectedGenre("");
    setSelectedPlatform("");
    setSearchQuery("");
    setPage(1);
  };

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">영화 검색</h1>
          <p className="text-muted-foreground">
            보고 싶은 영화를 검색하거나 필터로 찾아보세요
          </p>
        </div>

        <Card className="p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="영화 제목을 입력하세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 h-12 text-lg"
              />
              <Button type="submit" size="lg" disabled={isLoading || !searchQuery.trim()}>
                {isLoading && activeQuery ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <SearchIcon className="h-5 w-5" />
                )}
                <span className="ml-2">검색</span>
              </Button>
            </div>
          </form>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="font-semibold">고급 필터</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">장르</label>
                <Select value={selectedGenre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="장르 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {genresData?.genres.map((genre) => (
                      <SelectItem key={genre.id} value={String(genre.id)}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">플랫폼</label>
                <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="플랫폼 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((platform) => (
                      <SelectItem key={platform.id} value={platform.id}>
                        {platform.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {(activeQuery || selectedGenre || selectedPlatform) && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="mt-2"
              >
                모든 필터 지우기
              </Button>
            )}
          </div>
        </Card>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {data && data.results && data.results.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">
              {activeQuery && `"${activeQuery}" 검색 결과 `}
              {selectedGenre && `${genresData?.genres.find(g => g.id === Number(selectedGenre))?.name} 장르 `}
              {selectedPlatform && `${platforms.find(p => p.id === selectedPlatform)?.name} `}
              ({data.total_results}개)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data.results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.poster_path}
                  voteAverage={movie.vote_average}
                  platform={selectedPlatform === "8" ? "netflix" : selectedPlatform === "337" ? "disney" : selectedPlatform === "97" ? "watcha" : undefined}
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

        {data && data.results && data.results.length === 0 && (activeQuery || selectedGenre || selectedPlatform) && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              검색 결과가 없습니다.
            </p>
          </div>
        )}

        {!activeQuery && !selectedGenre && !selectedPlatform && (
          <div className="text-center py-12">
            <SearchIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              영화 제목을 검색하거나 필터를 선택해보세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
