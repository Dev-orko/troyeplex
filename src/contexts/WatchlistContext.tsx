import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './FirebaseAuthContext'

interface WatchlistContextType {
  watchlist:           number[]
  watched:             number[]
  addToWatchlist:      (id: number) => void
  removeFromWatchlist: (id: number) => void
  toggleWatchlist:     (id: number) => void
  isInWatchlist:       (id: number) => boolean
  markWatched:         (id: number) => void
  removeWatched:       (id: number) => void
  isWatched:           (id: number) => boolean
}

const WatchlistContext = createContext<WatchlistContextType | null>(null)

function storageKey(uid: string, type: 'watchlist' | 'watched') {
  return `sp_${type}_${uid}`
}

function loadIds(uid: string, type: 'watchlist' | 'watched'): number[] {
  try {
    const raw = localStorage.getItem(storageKey(uid, type))
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveIds(uid: string, type: 'watchlist' | 'watched', ids: number[]) {
  try { localStorage.setItem(storageKey(uid, type), JSON.stringify(ids)) } catch {}
}

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const uid = user?.uid ?? 'anon'

  const [watchlist, setWatchlist] = useState<number[]>(() => loadIds(uid, 'watchlist'))
  const [watched,   setWatched]   = useState<number[]>(() => loadIds(uid, 'watched'))

  /* Re-load when user switches */
  useEffect(() => {
    setWatchlist(loadIds(uid, 'watchlist'))
    setWatched(loadIds(uid, 'watched'))
  }, [uid])

  const addToWatchlist = useCallback((id: number) => {
    setWatchlist(prev => {
      if (prev.includes(id)) return prev
      const next = [id, ...prev]
      saveIds(uid, 'watchlist', next)
      return next
    })
  }, [uid])

  const removeFromWatchlist = useCallback((id: number) => {
    setWatchlist(prev => {
      const next = prev.filter(x => x !== id)
      saveIds(uid, 'watchlist', next)
      return next
    })
  }, [uid])

  const toggleWatchlist = useCallback((id: number) => {
    setWatchlist(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [id, ...prev]
      saveIds(uid, 'watchlist', next)
      return next
    })
  }, [uid])

  const isInWatchlist = useCallback((id: number) => watchlist.includes(id), [watchlist])

  const markWatched = useCallback((id: number) => {
    setWatched(prev => {
      if (prev.includes(id)) return prev
      const next = [id, ...prev]
      saveIds(uid, 'watched', next)
      return next
    })
    /* also remove from watchlist once watched */
    setWatchlist(prev => {
      if (!prev.includes(id)) return prev
      const next = prev.filter(x => x !== id)
      saveIds(uid, 'watchlist', next)
      return next
    })
  }, [uid])

  const removeWatched = useCallback((id: number) => {
    setWatched(prev => {
      const next = prev.filter(x => x !== id)
      saveIds(uid, 'watched', next)
      return next
    })
  }, [uid])

  const isWatched = useCallback((id: number) => watched.includes(id), [watched])

  return (
    <WatchlistContext.Provider value={{
      watchlist, watched,
      addToWatchlist, removeFromWatchlist, toggleWatchlist, isInWatchlist,
      markWatched, removeWatched, isWatched,
    }}>
      {children}
    </WatchlistContext.Provider>
  )
}

export function useWatchlist() {
  const ctx = useContext(WatchlistContext)
  if (!ctx) throw new Error('useWatchlist must be used within WatchlistProvider')
  return ctx
}
