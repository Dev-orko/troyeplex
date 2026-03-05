import React, { useEffect } from 'react'
import Hero from '../components/layout/Hero'
import Row from '../components/layout/Row'

const ROWS = [
  { key: 'trending-tv',   title: 'Trending TV',        endpoint: '/trending/tv/week',                   variant: 'landscape' as const },
  { key: 'popular-tv',    title: 'Popular Shows',       endpoint: '/tv/popular',                         variant: 'portrait'  as const },
  { key: 'top-rated-tv',  title: 'Top Rated TV',        endpoint: '/tv/top_rated',                       variant: 'landscape' as const },
  { key: 'on-air',        title: 'Currently Airing',    endpoint: '/tv/on_the_air',                      variant: 'portrait'  as const },
  { key: 'airing-today',  title: 'Airing Today',        endpoint: '/tv/airing_today',                    variant: 'portrait'  as const },
  { key: 'drama',         title: 'Drama & Suspense',    endpoint: '/discover/tv?with_genres=18,9648,80', variant: 'landscape' as const },
  { key: 'animation-tv',  title: 'Animated Series',     endpoint: '/discover/tv?with_genres=16',         variant: 'portrait'  as const },
  { key: 'crime',         title: 'Crime & Thriller',    endpoint: '/discover/tv?with_genres=80,9648',    variant: 'landscape' as const },
  { key: 'scifi-tv',      title: 'Sci-Fi & Fantasy',    endpoint: '/discover/tv?with_genres=10765',      variant: 'portrait'  as const },
  { key: 'reality',       title: 'Reality & Talk',      endpoint: '/discover/tv?with_genres=10764,10767',variant: 'portrait'  as const },
]

export default function Series() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white' }}>
      <Hero variant="tv" />

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
