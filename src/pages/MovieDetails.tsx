import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import {
  FiPlay, FiStar, FiCalendar, FiClock, FiPlus, FiShare2,
  FiArrowLeft, FiChevronLeft, FiChevronRight, FiHeart,
  FiThumbsUp, FiThumbsDown, FiSend,
} from 'react-icons/fi'
import VideoPlayer from '../components/video/VideoPlayer'
import { API_CONFIG } from '../config/api'

interface Genre  { id: number; name: string }
interface Company { id: number; name: string; logo_path: string }
interface Language { iso_639_1: string; name: string }
interface Season {
  id: number; season_number: number; episode_count: number; name: string
  poster_path: string | null
}

interface Movie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string
  backdrop_path: string
  vote_average: number
  vote_count: number
  release_date?: string
  first_air_date?: string
  runtime?: number
  number_of_seasons?: number
  number_of_episodes?: number
  genres: Genre[]
  production_companies: Company[]
  spoken_languages: Language[]
  tagline?: string
  status?: string
  budget?: number
  revenue?: number
  seasons?: Season[]
}

interface Comment {
  id: string; user: string; avatar: string; text: string
  rating: number; timestamp: string; likes: number; dislikes: number
}

const SEED_COMMENTS: Comment[] = [
  { id: '1', user: 'Alex Johnson', avatar: 'https://i.pravatar.cc/40?img=12',
    text: 'Amazing! The cinematography and storyline were absolutely incredible.', rating: 5, timestamp: '2h ago', likes: 24, dislikes: 1 },
  { id: '2', user: 'Sarah Kim', avatar: 'https://i.pravatar.cc/40?img=47',
    text: 'Great acting and visual effects. The plot kept me engaged throughout.', rating: 4, timestamp: '5h ago', likes: 18, dislikes: 2 },
  { id: '3', user: 'Mike Chen', avatar: 'https://i.pravatar.cc/40?img=33',
    text: 'Solid film with excellent character development. Soundtrack is perfect.', rating: 4, timestamp: '1d ago', likes: 12, dislikes: 0 },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} onClick={() => onChange(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
          className={`text-2xl transition-colors ${s <= (hover || value) ? 'text-yellow-400' : 'text-gray-700'}`}
        >★</button>
      ))}
    </div>
  )
}

