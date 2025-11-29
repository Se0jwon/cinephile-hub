import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useMovieLists = (userId?: string) => {
  return useQuery({
    queryKey: ['movie-lists', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movie_lists')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
};

export const usePublicMovieLists = () => {
  return useQuery({
    queryKey: ['public-movie-lists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('movie_lists')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
};

export const useListMovies = (listId: string) => {
  return useQuery({
    queryKey: ['list-movies', listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('list_movies')
        .select('*')
        .eq('list_id', listId)
        .order('added_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!listId,
  });
};

export const useCreateMovieList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { 
      name: string; 
      description?: string; 
      is_public: boolean;
      user_id: string;
    }) => {
      const { data: list, error } = await supabase
        .from('movie_lists')
        .insert(data)
        .select()
        .single();
      
      if (error) throw error;
      return list;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['movie-lists', variables.user_id] });
      toast({
        title: "리스트가 생성되었습니다",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useAddMovieToList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: {
      list_id: string;
      tmdb_id: number;
      title: string;
      poster_path: string | null;
    }) => {
      const { error } = await supabase
        .from('list_movies')
        .insert(data);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list-movies', variables.list_id] });
      toast({
        title: "영화가 추가되었습니다",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useRemoveMovieFromList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, tmdbId }: { listId: string; tmdbId: number }) => {
      const { error } = await supabase
        .from('list_movies')
        .delete()
        .eq('list_id', listId)
        .eq('tmdb_id', tmdbId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['list-movies', variables.listId] });
      toast({
        title: "영화가 제거되었습니다",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMovieList = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, userId }: { listId: string; userId: string }) => {
      const { error } = await supabase
        .from('movie_lists')
        .delete()
        .eq('id', listId)
        .eq('user_id', userId);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['movie-lists', variables.userId] });
      toast({
        title: "리스트가 삭제되었습니다",
      });
    },
    onError: (error: any) => {
      toast({
        title: "오류",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
