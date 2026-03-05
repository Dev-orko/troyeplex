import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { useAuth } from '../contexts/FirebaseAuthContext'

export default function Login() {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: '#141414', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="mb-6">
          <div className="mb-1 flex items-center gap-1">
            <span className="text-lg font-black" style={{ color: '#e50914' }}>TROYE</span>
            <span className="text-lg font-black text-white">PLEX</span>
          </div>
          <h1 className="text-xl font-bold text-white">Sign In</h1>
        </div>

        {error && (
          <div className="mb-4 rounded-lg px-4 py-3 text-sm text-red-400"
            style={{ background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <FiMail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Email address" required autoComplete="email"
              className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
          <div className="relative">
            <FiLock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" required autoComplete="current-password"
              className="w-full rounded-xl py-3 pl-10 pr-10 text-sm text-white placeholder-gray-500 outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }} />
            <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              {showPass ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
            style={{ background: '#e50914' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <button onClick={() => navigate('/welcome')} className="font-semibold hover:underline" style={{ color: '#e50914' }}>
            Sign up free
          </button>
        </p>
      </motion.div>
    </div>
  )
}
