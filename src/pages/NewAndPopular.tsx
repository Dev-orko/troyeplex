import React, { useEffect } from 'react'
import Hero from '../components/layout/Hero'
import Row from '../components/layout/Row'

const ROWS = [
  { key: 'trending-today',  title: 'Trending Today',      endpoint: '/trending/all/day',    variant: 'landscape' as const },
  { key: 'trending-week',   title: 'Trending This Week',  endpoint: '/trending/all/week',   variant: 'portrait'  as const },
  { key: 'upcoming',        title: 'Coming Soon',         endpoint: '/movie/upcoming',      variant: 'portrait'  as const },
  { key: 'now-playing',     title: 'Now In Theaters',     endpoint: '/movie/now_playing',   variant: 'landscape' as const },
  { key: 'new-episodes',    title: 'New Episodes',        endpoint: '/tv/on_the_air',       variant: 'portrait'  as const },
  { key: 'airing-today',    title: 'Fresh On TV Today',   endpoint: '/tv/airing_today',     variant: 'portrait'  as const },
  { key: 'top-rated-all',   title: 'All-Time Greats',     endpoint: '/movie/top_rated',     variant: 'landscape' as const },
  { key: 'top-rated-tv',    title: 'Best TV Series',      endpoint: '/tv/top_rated',        variant: 'portrait'  as const },
]

export default function NewAndPopular() {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white' }}>
      <Hero variant="all" />

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
