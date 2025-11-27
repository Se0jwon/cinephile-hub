import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TMDBMovie } from "./useTMDB";
import { useAuth } from "./useAuth";

export const useUserMovies = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-movies", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("movies")
        .select("*, reviews(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useAddMovie = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (movie: TMDBMovie) => {
      if (!user) throw new Error("User not authenticated");

      const director = movie.credits?.crew.find((c) => c.job === "Director")?.name;

      const { data, error } = await supabase
        .from("movies")
        .insert({
          user_id: user.id,
          tmdb_id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          runtime: movie.runtime,
          genres: movie.genres?.map((g) => g.name),
          director: director,
          vote_average: movie.vote_average,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-movies"] });
    },
  });
};

export const useCheckMovieAdded = (tmdbId: number) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["movie-added", tmdbId, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("movies")
        .select("id")
        .eq("user_id", user.id)
        .eq("tmdb_id", tmdbId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
