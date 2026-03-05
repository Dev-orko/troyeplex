import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/FirebaseAuthContext'
import { useWatchlist } from '../contexts/WatchlistContext'

export interface ProfileData {
  displayName: string
  avatarColor: string
  avatarPhoto: string | null   // base64 data URL
  bio:         string
  joinedAt:    string
  plan:        'Free' | 'Standard' | 'Premium'
}

export const AVATAR_COLORS = [
  { id: 'red',    label: 'Crimson', from: '#e50914', to: '#ff5a1f' },
  { id: 'blue',   label: 'Ocean',   from: '#3b82f6', to: '#6366f1' },
  { id: 'purple', label: 'Violet',  from: '#8b5cf6', to: '#ec4899' },
  { id: 'green',  label: 'Emerald', from: '#10b981', to: '#06b6d4' },
  { id: 'gold',   label: 'Gold',    from: '#f59e0b', to: '#ef4444' },
  { id: 'cyan',   label: 'Arctic',  from: '#06b6d4', to: '#3b82f6' },
  { id: 'rose',   label: 'Rose',    from: '#f43f5e', to: '#fb923c' },
  { id: 'indigo', label: 'Indigo',  from: '#6366f1', to: '#8b5cf6' },
]

const PROFILE_KEY = 'sp_profile_v2'
const PHOTO_KEY   = 'sp_avatar_photo'

function getStored(uid: string): Partial<ProfileData> {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY}_${uid}`)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function persist(uid: string, data: Partial<ProfileData>) {
  try {
    const existing = getStored(uid)
    // Never store avatarPhoto inline — stored separately under PHOTO_KEY
    const { avatarPhoto: _, ...rest } = data as ProfileData
    localStorage.setItem(`${PROFILE_KEY}_${uid}`, JSON.stringify({ ...existing, ...rest }))
  } catch {}
}

function getStoredPhoto(uid: string): string | null {
  try { return localStorage.getItem(`${PHOTO_KEY}_${uid}`) } catch { return null }
}

function savePhoto(uid: string, dataUrl: string | null) {
  try {
    if (dataUrl) localStorage.setItem(`${PHOTO_KEY}_${uid}`, dataUrl)
    else         localStorage.removeItem(`${PHOTO_KEY}_${uid}`)
  } catch {}
}

export function useProfile() {
  const { user, role } = useAuth()
  const { watchlist, watched } = useWatchlist()
  const uid = user?.uid ?? 'guest'

  const [profile, setProfile] = useState<ProfileData>(() => {
    const stored = getStored(uid)
    return {
      displayName: stored.displayName ?? user?.displayName ?? user?.email?.split('@')[0] ?? 'User',
      avatarColor: stored.avatarColor ?? 'red',
      avatarPhoto: getStoredPhoto(uid),
      bio:         stored.bio         ?? '',
      joinedAt:    stored.joinedAt    ?? new Date().toISOString(),
      plan:        stored.plan        ?? (role === 'admin' ? 'Premium' : role === 'brother' ? 'Standard' : 'Free'),
    }
  })

  useEffect(() => {
    if (!user) return
    const stored = getStored(user.uid)
    setProfile({
      displayName: stored.displayName ?? user.displayName ?? user.email?.split('@')[0] ?? 'User',
      avatarColor: stored.avatarColor ?? 'red',
      avatarPhoto: getStoredPhoto(user.uid),
      bio:         stored.bio         ?? '',
      joinedAt:    stored.joinedAt    ?? new Date().toISOString(),
      plan:        stored.plan        ?? (role === 'admin' ? 'Premium' : role === 'brother' ? 'Standard' : 'Free'),
    })
  }, [user?.uid, role])

  const update = useCallback((patch: Partial<ProfileData>) => {
    setProfile(prev => {
      const next = { ...prev, ...patch }
      persist(uid, next)
      return next
    })
  }, [uid])

  const setAvatarPhoto = useCallback((dataUrl: string | null) => {
    savePhoto(uid, dataUrl)
    setProfile(prev => ({ ...prev, avatarPhoto: dataUrl }))
  }, [uid])

  const avatarGradient = AVATAR_COLORS.find(c => c.id === profile.avatarColor) ?? AVATAR_COLORS[0]
  const initial        = (profile.displayName?.[0] ?? '?').toUpperCase()
  const joinedDate     = new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const email          = user?.email ?? ''

  return {
    profile, update, setAvatarPhoto,
    avatarGradient, initial, joinedDate, email,
    role,
    watchlistCount: watchlist.length,
    watchedCount:   watched.length,
  }
}
