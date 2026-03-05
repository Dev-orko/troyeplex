import React, { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiArrowLeft, FiMaximize2 } from 'react-icons/fi'

interface VideoPlayerProps {
  videoUrl: string
  title: string
  onClose?: () => void
  poster?: string
  autoPlay?: boolean
  movieId?: string
  isTV?: boolean
  season?: number
  episode?: number
  movieData?: {
    overview?: string
    vote_average?: number
    vote_count?: number
    release_date?: string
    first_air_date?: string
    runtime?: number
    genres?: Array<{ id: number; name: string }>
    spoken_languages?: Array<{ iso_639_1: string; name: string }>
    production_companies?: Array<{ id: number; name: string; logo_path: string }>
    tagline?: string
    status?: string
    budget?: number
    revenue?: number
  }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl, title, onClose, poster,
  movieId, isTV, season, episode, movieData,
}) => {
  const [streamUrl, setStreamUrl] = useState('')
  const [showBar, setShowBar] = useState(true)
  const hideTimer = useRef<number | null>(null)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (movieId) {
      setStreamUrl(isTV && season && episode
        ? `https://player.videasy.net/tv/${movieId}/${season}/${episode}`
        : `https://player.videasy.net/movie/${movieId}`)
    } else if (videoUrl) {
      setStreamUrl(videoUrl)
    }
  }, [videoUrl, movieId, isTV, season, episode])

  useEffect(() => {
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose?.() }
    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onClose])

  const resetHide = () => {
    setShowBar(true)
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setShowBar(false), 4000)
  }

  const match = movieData?.vote_average
    ? Math.round((movieData.vote_average / 10) * 100)
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[999] flex flex-col bg-black"
      onMouseMove={resetHide}
      onTouchStart={resetHide}
    >
      {/* ── Top bar ── */}
      <AnimatePresence>
        {showBar && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)' }}
          >
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <FiArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="flex flex-1 items-center justify-center px-4">
              <div className="text-center">
                <p className="max-w-xs truncate text-sm font-bold text-white sm:max-w-md sm:text-base">{title}</p>
                {isTV && season && episode && (
                  <p className="text-xs text-gray-400">Season {season} · Episode {episode}</p>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-white/15"
              style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}
              aria-label="Close"
            >
              <FiX className="h-5 w-5 text-white" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main video area ── */}
      <div className="flex flex-1 flex-col overflow-hidden sm:flex-row">
        <div className={`relative flex-shrink-0 bg-black ${movieData ? 'w-full sm:flex-1' : 'flex-1'}`}
          style={{ height: window.innerWidth < 640 ? '45vh' : '100%' }}>

          <div className="absolute inset-0 hidden sm:block pointer-events-none"
            style={{ boxShadow: 'inset 0 0 0 1px rgba(229,9,20,0.15)' }} />

          {streamUrl && (
            <iframe
              src={streamUrl}
              title={title}
              className="h-full w-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
          )}
        </div>

        {/* ── Info sidebar (desktop) ── */}
        {movieData && (
          <div
            className="flex-shrink-0 overflow-y-auto px-4 py-4 sm:w-80 sm:py-16 md:w-96"
            style={{ background: 'rgba(12,12,12,0.97)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 className="mb-1 text-sm font-bold text-white">{title}</h3>

            <div className="mb-3 flex flex-wrap items-center gap-1.5 text-xs">
              {match !== null && (
                <span className="font-bold text-green-400">{match}% Match</span>
              )}
              {(movieData.release_date || movieData.first_air_date) && (
                <span className="rounded px-1.5 py-0.5 font-medium text-white"
                  style={{ background: 'rgba(255,255,255,0.1)' }}>
                  {(movieData.release_date || movieData.first_air_date)?.slice(0, 4)}
                </span>
              )}
              {movieData.runtime && (
                <span className="text-gray-400">
                  {Math.floor(movieData.runtime / 60)}h {movieData.runtime % 60}m
                </span>
              )}
              <span className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(229,9,20,0.2)', color: '#e50914' }}>HD</span>
            </div>

            {movieData.tagline && (
              <p className="mb-2 text-xs italic text-gray-500">&ldquo;{movieData.tagline}&rdquo;</p>
            )}

            {movieData.overview && (
              <p className="mb-4 text-xs leading-relaxed text-gray-400 sm:text-sm">{movieData.overview}</p>
            )}

            {movieData.genres && movieData.genres.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">Genres</p>
                <div className="flex flex-wrap gap-1.5">
                  {movieData.genres.map(g => (
                    <span key={g.id} className="rounded-full px-2.5 py-0.5 text-xs font-medium text-gray-300"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      {g.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {movieData.vote_average && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-600">Rating</span>
                <span className="font-bold text-yellow-400">★ {movieData.vote_average.toFixed(1)}</span>
                {movieData.vote_count && (
                  <span className="text-gray-600">({(movieData.vote_count / 1000).toFixed(1)}K votes)</span>
                )}
              </div>
            )}

            {movieData.status && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-gray-600">Status</span>
                <span className="font-medium text-white">{movieData.status}</span>
              </div>
            )}

            {movieData.production_companies?.[0] && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-gray-600">Studio</span>
                <span className="font-medium text-white line-clamp-1">{movieData.production_companies[0].name}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-3 sm:hidden"
        style={{ background: 'rgba(10,10,10,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-sm font-bold text-white line-clamp-1">{title}</p>
        {isTV && season && episode && (
          <p className="text-xs text-gray-500">Season {season} · Episode {episode}</p>
        )}
        {movieData?.genres && (
          <p className="mt-1 text-xs text-gray-600 line-clamp-1">
            {movieData.genres.slice(0, 3).map(g => g.name).join(' · ')}
          </p>
        )}
      </div>
    </motion.div>
  )
}

export default VideoPlayer
