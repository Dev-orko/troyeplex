import React, { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../config/firebase'

export type UserRole = 'admin' | 'brother' | 'guest'

export interface RegisteredUser {
  email:       string
  displayName: string
  uid:         string
  role:        UserRole
  joinedAt:    string
}

interface AuthContextType {
  user:             User | null
  role:             UserRole
  loading:          boolean
  signIn:           (email: string, password: string) => Promise<void>
  signUp:           (email: string, password: string, displayName?: string) => Promise<void>
  signInAsGuest:    () => Promise<void>
  logout:           () => Promise<void>
  resetPassword:    (email: string) => Promise<void>
  isDemoMode:       boolean
  allUsers:         RegisteredUser[]
  adminCreateUser:  (email: string, password: string, displayName: string, role: UserRole) => Promise<void>
  adminRemoveUser:  (uid: string) => Promise<void>
  adminUpdateRole:  (uid: string, role: UserRole) => Promise<void>
  adminUpdateName:  (uid: string, displayName: string) => Promise<void>
  refreshUsers:     () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

/* ── Storage keys ──────────────────────────────────────────────────────── */
const LOCAL_SESSION_KEY = 'sp_local_user'
const LOCAL_USERS_KEY   = 'sp_local_users'
const GUEST_UID         = 'local-guest-session'

/* ── Built-in accounts ─────────────────────────────────────────────────── */
type LocalUser = { password: string; displayName: string; uid: string; role: UserRole; joinedAt: string }

const ADMIN_USERS: Record<string, LocalUser> = {
  'orko@admin.com': {
    password:    'orko123',
    displayName: 'Orko Admin',
    uid:         'local-admin-orko',
    role:        'admin',
    joinedAt:    new Date('2024-01-01').toISOString(),
  },
}

function getLocalUsers(): Record<string, LocalUser> {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY)
    return stored ? { ...ADMIN_USERS, ...JSON.parse(stored) } : { ...ADMIN_USERS }
  } catch { return { ...ADMIN_USERS } }
}

function saveLocalUser(email: string, entry: LocalUser) {
  try {
    const stored = localStorage.getItem(LOCAL_USERS_KEY)
    const users  = stored ? JSON.parse(stored) : {}
    users[email] = entry
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
  } catch {}
}

function buildMockUser(email: string): User {
  const u = getLocalUsers()[email]
  return {
    uid:           u.uid,
    email,
    displayName:   u.displayName,
    emailVerified: true,
    isAnonymous:   false,
    metadata:      {},
    providerData:  [],
    refreshToken:  '',
    tenantId:      null,
    delete:        async () => {},
    getIdToken:    async () => '',
    getIdTokenResult: async () => ({} as any),
    reload:        async () => {},
    toJSON:        () => ({}),
    providerId:    'password',
    phoneNumber:   null,
    photoURL:      null,
  } as unknown as User
}

function buildGuestUser(): User {
  return {
    uid:           GUEST_UID,
    email:         'guest@troyeplex.com',
    displayName:   'Guest',
    emailVerified: false,
    isAnonymous:   true,
    metadata:      {},
    providerData:  [],
    refreshToken:  '',
    tenantId:      null,
    delete:        async () => {},
    getIdToken:    async () => '',
    getIdTokenResult: async () => ({} as any),
    reload:        async () => {},
    toJSON:        () => ({}),
    providerId:    'anonymous',
    phoneNumber:   null,
    photoURL:      null,
  } as unknown as User
}

function getRoleForEmail(email: string): UserRole {
  const users = getLocalUsers()
  return users[email.toLowerCase().trim()]?.role ?? 'brother'
}

function buildAllUsers(): RegisteredUser[] {
  return Object.entries(getLocalUsers()).map(([email, u]) => ({
    email,
    displayName: u.displayName,
    uid:         u.uid,
    role:        u.role,
    joinedAt:    u.joinedAt ?? new Date().toISOString(),
  }))
}

