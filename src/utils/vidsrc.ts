export const VIDEASY_BASE = 'https://player.videasy.net'

export function buildStreamUrl(
  type: 'movie' | 'tv',
  id: string | number,
  season?: number,
  episode?: number
): string {
  return type === 'movie'
    ? `${VIDEASY_BASE}/movie/${id}`
    : `${VIDEASY_BASE}/tv/${id}/${season}/${episode}`
}
