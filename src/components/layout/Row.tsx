import React, { useState, useRef, useCallback, useEffect, memo } from 'react'
import useSWR from 'swr'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FiPlay, FiPlus, FiCheck, FiStar, FiChevronLeft, FiChevronRight, FiInfo, FiBookmark } from 'react-icons/fi'
import { API_CONFIG } from '../../config/api'
import { useWatchlist } from '../../contexts/WatchlistContext'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const fetcher = (url: string) => axios.get(url).then(r => r.data)

interface Movie {
  id: number
  title?: string
  name?: string
  poster_path?: string
  backdrop_path?: string
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type?: string
  genre_ids?: number[]
  overview?: string
}

interface RowProps {
  title: string
  endpoint: string
  variant?: 'portrait' | 'landscape'
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  18: 'Drama', 10751: 'Family', 14: 'Fantasy', 27: 'Horror', 10749: 'Romance',
  878: 'Sci-Fi', 53: 'Thriller', 10759: 'Action & Adv.', 10765: 'Sci-Fi & Fantasy',
}

/* ── Skeleton card ──────────────────────────────────────────────────────── */
const SkeletonCard = memo(({ portrait }: { portrait: boolean }) => (
  <div style={{
    flexShrink: 0,
    width: portrait ? 'clamp(120px, 28vw, 168px)' : 'clamp(180px, 42vw, 290px)',
    borderRadius: 12, overflow: 'hidden',
  }}>
    <div style={{
      width: '100%', aspectRatio: portrait ? '2/3' : '16/9',
      background: 'linear-gradient(90deg, #1c1c1c 25%, #252525 50%, #1c1c1c 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite',
    }} />
    {portrait && (
      <div style={{ padding: '8px 2px', background: 'transparent' }}>
        <div style={{ height: 10, borderRadius: 5, background: '#1c1c1c', marginBottom: 5, width: '75%' }} />
        <div style={{ height: 8, borderRadius: 4, background: '#161616', width: '45%' }} />
      </div>
    )}
  </div>
))
SkeletonCard.displayName = 'SkeletonCard'