/* ── Provider ──────────────────────────────────────────────────────────── */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,     setUser]     = useState<User | null>(null)
  const [role,     setRole]     = useState<UserRole>('guest')
  const [loading,  setLoading]  = useState(true)
  const [allUsers, setAllUsers] = useState<RegisteredUser[]>(buildAllUsers)

  const refreshUsers = () => setAllUsers(buildAllUsers())

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      try {
        const stored = localStorage.getItem(LOCAL_SESSION_KEY)
        if (stored) {
          const { email, isGuest } = JSON.parse(stored)
          if (isGuest) {
            setUser(buildGuestUser())
            setRole('guest')
          } else if (email && getLocalUsers()[email]) {
            setUser(buildMockUser(email))
            setRole(getRoleForEmail(email))
          }
        }
      } catch { localStorage.removeItem(LOCAL_SESSION_KEY) }
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        setUser(firebaseUser)
        setRole(firebaseUser ? (firebaseUser.email === 'orko@admin.com' ? 'admin' : 'brother') : 'guest')
        setLoading(false)
      },
      () => { setUser(null); setRole('guest'); setLoading(false) }
    )
    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      const key   = email.toLowerCase().trim()
      const users = getLocalUsers()
      const entry = users[key]
      if (!entry || entry.password !== password) throw new Error('Invalid email or password.')
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ email: key }))
      setUser(buildMockUser(key))
      setRole(entry.role)
      return
    }
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!isFirebaseConfigured || !auth) {
      const key   = email.toLowerCase().trim()
      const users = getLocalUsers()
      if (users[key]) throw new Error('An account with this email already exists.')
      const newUser: LocalUser = {
        password,
        displayName: displayName || key.split('@')[0],
        uid:         `local-${Date.now()}`,
        role:        'brother',
        joinedAt:    new Date().toISOString(),
      }
      saveLocalUser(key, newUser)
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ email: key }))
      setUser(buildMockUser(key))
      setRole('brother')
      return
    }
    await createUserWithEmailAndPassword(auth, email, password)
  }

  const signInAsGuest = async () => {
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ isGuest: true }))
    setUser(buildGuestUser())
    setRole('guest')
  }

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      localStorage.removeItem(LOCAL_SESSION_KEY)
      setUser(null)
      setRole('guest')
      return
    }
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) throw new Error('Not available in this mode.')
    await sendPasswordResetEmail(auth, email)
  }

  /* ── Admin functions ───────────────────────────────────────────────── */
  const adminCreateUser = async (email: string, password: string, displayName: string, newRole: UserRole) => {
    const key   = email.toLowerCase().trim()
    const users = getLocalUsers()
    if (users[key]) throw new Error('An account with this email already exists.')
    const entry: LocalUser = {
      password,
      displayName: displayName || key.split('@')[0],
      uid:         `local-${Date.now()}`,
      role:        newRole,
      joinedAt:    new Date().toISOString(),
    }
    saveLocalUser(key, entry)
    refreshUsers()
  }

  const adminRemoveUser = async (uid: string) => {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY)
      const users: Record<string, LocalUser> = stored ? JSON.parse(stored) : {}
      const emailToRemove = Object.keys(users).find(e => users[e].uid === uid)
      if (emailToRemove) {
        delete users[emailToRemove]
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
      }
    } catch {}
    refreshUsers()
  }

  const adminUpdateRole = async (uid: string, newRole: UserRole) => {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY)
      const users: Record<string, LocalUser> = stored ? JSON.parse(stored) : {}
      const email = Object.keys(users).find(e => users[e].uid === uid)
      if (email) {
        users[email].role = newRole
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
      }
    } catch {}
    refreshUsers()
  }

  const adminUpdateName = async (uid: string, displayName: string) => {
    try {
      const stored = localStorage.getItem(LOCAL_USERS_KEY)
      const users: Record<string, LocalUser> = stored ? JSON.parse(stored) : {}
      const email = Object.keys(users).find(e => users[e].uid === uid)
      if (email) {
        users[email].displayName = displayName
        localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users))
      }
    } catch {}
    refreshUsers()
  }

  return (
    <AuthContext.Provider value={{
      user, role, loading,
      signIn, signUp, signInAsGuest, logout, resetPassword,
      isDemoMode: !isFirebaseConfigured,
      allUsers, refreshUsers,
      adminCreateUser, adminRemoveUser, adminUpdateRole, adminUpdateName,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
