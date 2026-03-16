import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlay, FiInfo, FiPlus, FiStar } from 'react-icons/fi'
import useSWR from 'swr'
import axios from 'axios'
import { API_CONFIG } from '../../config/api'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const fetcher = (url: string) => axios.get(url).then(r => r.data)

interface Movie {
  id: number; title?: string; name?: string; overview?: string
  backdrop_path?: string; poster_path?: string; vote_average: number
  release_date?: string; first_air_date?: string
  media_type?: string; genre_ids?: number[]
}
interface Video { key: string; site: string; type: string }
interface HeroProps { variant?: 'all' | 'movie' | 'tv' }

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  18: 'Drama', 10751: 'Family', 14: 'Fantasy', 27: 'Horror', 878: 'Sci-Fi',
  53: 'Thriller', 37: 'Western', 10759: 'Action & Adventure', 10765: 'Sci-Fi & Fantasy',
}

const SLIDE_DURATION = 8000

/* ─── Word-by-word slide-up title ───────────────────────────────────────── */
function TitleReveal({ title, uid }: { title: string; uid: number }) {
  const words = title.split(' ')
  return (
    <div style={{ marginBottom: 12, display: 'block' }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{
            display: 'inline-block',
            overflow: 'hidden',
            lineHeight: 1.1,
            marginRight: i < words.length - 1 ? '0.28em' : 0,
          }}
        >
          <motion.span
            key={uid}
            style={{
              display: 'inline-block',
              fontWeight: 900,
              fontSize: 'clamp(1.8rem, 4.6vw, 3.4rem)',
              letterSpacing: '-0.035em',
              color: 'white',
              textShadow: '0 2px 28px rgba(0,0,0,0.7)',
            }}
            initial={{ y: '110%', opacity: 0 }}
            animate={{ y: '0%', opacity: 1 }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: 0.1 + i * 0.055 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

/* ─── Static backdrop image (shown while trailer loads) ─────────────────── */
function BackdropStill({ src, uid }: { src: string; uid: number }) {
  const [loaded, setLoaded] = useState(false)
  return (
    <motion.div
      key={uid}
      initial={{ opacity: 0 }}
      animate={{ opacity: loaded ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      <motion.img
        src={src} alt=""
        initial={{ scale: 1.06 }}
        animate={{ scale: 1.0 }}
        transition={{ duration: SLIDE_DURATION / 1000 + 3, ease: 'linear' }}
        style={{
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center 20%',
          display: 'block',
          filter: 'brightness(0.65) saturate(1.1)',
        }}
        onLoad={() => setLoaded(true)}
        loading="eager"
      />
    </motion.div>
  )
}

/* ─── YouTube trailer layer (crossfades in after iframe loads) ──────────── */
function TrailerLayer({ trailerKey, uid }: { trailerKey: string; uid: number }) {
  const [visible, setVisible] = useState(false)

  // Give the iframe ~2s to start playing before fading in
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 2200)
    return () => clearTimeout(t)
  }, [trailerKey])

  return (
    <motion.div
      key={`trailer-${uid}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.8, ease: 'easeInOut' }}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 1 }}
    >
      <iframe
        key={trailerKey}
        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&iv_load_policy=3`}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%) scale(1.65)',
          width: '100%', height: '100%',
          border: 0,
          filter: 'brightness(0.62) saturate(1.08)',
        }}
        allow="autoplay; encrypted-media"
        title="hero-trailer"
      />
    </motion.div>
  )
}

