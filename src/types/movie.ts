export interface Movie {
  id: number;
  title: string;
  titleKo: string;
  poster: string;
  backdrop: string;
  rating: number;
  year: number;
  genre: string[];
  director: string;
  cast: string[];
  plot: string;
  runtime: number;
}

export interface UserReview {
  movieId: number;
  rating: number;
  review: string;
  watchedDate: string;
}
