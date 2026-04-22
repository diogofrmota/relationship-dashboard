import { API_CONFIG, PLACEHOLDER_IMAGE } from '../config.js';

/**
 * Search for movies and TV shows using TMDB API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of movie/TV show objects
 */
export const searchMovies = async (query) => {
  try {
    const { TMDB } = API_CONFIG;

    const url = new URL(`${TMDB.BASE_URL}${TMDB.ENDPOINTS.SEARCH_MULTI}`);
    url.searchParams.append('api_key', TMDB.API_KEY);
    url.searchParams.append('query', query);
    url.searchParams.append('include_adult', false);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch movies');

    const data = await response.json();

    return data.results
      .filter(item => item.media_type === 'movie')
      .map(item => transformMovieData(item));
  } catch (error) {
    console.error('Movie search error:', error);
    return [];
  }
};

export const searchTvShows = async (query) => {
  try {
    const { TMDB, JIKAN } = API_CONFIG;

    const tmdbUrl = new URL(`${TMDB.BASE_URL}${TMDB.ENDPOINTS.SEARCH_MULTI}`);
    tmdbUrl.searchParams.append('api_key', TMDB.API_KEY);
    tmdbUrl.searchParams.append('query', query);
    tmdbUrl.searchParams.append('include_adult', false);

    const jikanUrl = new URL(`${JIKAN.BASE_URL}${JIKAN.ENDPOINTS.SEARCH_ANIME}`);
    jikanUrl.searchParams.append('q', query);
    jikanUrl.searchParams.append('limit', 10);

    const [tmdbResult, jikanResult] = await Promise.allSettled([
      fetch(tmdbUrl.toString()).then(r => r.json()),
      fetch(jikanUrl.toString()).then(r => r.json())
    ]);

    const tvResults = tmdbResult.status === 'fulfilled'
      ? (tmdbResult.value.results || []).filter(i => i.media_type === 'tv').map(transformMovieData)
      : [];

    const animeResults = jikanResult.status === 'fulfilled'
      ? (jikanResult.value.data || []).map(transformAnimeData)
      : [];

    return [...tvResults, ...animeResults];
  } catch (error) {
    console.error('TV show search error:', error);
    return [];
  }
};

/**
 * Search for anime using Jikan API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of anime objects
 */
export const searchAnime = async (query) => {
  try {
    const { JIKAN } = API_CONFIG;
    const url = new URL(`${JIKAN.BASE_URL}${JIKAN.ENDPOINTS.SEARCH_ANIME}`);
    url.searchParams.append('q', query);
    url.searchParams.append('limit', 10);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch anime');

    const data = await response.json();
    
    return data.data.map(item => transformAnimeData(item));
  } catch (error) {
    console.error('Anime search error:', error);
    return [];
  }
};

/**
 * Search for books using Open Library API
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of book objects
 */
export const searchBooks = async (query) => {
  try {
    const url = new URL('https://openlibrary.org/search.json');
    url.searchParams.append('q', query);
    url.searchParams.append('limit', 20);
    url.searchParams.append('fields', 'key,title,author_name,first_publish_year,cover_i,ratings_average');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch books');

    const data = await response.json();
    return (data.docs || []).map(doc => transformBookData(doc));
  } catch (error) {
    console.error('Book search error:', error);
    return [];
  }
};

/**
 * Transform TMDB response to standardized format
 * @private
 */
const transformMovieData = (item) => ({
  id: `tmdb-${item.id}`,
  title: item.title || item.name,
  thumbnail: item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : PLACEHOLDER_IMAGE,
  rating: item.vote_average?.toFixed(1) || 'N/A',
  year: item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A',
  type: item.media_type === 'movie' ? 'Movie' : 'TV Show'
});

/**
 * Transform Jikan response to standardized format
 * @private
 */
const transformAnimeData = (item) => ({
  id: `mal-${item.mal_id}`,
  title: item.title,
  thumbnail: item.images?.jpg?.image_url || PLACEHOLDER_IMAGE,
  rating: item.score?.toFixed(1) || 'N/A',
  year: item.year || 'N/A',
  type: item.type || 'Anime'
});

/**
 * Transform Open Library search doc to standardized format
 * @private
 */
const transformBookData = (doc) => ({
  id: `book-${doc.key?.replace('/works/', '') || Math.random().toString(36).slice(2)}`,
  title: doc.title || 'Unknown Title',
  thumbnail: doc.cover_i
    ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
    : PLACEHOLDER_IMAGE,
  rating: doc.ratings_average ? parseFloat(doc.ratings_average).toFixed(1) : 'N/A',
  year: doc.first_publish_year?.toString() || 'N/A',
  author: doc.author_name?.[0] || 'Unknown Author'
});