export default function MovieDetails() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isTV = location.pathname.startsWith('/tv/')

  const [movie, setMovie]                     = useState<Movie | null>(null)
  const [loading, setLoading]                 = useState(true)
  const [similar, setSimilar]                 = useState<any[]>([])
  const [isPlaying, setIsPlaying]             = useState(false)
  const [playerPortalEl, setPortalEl]         = useState<HTMLElement | null>(null)
  const [selectedSeason, setSeason]           = useState(1)
  const [selectedEpisode, setEpisode]         = useState(1)
  const [episodesInSeason, setEpisodesCounts] = useState<number[]>([])
  const [inList, setInList]                   = useState(false)
  const [liked, setLiked]                     = useState(false)
  const [comments, setComments]               = useState<Comment[]>(SEED_COMMENTS)
  const [newComment, setNewComment]           = useState('')
  const [userRating, setUserRating]           = useState(0)
  const [imgLoaded, setImgLoaded]             = useState(false)
  const similarRef                            = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let el = document.getElementById('player-root') as HTMLElement | null
    if (!el) {
      el = document.createElement('div')
      el.id = 'player-root'
      document.body.appendChild(el)
    }
    setPortalEl(el)
  }, [])

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setImgLoaded(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })

    const fetchData = async () => {
      try {
        const type = isTV ? 'tv' : 'movie'
        const [detailRes, similarRes] = await Promise.all([
          axios.get(`${API_CONFIG.TMDB_BASE_URL}/${type}/${id}?api_key=${API_CONFIG.TMDB_API_KEY}`),
          axios.get(`${API_CONFIG.TMDB_BASE_URL}/${type}/${id}/similar?api_key=${API_CONFIG.TMDB_API_KEY}`),
        ])

        setMovie(detailRes.data)
        setSimilar((similarRes.data.results || []).filter((m: any) => m.poster_path).slice(0, 16))

        if (isTV && detailRes.data.seasons) {
          const seasons = detailRes.data.seasons.filter((s: Season) => s.season_number > 0)
          setEpisodesCounts(seasons.map((s: Season) => s.episode_count))
          setSeason(1); setEpisode(1)
        }
      } catch (err) {
        console.error('MovieDetails fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()

    const origOpen = window.open
    window.open = () => null
    return () => { window.open = origOpen }
  }, [id, isTV])

  const submitComment = () => {
    if (!newComment.trim() || userRating === 0) return
    setComments(prev => [{
      id: Date.now().toString(), user: 'You',
      avatar: 'https://i.pravatar.cc/40?img=1',
      text: newComment, rating: userRating,
      timestamp: 'Just now', likes: 0, dislikes: 0,
    }, ...prev])
    setNewComment(''); setUserRating(0)
  }

  const scrollSimilar = (dir: 'left' | 'right') => {
    if (!similarRef.current) return
    similarRef.current.scrollBy({ left: dir === 'left' ? -400 : 400, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-t-transparent animate-spin"
            style={{ borderColor: '#e50914 transparent transparent transparent' }} />
        </div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-2xl font-bold">Content not found</p>
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 transition-colors hover:bg-white/20">
          <FiArrowLeft /> Go back
        </button>
      </div>
    )
  }

  const title      = movie.title || movie.name || ''
  const year       = (movie.release_date || movie.first_air_date || '').slice(0, 4)
  const matchPct   = Math.round((movie.vote_average / 10) * 100)
  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}` : ''
  const posterUrl   = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : ''

  return (
    <div className="min-h-screen bg-black text-white">
      {isPlaying && playerPortalEl && ReactDOM.createPortal(
        <VideoPlayer
          videoUrl="" title={title}
          poster={posterUrl || undefined}
          movieId={id} isTV={isTV}
          season={selectedSeason} episode={selectedEpisode}
          movieData={{
            overview: movie.overview, vote_average: movie.vote_average,
            vote_count: movie.vote_count, release_date: movie.release_date,
            first_air_date: movie.first_air_date, runtime: movie.runtime,
            genres: movie.genres, spoken_languages: movie.spoken_languages,
            production_companies: movie.production_companies,
            tagline: movie.tagline, status: movie.status,
            budget: movie.budget, revenue: movie.revenue,
          }}
          onClose={() => setIsPlaying(false)}
        />,
        playerPortalEl,
      )}

      {/* Hero backdrop */}
      <div className="relative h-[55vh] overflow-hidden sm:h-[65vh] md:h-[75vh]">
        {backdropUrl && (
          <>
            <img src={backdropUrl} alt={title} onLoad={() => setImgLoaded(true)}
              className={`h-full w-full object-cover object-top transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} />
            {!imgLoaded && <div className="absolute inset-0 bg-gray-900 animate-pulse" />}
          </>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-black/30" />
        <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black to-transparent" />

        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-20 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/15 sm:left-8 sm:top-24 md:left-12"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <FiArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Detail panel */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-8 md:px-12">
        <div className="-mt-40 flex flex-col gap-8 pb-4 md:-mt-56 md:flex-row md:items-end">

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="hidden flex-shrink-0 md:block">
            {posterUrl && (
              <img src={posterUrl} alt={title}
                className="w-44 rounded-xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] lg:w-56 xl:w-64"
                style={{ border: '2px solid rgba(255,255,255,0.08)' }}
              />
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex-1 pb-2">
            <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">{title}</h1>

            <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
              {matchPct >= 60 && <span className="font-bold text-green-400">{matchPct}% Match</span>}
              {year && <span className="text-gray-400">{year}</span>}
              {movie.runtime && (
                <span className="text-gray-400">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              )}
              <span className="flex items-center gap-1 text-yellow-400">
                <FiStar className="h-3.5 w-3.5 fill-current" /> {movie.vote_average.toFixed(1)}
              </span>
              <span className="rounded border px-1.5 py-0.5 text-xs text-gray-400"
                style={{ borderColor: 'rgba(255,255,255,0.2)' }}>HD</span>
            </div>

            {movie.genres?.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {movie.genres.map(g => (
                  <span key={g.id} className="rounded-full px-3 py-1 text-xs font-medium text-white"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
                    {g.name}
                  </span>
                ))}
              </div>
            )}

            {movie.tagline && <p className="mb-3 text-sm italic text-gray-500">&ldquo;{movie.tagline}&rdquo;</p>}

            <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base line-clamp-4">{movie.overview}</p>

            {isTV && episodesInSeason.length > 0 && (
              <div className="mb-6 flex flex-wrap items-end gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Season</label>
                  <select value={selectedSeason}
                    onChange={e => { setSeason(Number(e.target.value)); setEpisode(1) }}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {episodesInSeason.map((_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-black">Season {i + 1}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Episode</label>
                  <select value={selectedEpisode} onChange={e => setEpisode(Number(e.target.value))}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-white focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
                    {Array.from({ length: episodesInSeason[selectedSeason - 1] || 10 }, (_, i) => (
                      <option key={i + 1} value={i + 1} className="bg-black">Episode {i + 1}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <motion.button onClick={() => setIsPlaying(true)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2.5 rounded-lg px-7 py-3.5 text-sm font-bold text-white shadow-lg sm:text-base"
                style={{ background: '#e50914', boxShadow: '0 4px 24px rgba(229,9,20,0.4)' }}>
                <FiPlay className="h-5 w-5 fill-current" />
                {isTV ? `Watch S${selectedSeason}E${selectedEpisode}` : 'Watch Now'}
              </motion.button>

              <motion.button onClick={() => setInList(v => !v)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold transition-colors sm:text-base"
                style={{
                  background: inList ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${inList ? 'rgba(229,9,20,0.4)' : 'rgba(255,255,255,0.14)'}`,
                  color: inList ? '#e50914' : 'white',
                }}>
                {inList ? <FiHeart className="h-5 w-5 fill-current" /> : <FiPlus className="h-5 w-5" />}
                {inList ? 'In List' : 'My List'}
              </motion.button>

              <motion.button onClick={() => setLiked(v => !v)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <FiThumbsUp className={`h-5 w-5 ${liked ? 'fill-current text-green-400' : ''}`} />
              </motion.button>

              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-lg px-5 py-3.5 text-sm font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <FiShare2 className="h-5 w-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Stats strip */}
        <div className="mt-6 grid grid-cols-2 gap-3 rounded-2xl p-5 sm:grid-cols-4"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {[
            { label: 'Rating', value: `${movie.vote_average.toFixed(1)} / 10` },
            { label: 'Votes', value: movie.vote_count ? `${(movie.vote_count / 1000).toFixed(1)}K` : '—' },
            { label: isTV ? 'Seasons' : 'Runtime',
              value: isTV ? `${movie.number_of_seasons || '—'}` : movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '—' },
            { label: 'Status', value: movie.status || '—' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">{s.label}</p>
              <p className="text-base font-bold text-white sm:text-lg">{s.value}</p>
            </div>
          ))}
        </div>

        {/* More like this */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 text-2xl font-black text-white sm:text-3xl">More Like This</h2>
            <div className="relative group/sim">
              <button onClick={() => scrollSimilar('left')}
                className="absolute -left-4 top-0 bottom-0 z-10 hidden w-10 items-center justify-center opacity-0 transition-opacity group-hover/sim:opacity-100 md:flex"
                style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.9), transparent)' }}>
                <FiChevronLeft className="h-6 w-6 text-white" />
              </button>

              <div ref={similarRef} className="flex gap-3 overflow-x-auto pb-4 sm:gap-4" style={{ scrollbarWidth: 'none' }}>
                {similar.map(item => (
                  <div key={item.id}
                    onClick={() => { navigate(`/${isTV ? 'tv' : 'movie'}/${item.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="group/card relative flex-shrink-0 cursor-pointer overflow-hidden rounded-xl"
                    style={{ width: 'clamp(130px,14vw,180px)' }}>
                    <div className="aspect-[2/3] overflow-hidden rounded-xl">
                      <img src={`https://image.tmdb.org/t/p/w342${item.poster_path}`}
                        alt={item.title || item.name} loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/80 opacity-0 transition-opacity group-hover/card:opacity-100">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#e50914' }}>
                        <FiPlay className="h-4 w-4 fill-current text-white" />
                      </div>
                      <p className="px-2 text-center text-xs font-semibold text-white line-clamp-2">{item.title || item.name}</p>
                      {item.vote_average > 0 && <p className="text-xs text-yellow-400">★ {item.vote_average.toFixed(1)}</p>}
                    </div>
                    <p className="mt-1.5 truncate text-xs font-medium text-gray-400">{item.title || item.name}</p>
                  </div>
                ))}
              </div>

              <button onClick={() => scrollSimilar('right')}
                className="absolute -right-4 top-0 bottom-0 z-10 hidden w-10 items-center justify-center opacity-0 transition-opacity group-hover/sim:opacity-100 md:flex"
                style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.9), transparent)' }}>
                <FiChevronRight className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-14 pb-16">
          <h2 className="mb-6 text-2xl font-black text-white sm:text-3xl">User Reviews</h2>

          <div className="mb-8 rounded-2xl p-5 sm:p-6"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h3 className="mb-4 text-base font-bold text-white">Share your review</h3>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm text-gray-400">Your rating</span>
              <StarRating value={userRating} onChange={setUserRating} />
            </div>
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)}
              placeholder="Write your review..." rows={3}
              className="mb-3 w-full resize-none rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none"
              style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.12)' }} />
            <button onClick={submitComment} disabled={!newComment.trim() || userRating === 0}
              className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:scale-[1.02] disabled:opacity-40"
              style={{ background: '#e50914' }}>
              <FiSend className="h-4 w-4" /> Post Review
            </button>
          </div>

          <div className="space-y-4">
            {comments.map(c => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-4 sm:p-5"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex gap-3">
                  <img src={c.avatar} alt={c.user} className="h-10 w-10 flex-shrink-0 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{c.user}</span>
                        <span className="text-sm text-yellow-400">{'★'.repeat(c.rating)}</span>
                      </div>
                      <span className="text-xs text-gray-600">{c.timestamp}</span>
                    </div>
                    <p className="mb-3 text-sm leading-relaxed text-gray-400">{c.text}</p>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-400 transition-colors">
                        <FiThumbsUp className="h-3.5 w-3.5" /> {c.likes}
                      </button>
                      <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors">
                        <FiThumbsDown className="h-3.5 w-3.5" /> {c.dislikes}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
