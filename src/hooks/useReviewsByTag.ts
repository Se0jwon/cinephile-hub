import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useReviewsByTag = (tag: string | null) => {
  return useQuery({
    queryKey: ['reviews-by-tag', tag],
    queryFn: async () => {
      if (!tag) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          movies(id, title, poster_path, tmdb_id),
          profiles:user_id(username, avatar_url)
        `)
        .eq('is_public', true)
        .contains('tags', [tag])
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!tag,
  });
};

export const REVIEW_TAGS = [
  { id: "touching", label: "감동적인", emoji: "🥹" },
  { id: "fun", label: "재미있는", emoji: "😄" },
  { id: "scary", label: "무서운", emoji: "😱" },
  { id: "romantic", label: "로맨틱한", emoji: "💕" },
  { id: "thoughtful", label: "생각할거리", emoji: "🤔" },
  { id: "visually_stunning", label: "영상미", emoji: "🎨" },
  { id: "great_ost", label: "OST가 좋은", emoji: "🎵" },
  { id: "rewatch", label: "다시 보고싶은", emoji: "🔄" },
];
