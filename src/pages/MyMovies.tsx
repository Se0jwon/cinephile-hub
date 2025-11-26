import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Calendar } from "lucide-react";

const MyMovies = () => {
  // Mock data - 나중에 Lovable Cloud로 실제 데이터 저장
  const myReviews = [
    {
      id: 1,
      movieTitle: "인셉션",
      movieTitleEn: "Inception",
      poster: "https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=400&h=600&fit=crop",
      rating: 5,
      review: "현실과 꿈의 경계가 무너지는 놀라운 영화. 크리스토퍼 놀란의 최고작!",
      watchedDate: "2024-01-15",
    },
    {
      id: 2,
      movieTitle: "다크 나이트",
      movieTitleEn: "The Dark Knight",
      poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&h=600&fit=crop",
      rating: 5,
      review: "히스 레저의 조커 연기는 전설이다. 완벽한 슈퍼히어로 영화.",
      watchedDate: "2024-01-10",
    },
    {
      id: 3,
      movieTitle: "쇼생크 탈출",
      movieTitleEn: "The Shawshank Redemption",
      poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
      rating: 5,
      review: "희망에 관한 가장 아름다운 이야기. 인생 영화.",
      watchedDate: "2024-01-05",
    },
  ];

  return (
    <div className="min-h-screen pt-16">
      <Navigation />
      
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">내가 본 영화</h1>
          <p className="text-muted-foreground">
            총 {myReviews.length}편의 영화를 감상했습니다
          </p>
        </div>

        <div className="grid gap-6">
          {myReviews.map((review) => (
            <Card key={review.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-[200px_1fr] gap-6 p-6">
                  <div className="mx-auto md:mx-0">
                    <img
                      src={review.poster}
                      alt={review.movieTitle}
                      className="w-full max-w-[200px] rounded-lg shadow-lg"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-1">
                        {review.movieTitle}
                      </h3>
                      <p className="text-muted-foreground">
                        {review.movieTitleEn}
                      </p>
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
                      
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{review.watchedDate}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                        내 리뷰
                      </h4>
                      <p className="text-foreground/90 leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyMovies;
