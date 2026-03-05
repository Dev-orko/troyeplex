import React, { useEffect } from 'react'
import Hero from '../components/layout/Hero'
import Row from '../components/layout/Row'

const ROWS = [
  { key: 'trending-movies',  title: 'Trending Movies',     endpoint: '/trending/movie/week',                                          variant: 'landscape' as const },
  { key: 'bollywood',        title: 'Latest Bollywood',     endpoint: '/discover/movie?with_original_language=hi&sort_by=popularity.desc', variant: 'portrait'  as const },
  { key: 'now-playing',      title: 'Now Playing',          endpoint: '/movie/now_playing',                                            variant: 'portrait'  as const },
  { key: 'popular-movies',   title: 'Popular Movies',       endpoint: '/movie/popular',                                                variant: 'portrait'  as const },
  { key: 'top-rated',        title: 'Top Rated',            endpoint: '/movie/top_rated',                                              variant: 'landscape' as const },
  { key: 'upcoming',         title: 'Coming Soon',          endpoint: '/movie/upcoming',                                               variant: 'portrait'  as const },
  { key: 'action',           title: 'Action & Adventure',   endpoint: '/discover/movie?with_genres=28,12',                             variant: 'portrait'  as const },
  { key: 'comedy',           title: 'Comedy Hits',          endpoint: '/discover/movie?with_genres=35',                                variant: 'landscape' as const },
  { key: 'horror',           title: 'Horror',               endpoint: '/discover/movie?with_genres=27',                                variant: 'portrait'  as const },
  { key: 'sci-fi',           title: 'Science Fiction',      endpoint: '/discover/movie?with_genres=878',                               variant: 'landscape' as const },
  { key: 'animation',        title: 'Animation',            endpoint: '/discover/movie?with_genres=16',                                variant: 'portrait'  as const },
]

export default function Movies() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white' }}>
      <Hero variant="movie" />

      {/* Seamless gradient bridge from hero into content */}
      <div style={{
        height: 48,
        marginTop: -48,
        background: 'linear-gradient(to bottom, transparent, #080808)',
        position: 'relative',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 3, paddingBottom: 80 }}>
        {ROWS.map(row => (
          <Row key={row.key} title={row.title} endpoint={row.endpoint} variant={row.variant} />
        ))}
      </div>
    </div>
  )
}
