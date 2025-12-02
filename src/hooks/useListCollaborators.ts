import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useListCollaborators = (listId: string) => {
  return useQuery({
    queryKey: ["list-collaborators", listId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("list_collaborators")
        .select("*")
        .eq("list_id", listId);

      if (error) throw error;

      const collaboratorsWithProfiles = await Promise.all(
        (data || []).map(async (collab) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username, avatar_url")
            .eq("id", collab.user_id)
            .maybeSingle();

          return {
            ...collab,
            profiles: profile,
          };
        })
      );

      return collaboratorsWithProfiles;
    },
    enabled: !!listId,
  });
};

export const useAddCollaborator = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      listId,
      userEmail,
    }: {
      listId: string;
      userEmail: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Find user by email
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userEmail)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile) throw new Error("User not found");

      const { data, error } = await supabase
        .from("list_collaborators")
        .insert({
          list_id: listId,
          user_id: profile.id,
          can_edit: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-collaborators"] });
    },
  });
};

export const useRemoveCollaborator = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      listId,
      collaboratorId,
    }: {
      listId: string;
      collaboratorId: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from("list_collaborators")
        .delete()
        .eq("id", collaboratorId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["list-collaborators"] });
    },
  });
};

export const useIsCollaborator = (listId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["is-collaborator", listId, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("list_collaborators")
        .select("id")
        .eq("list_id", listId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!user && !!listId,
  });
};
