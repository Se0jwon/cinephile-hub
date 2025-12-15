import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useWatchGoal = (year: number = new Date().getFullYear()) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["watch-goal", user?.id, year],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("watch_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", year)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useSetWatchGoal = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ year, targetMovies }: { year: number; targetMovies: number }) => {
      if (!user) throw new Error("User not authenticated");

      const { data: existing } = await supabase
        .from("watch_goals")
        .select("id")
        .eq("user_id", user.id)
        .eq("year", year)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from("watch_goals")
          .update({ target_movies: targetMovies })
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("watch_goals")
          .insert({
            user_id: user.id,
            year,
            target_movies: targetMovies,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["watch-goal", user?.id, variables.year] });
    },
  });
};

export const useWatchProgress = (year: number = new Date().getFullYear()) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["watch-progress", user?.id, year],
    queryFn: async () => {
      if (!user) return { count: 0 };

      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;

      const { count, error } = await supabase
        .from("movies")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", startDate)
        .lte("created_at", endDate);

      if (error) throw error;
      return { count: count || 0 };
    },
    enabled: !!user,
  });
};
