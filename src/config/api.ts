export const API_CONFIG = {
  TMDB_API_KEY: import.meta.env.VITE_TMDB_API_KEY || '3ccf3bbfa9b25213ac74c50f96d238d0',
  TMDB_BASE_URL: 'https://api.themoviedb.org/3',
  TMDB_IMAGE_BASE: 'https://image.tmdb.org/t/p',
  TMDB_BACKDROP_SIZE: 'original',
  TMDB_POSTER_SIZE: 'w500',
  TMDB_THUMBNAIL_SIZE: 'w342',
}

export const STREAM_CONFIG = {
  VIDEASY_BASE: 'https://player.videasy.net',
}
