import React, { useMemo, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Hero from '../components/layout/Hero'
import Row from '../components/layout/Row'

type SectionKey = 'home' | 'movies' | 'series' | 'new'

interface RowDef {
  key: string
  title: string
  endpoint: string
  variant?: 'portrait' | 'landscape'
}

const SECTION_ROWS: Record<SectionKey, RowDef[]> = {
  home: [
    { key: 'trending-all',   title: 'Trending Now',          endpoint: '/trending/all/week',                                          variant: 'portrait'  },
    { key: 'bollywood',      title: 'Latest Bollywood',       endpoint: '/discover/movie?with_original_language=hi&sort_by=popularity.desc', variant: 'portrait'  },
    { key: 'in-theaters',    title: 'In Theaters',            endpoint: '/movie/now_playing',                                          variant: 'landscape' },
    { key: 'popular-movies', title: 'Popular Movies',         endpoint: '/movie/popular',                                              variant: 'portrait'  },
    { key: 'popular-tv',     title: 'Popular TV Shows',       endpoint: '/tv/popular',                                                 variant: 'portrait'  },
    { key: 'top-rated',      title: 'Top Rated',              endpoint: '/movie/top_rated',                                            variant: 'landscape' },
    { key: 'family',         title: 'Family Picks',           endpoint: '/discover/movie?with_genres=10751',                           variant: 'portrait'  },
    { key: 'sci-fi',         title: 'Science Fiction',        endpoint: '/discover/movie?with_genres=878',                             variant: 'portrait'  },
  ],
  movies: [
    { key: 'trending-movies',  title: 'Trending Movies',         endpoint: '/trending/movie/week',                                         variant: 'landscape' },
    { key: 'bollywood-movies', title: 'Latest Bollywood',         endpoint: '/discover/movie?with_original_language=hi&sort_by=popularity.desc', variant: 'portrait'  },
    { key: 'movies-now',       title: 'Now Playing',             endpoint: '/movie/now_playing',                                           variant: 'portrait'  },
    { key: 'movies-popular',   title: 'Popular Movies',          endpoint: '/movie/popular',                                               variant: 'portrait'  },
    { key: 'movies-top-rated', title: 'Top Rated',               endpoint: '/movie/top_rated',                                             variant: 'landscape' },
    { key: 'movies-upcoming',  title: 'Coming Soon',             endpoint: '/movie/upcoming',                                              variant: 'portrait'  },
    { key: 'movies-action',    title: 'Action & Adventure',      endpoint: '/discover/movie?with_genres=28,12',                            variant: 'portrait'  },
    { key: 'movies-comedy',    title: 'Comedy Hits',             endpoint: '/discover/movie?with_genres=35',                               variant: 'landscape' },
    { key: 'movies-horror',    title: 'Horror',                  endpoint: '/discover/movie?with_genres=27',                               variant: 'portrait'  },
  ],
  series: [
    { key: 'trending-tv',  title: 'Trending TV',       endpoint: '/trending/tv/week',                   variant: 'landscape' },
    { key: 'tv-popular',   title: 'Popular Shows',     endpoint: '/tv/popular',                         variant: 'portrait'  },
    { key: 'tv-top-rated', title: 'Top Rated TV',      endpoint: '/tv/top_rated',                       variant: 'landscape' },
    { key: 'tv-on-air',    title: 'Currently Airing',  endpoint: '/tv/on_the_air',                      variant: 'portrait'  },
    { key: 'tv-today',     title: 'Airing Today',      endpoint: '/tv/airing_today',                    variant: 'portrait'  },
    { key: 'tv-drama',     title: 'Drama & Suspense',  endpoint: '/discover/tv?with_genres=18,9648,80', variant: 'landscape' },
    { key: 'tv-animation', title: 'Animated Series',   endpoint: '/discover/tv?with_genres=16',         variant: 'portrait'  },
  ],
  new: [
    { key: 'trending-today',  title: 'Trending Today',      endpoint: '/trending/all/day',  variant: 'landscape' },
    { key: 'trending-week',   title: 'Trending This Week',  endpoint: '/trending/all/week', variant: 'portrait'  },
    { key: 'upcoming',        title: 'Coming Soon',         endpoint: '/movie/upcoming',    variant: 'portrait'  },
    { key: 'now-playing-new', title: 'Now In Theaters',     endpoint: '/movie/now_playing', variant: 'landscape' },
    { key: 'tv-on-air-new',   title: 'New Episodes',        endpoint: '/tv/on_the_air',     variant: 'portrait'  },
    { key: 'tv-airing-new',   title: 'Fresh On TV Today',   endpoint: '/tv/airing_today',   variant: 'portrait'  },
  ],
}

const HERO_VARIANT: Record<SectionKey, 'all' | 'movie' | 'tv'> = {
  home: 'all', movies: 'movie', series: 'tv', new: 'all',
}

function parseSection(search: string): SectionKey {
  const v = new URLSearchParams(search).get('section')
  return (v === 'movies' || v === 'series' || v === 'new') ? v : 'home'
}

export default function OptimizedHome() {
  const location = useLocation()
  const section  = useMemo(() => parseSection(location.search), [location.search])
  const rows     = useMemo(() => SECTION_ROWS[section], [section])

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }) }, [section])

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: 'white' }}>
      <Hero variant={HERO_VARIANT[section]} />

      {/* Seamless gradient bridge from hero bottom into content */}
      <div style={{
        height: 48,
        marginTop: -48,
        background: 'linear-gradient(to bottom, transparent, #080808)',
        position: 'relative',
        zIndex: 2,
        pointerEvents: 'none',
      }} />

      {/* Category rows */}
      <div style={{ position: 'relative', zIndex: 3, paddingBottom: 80 }}>
        {rows.map(row => (
          <Row
            key={row.key}
            title={row.title}
            endpoint={row.endpoint}
            variant={row.variant}
          />
        ))}
      </div>
    </div>
  )
}
