import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');
    if (!TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not configured');
    }

    const { action, query, movieId, page = 1, providerId, genreId } = await req.json();
    const baseUrl = 'https://api.themoviedb.org/3';
    
    let url = '';
    
    switch (action) {
      case 'search':
        url = `${baseUrl}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=ko-KR`;
        break;
      case 'popular':
        url = `${baseUrl}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=ko-KR`;
        break;
      case 'now_playing':
        url = `${baseUrl}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}&language=ko-KR&region=KR`;
        break;
      case 'details':
        url = `${baseUrl}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=ko-KR&append_to_response=credits,watch/providers`;
        break;
      case 'provider':
        url = `${baseUrl}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=${providerId}&watch_region=KR&page=${page}&language=ko-KR&sort_by=popularity.desc`;
        break;
      case 'genre':
        url = `${baseUrl}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&language=ko-KR&sort_by=popularity.desc`;
        break;
      case 'genres':
        url = `${baseUrl}/genre/movie/list?api_key=${TMDB_API_KEY}&language=ko-KR`;
        break;
      default:
        throw new Error('Invalid action');
    }

    console.log(`Fetching TMDB data: ${action}`, { query, movieId, page });

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('TMDB API error:', response.status, errorText);
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in tmdb function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