/* ─── Hero ──────────────────────────────────────────────────────────────── */
const Hero: React.FC<HeroProps> = ({ variant = 'all' }) => {
  const { isMobile, isTablet } = useBreakpoint()
  const endpoint = variant === 'movie' ? '/trending/movie/day'
    : variant === 'tv'    ? '/trending/tv/day'
    : '/trending/all/day'

  const { data, isLoading } = useSWR<{ results: Movie[] }>(
    `${API_CONFIG.TMDB_BASE_URL}${endpoint}?api_key=${API_CONFIG.TMDB_API_KEY}`,
    fetcher, { revalidateOnFocus: false }
  )

  // Only use movies with a proper widescreen backdrop — never portrait posters
  const movies = useMemo(() =>
    (data?.results || []).filter(m => !!m.backdrop_path).slice(0, 7),
    [data]
  )

  const [idx,       setIdx]       = useState(0)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [ready,     setReady]     = useState(false)
  const [progress,  setProgress]  = useState(0)
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAt = useRef(Date.now())
  const navigate  = useNavigate()

  /* Auto-advance timer */
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    startedAt.current = Date.now()
    setProgress(0)
    timerRef.current = setInterval(() => {
      const pct = Math.min(((Date.now() - startedAt.current) / SLIDE_DURATION) * 100, 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(timerRef.current!)
        setIdx(p => (p + 1) % movies.length)
      }
    }, 50)
  }, [movies.length])

  useEffect(() => {
    if (movies.length) startTimer()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [idx, movies.length, startTimer])

  /* Fetch trailer for current slide */
  useEffect(() => {
    if (!movies[idx]) return
    const m = movies[idx]
    const type = m.media_type || (m.title ? 'movie' : 'tv')
    setTrailerKey(null)
    axios
      .get(`${API_CONFIG.TMDB_BASE_URL}/${type}/${m.id}/videos?api_key=${API_CONFIG.TMDB_API_KEY}`)
      .then(r => {
        const v = (r.data.results as Video[]).find(x => x.type === 'Trailer' && x.site === 'YouTube')
        if (v) setTrailerKey(v.key)
      })
      .catch(() => {})
  }, [idx, movies])

  /* Preload first backdrop then mark ready */
  useEffect(() => {
    if (!movies[0]?.backdrop_path) { setReady(true); return }
    const img = new Image()
    img.src = `https://image.tmdb.org/t/p/original${movies[0].backdrop_path}`
    img.onload = () => setReady(true)
    img.onerror = () => setReady(true)
  }, [movies])

  if (isLoading || !movies.length) {
    return <div style={{ height: '57vh', minHeight: 380, background: '#0d0d0d' }} />
  }

  const cur       = movies[idx]
  const mediaType = cur.media_type || (cur.title ? 'movie' : 'tv')
  const title     = cur.title || cur.name || ''
  const year      = (cur.release_date || cur.first_air_date || '').slice(0, 4)
  const rating    = cur.vote_average?.toFixed(1)
  const genres    = (cur.genre_ids || []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean)
  const overview  = cur.overview
    ? cur.overview.slice(0, 155) + (cur.overview.length > 155 ? '…' : '')
    : ''
  const backdropSrc = `https://image.tmdb.org/t/p/original${cur.backdrop_path}`

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const, delay },
  })

  return (
    <div style={{
      position: 'relative', width: '100%',
      height: isMobile ? '50vh' : '57vh',
      minHeight: isMobile ? 320 : 380,
      overflow: 'hidden',
      background: '#080808',
      opacity: ready ? 1 : 0,
      transition: 'opacity 0.7s',
    }}>

      {/* ── Layer 0: Static backdrop (always present as base) ── */}
      <AnimatePresence initial={false}>
        <BackdropStill key={cur.id} src={backdropSrc} uid={cur.id} />
      </AnimatePresence>

      {/* ── Layer 1: Trailer video (crossfades in over backdrop) ── */}
      <AnimatePresence>
        {trailerKey && (
          <TrailerLayer key={`${cur.id}-${trailerKey}`} trailerKey={trailerKey} uid={cur.id} />
        )}
      </AnimatePresence>

      {/* ── Layer 2: Cinematic gradient system ── */}
      {/* Heavy bottom fade → seamlessly bleeds into #080808 page */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.85) 22%, rgba(8,8,8,0.3) 50%, transparent 100%)',
      }} />
      {/* Left vignette → text readability */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to right, rgba(8,8,8,0.92) 0%, rgba(8,8,8,0.55) 32%, rgba(8,8,8,0.08) 60%, transparent 100%)',
      }} />
      {/* Top → header bleed */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(8,8,8,0.6) 0%, transparent 20%)',
      }} />
      {/* Warm red atmospheric bloom — bottom left */}
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: '50%', height: '70%', zIndex: 2, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 0% 100%, rgba(229,9,20,0.1) 0%, transparent 65%)',
      }} />

      {/* ── Layer 3: Text content ── */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: isMobile ? '0 20px 36px' : isTablet ? '0 36px 44px' : '0 52px 48px',
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.id}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.28 } }}
            style={{ maxWidth: 600 }}
          >

            {/* Live label + slide counter */}
            <motion.div {...fade(0.05)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.6rem', fontWeight: 800,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                color: '#e50914',
              }}>
                <motion.span
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  style={{
                    display: 'inline-block',
                    width: 6, height: 6, borderRadius: '50%',
                    background: '#e50914',
                    boxShadow: '0 0 0 3px rgba(229,9,20,0.22)',
                  }}
                />
                {mediaType === 'tv' ? 'Trending Series' : 'Featured Film'}
              </span>
              <span style={{ width: 22, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              <span style={{
                fontSize: '0.6rem', color: 'rgba(255,255,255,0.28)',
                fontWeight: 600, letterSpacing: '0.05em',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(idx + 1).padStart(2, '0')} / {String(movies.length).padStart(2, '0')}
              </span>
            </motion.div>

            {/* Title — word-by-word reveal */}
            <AnimatePresence mode="wait">
              <TitleReveal key={cur.id} title={title} uid={cur.id} />
            </AnimatePresence>

            {/* Rating · Year · Genres */}
            <motion.div {...fade(0.22)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 13, flexWrap: 'wrap' }}>

              {rating && +rating > 0 && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.22), rgba(251,191,36,0.08))',
                  border: '1px solid rgba(251,191,36,0.52)',
                  borderRadius: 7, padding: '3px 9px',
                  fontSize: '0.73rem', fontWeight: 800, color: '#fde68a',
                  boxShadow: '0 0 14px rgba(251,191,36,0.14)',
                }}>
                  <FiStar size={10} style={{ fill: '#fbbf24', flexShrink: 0 }} />
                  {rating}
                </span>
              )}

              {year && (
                <span style={{
                  fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)',
                  background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '3px 9px', fontWeight: 500,
                }}>
                  {year}
                </span>
              )}

              {genres.length > 0 && (
                <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
              )}

              {genres.map((g, i) => (
                <span key={g} style={{
                  fontSize: '0.67rem', fontWeight: i === 0 ? 700 : 500,
                  padding: '3px 10px', borderRadius: 7,
                  color: i === 0 ? 'white' : 'rgba(255,255,255,0.58)',
                  background: i === 0 ? 'rgba(229,9,20,0.2)' : 'rgba(255,255,255,0.07)',
                  border: `1px solid ${i === 0 ? 'rgba(229,9,20,0.45)' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: i === 0 ? '0 0 10px rgba(229,9,20,0.12)' : 'none',
                  backdropFilter: 'blur(6px)',
                }}>
                  {g}
                </span>
              ))}
            </motion.div>

            {/* Overview */}
            {overview && (
              <motion.p {...fade(0.30)}
                className="hidden sm:block"
                style={{
                  margin: '0 0 20px',
                  fontSize: 'clamp(0.74rem, 1vw, 0.87rem)',
                  lineHeight: 1.72, color: 'rgba(255,255,255,0.52)',
                  maxWidth: 460,
                }}>
                {overview}
              </motion.p>
            )}

            {/* CTA buttons */}
            <motion.div {...fade(0.38)}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* Play */}
              <motion.button
                onClick={() => navigate(`/${mediaType}/${cur.id}`)}
                whileHover={{ scale: 1.04, boxShadow: '0 10px 36px rgba(255,255,255,0.2)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'white', color: '#080808',
                  border: 'none', borderRadius: 10, cursor: 'pointer',
                  padding: isMobile ? '10px 20px' : '11px 26px',
                  fontSize: isMobile ? '0.8rem' : '0.86rem', fontWeight: 900,
                  letterSpacing: '-0.01em',
                  boxShadow: '0 4px 22px rgba(255,255,255,0.14)',
                }}
              >
                <motion.span
                  initial={{ x: '-130%' }} whileHover={{ x: '260%' }}
                  transition={{ duration: 0.48, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', top: 0, left: 0, width: '38%', height: '100%',
                    background: 'rgba(255,255,255,0.28)', filter: 'blur(8px)', pointerEvents: 'none',
                  }}
                />
                <FiPlay size={14} style={{ fill: '#080808', flexShrink: 0 }} />
                Play Now
              </motion.button>

              {/* More Info */}
              <motion.button
                onClick={() => navigate(`/${mediaType}/${cur.id}`)}
                whileHover={{ scale: 1.04, background: 'rgba(255,255,255,0.14)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  borderRadius: 10, cursor: 'pointer',
                  padding: isMobile ? '10px 16px' : '11px 20px',
                  fontSize: isMobile ? '0.8rem' : '0.86rem', fontWeight: 700,
                  color: 'white', backdropFilter: 'blur(14px)',
                }}
              >
                <FiInfo size={14} />
                More Info
              </motion.button>

              {/* Add to list */}
              <motion.button
                whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.13)' }}
                whileTap={{ scale: 0.9 }}
                style={{
                  width: isMobile ? 36 : 42, height: isMobile ? 36 : 42, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1.5px solid rgba(255,255,255,0.15)',
                  cursor: 'pointer', color: 'white', backdropFilter: 'blur(12px)',
                }}
              >
                <FiPlus size={17} />
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Layer 4: Progress bar strip ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 4,
        padding: isMobile ? '0 20px 12px' : isTablet ? '0 36px 14px' : '0 52px 15px',
        display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 5,
      }}>
        {movies.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            style={{
              position: 'relative',
              height: i === idx ? 3 : 2,
              width: i === idx ? 52 : 16,
              borderRadius: 99, border: 'none', cursor: 'pointer', padding: 0,
              background: i < idx ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)',
              transition: 'width 0.32s cubic-bezier(0.22,1,0.36,1), height 0.2s',
              overflow: 'hidden',
            }}
          >
            {i === idx && (
              <motion.div
                style={{
                  position: 'absolute', inset: 0,
                  background: 'white', borderRadius: 99, originX: 0,
                }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: 0.05, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Hero
