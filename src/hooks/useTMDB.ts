import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids?: number[];
  genres?: Array<{ id: number; name: string }>;
  runtime?: number;
  credits?: {
    crew: Array<{ job: string; name: string }>;
  };
}

export interface TMDBResponse {
  results: TMDBMovie[];
  page: number;
  total_pages: number;
  total_results: number;
}

export const useTMDBSearch = (query: string, page: number = 1) => {
  return useQuery({
    queryKey: ['tmdb-search', query, page],
    queryFn: async () => {
      if (!query.trim()) return { results: [], page: 1, total_pages: 0, total_results: 0 };
      
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { action: 'search', query, page }
      });

      if (error) throw error;
      return data as TMDBResponse;
    },
    enabled: !!query.trim(),
  });
};

export const useTMDBPopular = (page: number = 1) => {
  return useQuery({
    queryKey: ['tmdb-popular', page],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { action: 'popular', page }
      });

      if (error) throw error;
      return data as TMDBResponse;
    },
  });
};

export const useTMDBNowPlaying = (page: number = 1) => {
  return useQuery({
    queryKey: ['tmdb-now-playing', page],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { action: 'now_playing', page }
      });

      if (error) throw error;
      return data as TMDBResponse;
    },
  });
};

export const useTMDBMovieDetails = (movieId: number) => {
  return useQuery({
    queryKey: ['tmdb-movie', movieId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { action: 'details', movieId }
      });

      if (error) throw error;
      return data as TMDBMovie;
    },
    enabled: !!movieId,
  });
};

// Hook for fetching movies by streaming provider
export const useTMDBByProvider = (providerId: number, page: number = 1) => {
  return useQuery({
    queryKey: ['tmdb', 'provider', providerId, page],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('tmdb', {
        body: { action: 'provider', providerId, page }
      });
      if (error) throw error;
      return data as TMDBResponse;
    },
  });
};

export const getImageUrl = (path: string | null, size: 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return '/placeholder.svg';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};
