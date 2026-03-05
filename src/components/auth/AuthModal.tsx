import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheck } from 'react-icons/fi'
import { useAuth } from '../../contexts/FirebaseAuthContext'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.09)',
  borderRadius: 14,
  padding: '13px 44px 13px 44px',
  fontSize: '0.875rem',
  color: 'white',
  outline: 'none',
  transition: 'border-color 0.2s',
  fontFamily: 'inherit',
}

function Field({
  icon: Icon, type, value, onChange, placeholder, required, minLength, autoComplete,
  right,
}: {
  icon: React.ElementType; type: string; value: string
  onChange: (v: string) => void; placeholder: string
  required?: boolean; minLength?: number; autoComplete?: string
  right?: React.ReactNode
}) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <Icon size={15} color={focused ? '#e50914' : '#52525b'}
        style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }} />
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} required={required} minLength={minLength}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          ...INPUT_STYLE,
          borderColor: focused ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.09)',
          boxShadow: focused ? '0 0 0 3px rgba(229,9,20,0.08)' : 'none',
          paddingRight: right ? 44 : 16,
        }}
      />
      {right && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          {right}
        </div>
      )}
    </div>
  )
}

/* sliding tab indicator */
const TAB_MODES = ['login', 'signup'] as const

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode]             = useState<'login' | 'signup' | 'reset'>(initialMode)
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [confirm, setConfirm]       = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [showConf, setShowConf]     = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState('')
  const [loading, setLoading]       = useState(false)

  const { signIn, signUp, resetPassword } = useAuth()

  useEffect(() => { setMode(initialMode) }, [initialMode])
  useEffect(() => {
    setEmail(''); setPassword(''); setConfirm('')
    setError(''); setSuccess(''); setShowPass(false); setShowConf(false)
  }, [mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess('')
    if (mode === 'signup' && password !== confirm) { setError('Passwords do not match.'); return }
    if (mode === 'signup' && password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      if (mode === 'login')       { await signIn(email, password); onClose() }
      else if (mode === 'signup') { await signUp(email, password); onClose() }
      else                        { await resetPassword(email); setSuccess('Reset link sent! Check your inbox.') }
    } catch (err: any) {
      const map: Record<string, string> = {
        'auth/user-not-found':        'No account found with this email.',
        'auth/wrong-password':        'Incorrect password.',
        'auth/email-already-in-use':  'Email already in use.',
        'auth/invalid-email':         'Enter a valid email address.',
        'auth/too-many-requests':     'Too many attempts — wait a moment.',
      }
      setError(map[err.code] || err.message || 'Something went wrong.')
    } finally { setLoading(false) }
  }

  const btnLabel = { login: 'Sign In', signup: 'Create Account', reset: 'Send Reset Link' }[mode]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 16, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(14px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 32 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 420, borderRadius: 24, overflow: 'hidden',
              background: '#0e0e0e',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.9), 0 0 0 1px rgba(229,9,20,0.06)',
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          >
            {/* ── Top accent bar ── */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #e50914, #ff5a1f, #e50914)', backgroundSize: '200% 100%', animation: 'gradientSlide 3s linear infinite' }} />

            <style>{`
              @keyframes gradientSlide { 0%{background-position:0%} 100%{background-position:200%} }
              @keyframes spin { to { transform: rotate(360deg); } }
              input::placeholder { color: #3f3f46; }
              input:focus { outline: none; }
            `}</style>

            <div style={{ padding: '28px 32px 32px' }}>

              {/* Logo + close */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#e50914' }}>TROYE</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'white' }}>PLEX</span>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1, background: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.9 }}
                  style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#71717a' }}
                >
                  <FiX size={14} />
                </motion.button>
              </div>

              {/* ── Tab switcher (only for login/signup) ── */}
              <AnimatePresence mode="wait">
                {mode !== 'reset' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    style={{
                      display: 'flex', position: 'relative', marginBottom: 28,
                      background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4,
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
                  >
                    {/* Sliding pill */}
                    <motion.div
                      layout
                      style={{
                        position: 'absolute', top: 4, bottom: 4,
                        width: 'calc(50% - 4px)',
                        left: mode === 'login' ? 4 : 'calc(50%)',
                        background: 'linear-gradient(135deg, #e50914, #c0060f)',
                        borderRadius: 10,
                        boxShadow: '0 4px 16px rgba(229,9,20,0.35)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                    {TAB_MODES.map(m => (
                      <button key={m} onClick={() => setMode(m)}
                        style={{
                          flex: 1, position: 'relative', zIndex: 1,
                          padding: '10px 0', border: 'none', background: 'transparent',
                          fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                          color: mode === m ? 'white' : '#52525b',
                          transition: 'color 0.2s', borderRadius: 10,
                          letterSpacing: '0.01em',
                        }}
                      >
                        {m === 'login' ? 'Sign In' : 'Sign Up'}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reset mode heading */}
              {mode === 'reset' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                  <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Reset Password</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#52525b' }}>We'll send a reset link to your email.</p>
                </motion.div>
              )}

              {/* ── Error / Success banners ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    style={{ background: 'rgba(229,9,20,0.08)', border: '1px solid rgba(229,9,20,0.22)', borderRadius: 12, padding: '10px 14px', fontSize: '0.8rem', color: '#fca5a5', overflow: 'hidden' }}
                  >
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.22)', borderRadius: 12, padding: '10px 14px', fontSize: '0.8rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}
                  >
                    <FiCheck size={14} /> {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit}>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mode}
                    initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                  >
                    <Field
                      icon={FiMail} type="email" value={email} onChange={setEmail}
                      placeholder="Email address" required autoComplete="email"
                    />
                    {mode !== 'reset' && (
                      <Field
                        icon={FiLock}
                        type={showPass ? 'text' : 'password'}
                        value={password} onChange={setPassword}
                        placeholder="Password" required minLength={6}
                        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                        right={
                          <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', display: 'flex', padding: 0 }}>
                            {showPass ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                          </button>
                        }
                      />
                    )}
                    {mode === 'signup' && (
                      <Field
                        icon={FiLock}
                        type={showConf ? 'text' : 'password'}
                        value={confirm} onChange={setConfirm}
                        placeholder="Confirm password" required
                        autoComplete="new-password"
                        right={
                          <button type="button" tabIndex={-1} onClick={() => setShowConf(v => !v)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b', display: 'flex', padding: 0 }}>
                            {showConf ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                          </button>
                        }
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Forgot password */}
                {mode === 'login' && (
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <button type="button" onClick={() => setMode('reset')}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.75rem', color: '#52525b', padding: 0 }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#e50914')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#52525b')}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading || !!success}
                  whileHover={{ scale: loading ? 1 : 1.02, boxShadow: '0 8px 32px rgba(229,9,20,0.45)' }}
                  whileTap={{ scale: 0.97 }}
                  style={{
                    width: '100%', marginTop: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    background: loading || success ? 'rgba(229,9,20,0.5)' : 'linear-gradient(135deg, #e50914 0%, #c0060f 100%)',
                    boxShadow: '0 6px 24px rgba(229,9,20,0.3)',
                    border: 'none', borderRadius: 14, padding: '14px 20px',
                    fontSize: '0.9rem', fontWeight: 800, color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {loading ? (
                    <>
                      <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />
                      Please wait…
                    </>
                  ) : (
                    <>
                      {btnLabel}
                      <FiArrowRight size={15} />
                    </>
                  )}
                </motion.button>
              </form>

              {/* ── Footer ── */}
              <div style={{ marginTop: 20, textAlign: 'center', fontSize: '0.78rem', color: '#52525b' }}>
                {mode === 'login' && (
                  <span>
                    New to Troyeplex?{' '}
                    <button onClick={() => setMode('signup')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e50914', fontWeight: 700, padding: 0 }}>
                      Create a free account
                    </button>
                  </span>
                )}
                {mode === 'signup' && (
                  <span>
                    Already have an account?{' '}
                    <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e50914', fontWeight: 700, padding: 0 }}>
                      Sign in
                    </button>
                  </span>
                )}
                {mode === 'reset' && (
                  <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e50914', fontWeight: 700, padding: 0, fontSize: '0.78rem' }}>
                    ← Back to Sign In
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
