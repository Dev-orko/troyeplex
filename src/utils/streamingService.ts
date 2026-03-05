export function getMovieStreamUrl(movieId: string | number): string {
  return `https://player.videasy.net/movie/${movieId}`
}

export function getTVStreamUrl(
  seriesId: string | number,
  season: number,
  episode: number
): string {
  return `https://player.videasy.net/tv/${seriesId}/${season}/${episode}`
}