/* ── Movie card ─────────────────────────────────────────────────────────── */
const MovieCard = memo(({ movie, portrait }: { movie: Movie; portrait: boolean }) => {
  const navigate  = useNavigate()
  const { toggleWatchlist, isInWatchlist, markWatched, isWatched } = useWatchlist()
  const [hovered, setHovered] = useState(false)
  const [loaded,  setLoaded]  = useState(false)

  const mediaType   = movie.media_type || (movie.title ? 'movie' : 'tv')
  const title       = movie.title || movie.name || ''
  const year        = (movie.release_date || movie.first_air_date || '').slice(0, 4)
  const rating      = movie.vote_average ? movie.vote_average.toFixed(1) : null
  const genre       = (movie.genre_ids || []).map(id => GENRE_MAP[id]).filter(Boolean)[0]
  const inList      = isInWatchlist(movie.id)
  const alreadySeen = isWatched(movie.id)

  const imgSrc = portrait
    ? (movie.poster_path   ? `${API_CONFIG.TMDB_IMAGE_BASE}/w342${movie.poster_path}` : null)
    : (movie.backdrop_path ? `${API_CONFIG.TMDB_IMAGE_BASE}/w500${movie.backdrop_path}`
        : movie.poster_path ? `${API_CONFIG.TMDB_IMAGE_BASE}/w342${movie.poster_path}` : null)

  const cardW = portrait ? 'clamp(120px, 28vw, 168px)' : 'clamp(180px, 42vw, 290px)'
  const ratio  = portrait ? '2/3' : '16/9'

  return (
    <motion.div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/${mediaType}/${movie.id}`)}
      animate={{ scale: hovered ? 1.05 : 1 }}
      transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
      style={{
        flexShrink: 0, cursor: 'pointer', position: 'relative',
        width: cardW, borderRadius: 12, overflow: 'hidden',
        boxShadow: hovered
          ? '0 20px 50px rgba(0,0,0,0.85), 0 0 0 1.5px rgba(255,255,255,0.12)'
          : '0 4px 16px rgba(0,0,0,0.5)',
        transition: 'box-shadow 0.2s',
        zIndex: hovered ? 20 : 1,
      }}
    >
      {/* Image container */}
      <div style={{ width: '100%', aspectRatio: ratio, background: '#181818', position: 'relative', overflow: 'hidden' }}>
        {/* Shimmer before load */}
        {!loaded && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #1c1c1c 25%, #252525 50%, #1c1c1c 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite',
          }} />
        )}

        {imgSrc && (
          <img
            src={imgSrc} alt={title} loading="lazy" decoding="async"
            onLoad={() => setLoaded(true)}
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              opacity: loaded ? 1 : 0, transition: 'opacity 0.4s',
            }}
          />
        )}

        {/* Rating badge */}
        {rating && (
          <div style={{
            position: 'absolute', top: 8, left: 8, zIndex: 2,
            display: 'flex', alignItems: 'center', gap: 3,
            background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 6, padding: '3px 7px',
            fontSize: '0.65rem', fontWeight: 700, color: 'white',
          }}>
            <FiStar size={9} style={{ color: '#fbbf24', fill: '#fbbf24' }} />
            {rating}
          </div>
        )}

        {/* Media type badge */}
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 2,
          background: mediaType === 'tv' ? 'rgba(99,102,241,0.75)' : 'rgba(229,9,20,0.75)',
          backdropFilter: 'blur(6px)',
          borderRadius: 5, padding: '2px 7px',
          fontSize: '0.58rem', fontWeight: 800, color: 'white',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {mediaType === 'tv' ? 'TV' : 'Film'}
        </div>

        {/* Hover overlay */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.18 }}
          style={{
            position: 'absolute', inset: 0, zIndex: 3,
            background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.05) 100%)',
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
            padding: 10,
          }}
        >
          <motion.div
            animate={{ y: hovered ? 0 : 10 }}
            transition={{ duration: 0.2, ease: [0.33, 1, 0.68, 1] }}
          >
            {/* Action row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              {/* Play + mark watched */}
              <button
                onClick={e => { e.stopPropagation(); markWatched(movie.id); navigate(`/${mediaType}/${movie.id}`) }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'white', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.6)', flexShrink: 0,
                  position: 'relative',
                }}
                title="Play"
              >
                <FiPlay size={12} style={{ color: '#000', fill: '#000', marginLeft: 2 }} />
              </button>

              {/* Watchlist toggle */}
              <motion.button
                onClick={e => { e.stopPropagation(); toggleWatchlist(movie.id) }}
                whileTap={{ scale: 0.85 }}
                style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: inList ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.1)',
                  border: `1.5px solid ${inList ? 'rgba(229,9,20,0.7)' : 'rgba(255,255,255,0.3)'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                title={inList ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inList
                  ? <FiCheck size={13} color="#ff6b6b" />
                  : <FiPlus  size={13} color="white"   />
                }
              </motion.button>

              {/* Watched indicator / info */}
              <button
                onClick={e => { e.stopPropagation(); navigate(`/${mediaType}/${movie.id}`) }}
                style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  background: alreadySeen ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.1)',
                  border: `1.5px solid ${alreadySeen ? 'rgba(52,211,153,0.5)' : 'rgba(255,255,255,0.3)'}`,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                title={alreadySeen ? 'Watched' : 'More Info'}
              >
                {alreadySeen
                  ? <FiBookmark size={12} color="#34d399" style={{ fill: '#34d399' }} />
                  : <FiInfo     size={12} color="white"   />
                }
              </button>
            </div>

            {/* Title */}
            <p style={{
              margin: '0 0 5px', fontSize: '0.73rem', fontWeight: 700, color: 'white',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.3,
            }}>
              {title}
            </p>

            {/* Meta pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {year && <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{year}</span>}
              {genre && (
                <span style={{
                  fontSize: '0.58rem', color: '#e50914', fontWeight: 700,
                  background: 'rgba(229,9,20,0.15)', borderRadius: 4, padding: '2px 5px',
                }}>{genre}</span>
              )}
              <span style={{
                fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)',
                border: '1px solid rgba(255,255,255,0.18)', borderRadius: 3, padding: '1px 4px',
              }}>HD</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Below-card info (portrait only) */}
      {portrait && (
        <div style={{
          padding: '8px 8px 6px',
          background: '#101010',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          <p style={{
            margin: 0, fontSize: '0.7rem', fontWeight: 600, color: '#d4d4d8',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{title}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
            {year && <span style={{ fontSize: '0.6rem', color: '#52525b' }}>{year}</span>}
            {genre && <span style={{ fontSize: '0.6rem', color: '#52525b' }}>· {genre}</span>}
          </div>
        </div>
      )}
    </motion.div>
  )
})
MovieCard.displayName = 'MovieCard'

/* ── Row ────────────────────────────────────────────────────────────────── */
const Row = ({ title, endpoint, variant = 'portrait' }: RowProps) => {
  const scrollRef   = useRef<HTMLDivElement>(null)
  const [canLeft,   setCanLeft]   = useState(false)
  const [canRight,  setCanRight]  = useState(true)
  const [rowHover,  setRowHover]  = useState(false)
  const portrait = variant === 'portrait'
  const { isMobile } = useBreakpoint()
  const edgePad = isMobile ? 16 : 48

  const { data, error, isLoading } = useSWR(
    endpoint
      ? `${API_CONFIG.TMDB_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_CONFIG.TMDB_API_KEY}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  )

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanLeft(el.scrollLeft > 10)
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [checkScroll, data])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({ left: dir === 'left' ? -(el.clientWidth * 0.7) : el.clientWidth * 0.7, behavior: 'smooth' })
  }

  if (error) return null

  const items: Movie[] = (data?.results || [])
    .filter((m: Movie) => m.poster_path || m.backdrop_path)
    .slice(0, 20)

  return (
    <section
      onMouseEnter={() => setRowHover(true)}
      onMouseLeave={() => setRowHover(false)}
      style={{ position: 'relative', padding: '20px 0 6px' }}
    >
      {/* ── Section header — fixed height so buttons never shift the layout ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        paddingLeft: edgePad, paddingRight: edgePad, marginBottom: 12,
        height: 32,
      }}>
        {/* Red accent bar */}
        <div style={{ width: 3, height: 16, borderRadius: 2, background: '#e50914', flexShrink: 0 }} />

        <h2 style={{
          margin: 0, fontSize: 'clamp(0.88rem, 1.4vw, 1.05rem)',
          fontWeight: 800, color: 'white', letterSpacing: '-0.025em',
        }}>
          {title}
        </h2>

        {/* "See all" — always in DOM, no layout shift */}
        <motion.button
          animate={{ opacity: (rowHover || isMobile) ? 1 : 0, x: (rowHover || isMobile) ? 0 : -6 }}
          transition={{ duration: 0.18 }}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: '0.7rem', fontWeight: 700, color: '#e50914',
            padding: 0,
            flexShrink: 0,
          }}
        >
          See all <FiChevronRight size={12} />
        </motion.button>

        {/* ── Arrow buttons — hidden on mobile (swipe natively) ── */}
        <div style={{ marginLeft: 'auto', display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: 5 }}>
          <motion.button
            animate={{
              opacity: rowHover ? (canLeft ? 1 : 0.22) : 0,
              scale:   rowHover ? 1 : 0.82,
            }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => scroll('left')}
            disabled={!canLeft}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: canLeft ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${canLeft ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canLeft ? 'pointer' : 'default',
              color: 'white', backdropFilter: 'blur(8px)',
              pointerEvents: rowHover ? 'auto' : 'none',
              transition: 'background 0.2s, border-color 0.2s',
              flexShrink: 0,
            }}
          >
            <FiChevronLeft size={15} />
          </motion.button>

          <motion.button
            animate={{
              opacity: rowHover ? (canRight ? 1 : 0.22) : 0,
              scale:   rowHover ? 1 : 0.82,
            }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => scroll('right')}
            disabled={!canRight}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: canRight ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)',
              border: `1.5px solid ${canRight ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: canRight ? 'pointer' : 'default',
              color: 'white', backdropFilter: 'blur(8px)',
              pointerEvents: rowHover ? 'auto' : 'none',
              transition: 'background 0.2s, border-color 0.2s',
              flexShrink: 0,
            }}
          >
            <FiChevronRight size={15} />
          </motion.button>
        </div>
      </div>

      {/* ── Scroll track ── */}
      <div style={{ position: 'relative' }}>

        {/* Left edge fade (no button — button is in header) */}
        <AnimatePresence>
          {canLeft && rowHover && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, zIndex: 10,
                width: edgePad, pointerEvents: 'none',
                background: 'linear-gradient(to right, rgba(8,8,8,0.9) 0%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>

        {/* Cards */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: portrait ? 10 : 12,
            overflowX: 'auto', overflowY: 'visible',
            padding: `4px ${edgePad}px 16px ${edgePad}px`,
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          } as React.CSSProperties}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} portrait={portrait} />)
            : items.map((movie, i) => (
                <MovieCard key={`${movie.id}-${i}`} movie={movie} portrait={portrait} />
              ))
          }
        </div>

        {/* Right edge fade */}
        <AnimatePresence>
          {canRight && rowHover && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, zIndex: 10,
                width: 60, pointerEvents: 'none',
                background: 'linear-gradient(to left, rgba(8,8,8,0.9) 0%, transparent 100%)',
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

export default memo(Row)
