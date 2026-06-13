// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '9f6dbcbddf9565f6a0f004fca81f83ee';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  genre_ids: number[];
  original_language: string;
  video: boolean;
}

export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  original_language: string;
  origin_country: string[];
}

export interface MovieDetails extends Movie {
  budget: number;
  revenue: number;
  runtime: number;
  status: string;
  tagline: string;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  spoken_languages: { english_name: string; iso_639_1: string; name: string }[];
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }[];
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
  similar?: {
    results: Movie[];
  };
}

export interface TVShowDetails extends TVShow {
  created_by: { id: number; name: string; profile_path: string | null }[];
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
  } | null;
  name: string;
  next_episode_to_air: {
    id: number;
    name: string;
    overview: string;
    air_date: string;
    episode_number: number;
    season_number: number;
  } | null;
  networks: { id: number; name: string; logo_path: string | null }[];
  number_of_episodes: number;
  number_of_seasons: number;
  seasons: {
    id: number;
    name: string;
    overview: string;
    poster_path: string | null;
    season_number: number;
    episode_count: number;
    air_date: string;
  }[];
  status: string;
  type: string;
  videos?: {
    results: {
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }[];
  };
  credits?: {
    cast: {
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }[];
    crew: {
      id: number;
      name: string;
      job: string;
      profile_path: string | null;
    }[];
  };
  similar?: {
    results: TVShow[];
  };
}

export interface SearchResult {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

// Image URL helpers
export const getImageUrl = (path: string | null, size: 'w200' | 'w300' | 'w500' | 'w780' | 'original' = 'w500') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getBackdropUrl = (path: string | null, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280') => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

// TMDB API fetch function with timeout and retry
async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}, retries = 3): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', TMDB_API_KEY);
  url.searchParams.append('language', 'en-US');
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (retries > 0 && (error instanceof Error && error.name === 'AbortError' || error instanceof TypeError)) {
      console.log(`Retrying TMDB fetch: ${endpoint}, retries left: ${retries - 1}`);
      await new Promise(resolve => setTimeout(resolve, 500));
      return tmdbFetch<T>(endpoint, params, retries - 1);
    }
    
    throw error;
  }
}

// Movie endpoints
export const movies = {
  getTrending: (timeWindow: 'day' | 'week' = 'week') => 
    tmdbFetch<{ results: Movie[] }>(`/trending/movie/${timeWindow}`),
  
  getPopular: (page = 1) => 
    tmdbFetch<{ results: Movie[]; total_pages: number }>(`/movie/popular`, { page: page.toString() }),
  
  getTopRated: (page = 1) => 
    tmdbFetch<{ results: Movie[]; total_pages: number }>(`/movie/top_rated`, { page: page.toString() }),
  
  getNowPlaying: (page = 1) => 
    tmdbFetch<{ results: Movie[]; total_pages: number }>(`/movie/now_playing`, { page: page.toString() }),
  
  getUpcoming: (page = 1) => 
    tmdbFetch<{ results: Movie[]; total_pages: number }>(`/movie/upcoming`, { page: page.toString() }),
  
  getDetails: (movieId: number) => 
    tmdbFetch<MovieDetails>(`/movie/${movieId}`, { append_to_response: 'videos,credits,similar' }),
  
  getSimilar: (movieId: number) => 
    tmdbFetch<{ results: Movie[] }>(`/movie/${movieId}/similar`),
  
  getByGenre: (genreId: number, page = 1) => 
    tmdbFetch<{ results: Movie[]; total_pages: number }>(`/discover/movie`, { 
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: 'popularity.desc'
    }),
};

// TV Show endpoints
export const tvShows = {
  getTrending: (timeWindow: 'day' | 'week' = 'week') => 
    tmdbFetch<{ results: TVShow[] }>(`/trending/tv/${timeWindow}`),
  
  getPopular: (page = 1) => 
    tmdbFetch<{ results: TVShow[]; total_pages: number }>(`/tv/popular`, { page: page.toString() }),
  
  getTopRated: (page = 1) => 
    tmdbFetch<{ results: TVShow[]; total_pages: number }>(`/tv/top_rated`, { page: page.toString() }),
  
  getOnTheAir: (page = 1) => 
    tmdbFetch<{ results: TVShow[]; total_pages: number }>(`/tv/on_the_air`, { page: page.toString() }),
  
  getAiringToday: (page = 1) => 
    tmdbFetch<{ results: TVShow[]; total_pages: number }>(`/tv/airing_today`, { page: page.toString() }),
  
  getDetails: (tvId: number) => 
    tmdbFetch<TVShowDetails>(`/tv/${tvId}`, { append_to_response: 'videos,credits,similar' }),
  
  getSimilar: (tvId: number) => 
    tmdbFetch<{ results: TVShow[] }>(`/tv/${tvId}/similar`),
  
  getByGenre: (genreId: number, page = 1) => 
    tmdbFetch<{ results: TVShow[]; total_pages: number }>(`/discover/tv`, { 
      with_genres: genreId.toString(),
      page: page.toString(),
      sort_by: 'popularity.desc'
    }),
};

// Search endpoints
export const search = {
  multi: (query: string, page = 1) => 
    tmdbFetch<SearchResult>(`/search/multi`, { query, page: page.toString() }),
  
  movies: (query: string, page = 1) => 
    tmdbFetch<{ results: Movie[]; total_pages: number }>(`/search/movie`, { query, page: page.toString() }),
  
  tvShows: (query: string, page = 1) => 
    tmdbFetch<{ results: TVShow[]; total_pages: number }>(`/search/tv`, { query, page: page.toString() }),
};

// Genres
export const genres = {
  getMovieGenres: () => 
    tmdbFetch<{ genres: { id: number; name: string }[] }>(`/genre/movie/list`),
  
  getTVGenres: () => 
    tmdbFetch<{ genres: { id: number; name: string }[] }>(`/genre/tv/list`),
};

// Get both trending movies and TV shows
export async function getTrendingAll() {
  const [moviesData, tvData] = await Promise.all([
    movies.getTrending('week'),
    tvShows.getTrending('week'),
  ]);
  
  return {
    movies: moviesData.results,
    tvShows: tvData.results,
  };
}

// Get hero content (random trending item)
export async function getHeroContent() {
  const { movies, tvShows } = await getTrendingAll();
  const allContent = [...movies, ...tvShows];
  
  // Get a random item with backdrop
  const withBackdrop = allContent.filter(item => item.backdrop_path);
  const randomIndex = Math.floor(Math.random() * Math.min(5, withBackdrop.length));
  
  return withBackdrop[randomIndex] || allContent[0];
}
