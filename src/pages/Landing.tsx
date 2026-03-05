import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlay, FiArrowRight, FiMonitor, FiSmartphone, FiTv, FiTablet } from 'react-icons/fi'
import AuthModal from '../components/auth/AuthModal'
import { useBreakpoint } from '../hooks/useBreakpoint'

/* ── Poster images ─────────────────────────────────────────────────────── */
const COL_A = [
  'https://image.tmdb.org/t/p/w342/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
  'https://image.tmdb.org/t/p/w342/7lTnXOy0iNtBAdRP3TZvaKJ77F6.jpg',
  'https://image.tmdb.org/t/p/w342/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg',
  'https://image.tmdb.org/t/p/w342/8Vt6mWPIuZ0cjGmeToo8lWTXo1T.jpg',
  'https://image.tmdb.org/t/p/w342/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg',
  'https://image.tmdb.org/t/p/w342/7PR0gp7BCroMPmcj9MfGDxJSMKL.jpg',
]
const COL_B = [
  'https://image.tmdb.org/t/p/w342/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
  'https://image.tmdb.org/t/p/w342/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
  'https://image.tmdb.org/t/p/w342/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  'https://image.tmdb.org/t/p/w342/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg',
  'https://image.tmdb.org/t/p/w342/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg',
  'https://image.tmdb.org/t/p/w342/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg',
]
const COL_C = [
  'https://image.tmdb.org/t/p/w342/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg',
  'https://image.tmdb.org/t/p/w342/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg',
  'https://image.tmdb.org/t/p/w342/A3ZbZsmsvNGdprRi2lKgGEeVLEH.jpg',
  'https://image.tmdb.org/t/p/w342/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  'https://image.tmdb.org/t/p/w342/2CAL2433ZeIihfX1Hb2139CX0pW.jpg',
  'https://image.tmdb.org/t/p/w342/sv1xJUazXoQuIDtiys68whNtSmm.jpg',
]

function PosterColumn({ posters, duration }: { posters: string[]; duration: number }) {
  return (
    <div style={{ flex: 1, overflow: 'hidden', height: '100%' }}>
      <div style={{ animation: `scrollUp ${duration}s linear infinite`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[...posters, ...posters].map((src, i) => (
          <div key={i} style={{ borderRadius: 14, overflow: 'hidden', flexShrink: 0, boxShadow: '0 8px 28px rgba(0,0,0,0.55)' }}>
            <img src={src} alt="" style={{ width: '100%', aspectRatio: '2/3', objectFit: 'cover', display: 'block' }} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  )
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Landing() {
  const { isMobile, isTablet } = useBreakpoint()
  const [modalOpen, setModalOpen] = useState(false)
  const [authMode, setAuthMode]   = useState<'login' | 'signup'>('signup')

  const openLogin  = () => { setAuthMode('login');  setModalOpen(true) }
  const openSignup = () => { setAuthMode('signup'); setModalOpen(true) }

  const px = isMobile ? 24 : isTablet ? 36 : 52

  return (
    <>
      <style>{`
        @keyframes scrollUp {
          from { transform: translateY(0); }
          to   { transform: translateY(-50%); }
        }
        @keyframes shimmerBtn {
          from { transform: translateX(-100%) skewX(-15deg); }
          to   { transform: translateX(220%) skewX(-15deg); }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(229,9,20,0.25); }
          50%       { box-shadow: 0 0 0 6px rgba(229,9,20,0.1); }
        }
        .btn-primary:hover .btn-shine { animation: shimmerBtn 0.65s ease forwards; }
      `}</style>

      <div style={{
        background: '#070707',
        minHeight: '100vh',
        width: '100vw',
        overflow: isMobile ? 'auto' : 'hidden',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        color: 'white',
        position: 'relative',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}>

        {/* Glow blobs */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 65% 70% at 10% 55%, rgba(229,9,20,0.14) 0%, transparent 60%)' }} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, background: 'radial-gradient(ellipse 45% 55% at 88% 15%, rgba(139,44,220,0.07) 0%, transparent 55%)' }} />
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.03,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '60px 60px' }} />

        {/* ══ LEFT CONTENT ══ */}
        <div style={{
          width: isMobile ? '100%' : isTablet ? '58%' : '54%',
          minHeight: isMobile ? '100vh' : '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 10,
          flexShrink: 0,
        }}>

          {/* Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', padding: `${isMobile ? 20 : 22}px ${px}px`, flexShrink: 0 }}>
            <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <span style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#e50914' }}>TROYE</span>
              <span style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'white' }}>PLEX</span>
            </motion.div>
          </nav>

          {/* Hero content */}
          <motion.div
            variants={container} initial="hidden" animate="show"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isMobile ? 'flex-start' : 'center',
              padding: isMobile
                ? `0 ${px}px 48px`
                : `0 ${px}px ${isTablet ? 36 : 48}px`,
              gap: isMobile ? 22 : 26,
            }}
          >
            {/* Status pill */}
            <motion.div variants={item}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.28)',
                borderRadius: 999, padding: '6px 16px',
                fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e50914',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e50914', animation: 'pulse 2s infinite' }} />
                Free · Always HD · Zero Ads
              </span>
            </motion.div>

            {/* Headline */}
            <motion.div variants={item} style={{ lineHeight: 1 }}>
              <h1 style={{
                margin: 0, fontWeight: 900, letterSpacing: '-0.04em',
                fontSize: isMobile ? 'clamp(2.2rem,10vw,3rem)' : 'clamp(2.4rem, 4.2vw, 3.8rem)',
                lineHeight: 1.04,
              }}>
                Watch Anything.
              </h1>
              <h1 style={{
                margin: 0, fontWeight: 900, letterSpacing: '-0.04em',
                fontSize: isMobile ? 'clamp(2.2rem,10vw,3rem)' : 'clamp(2.4rem, 4.2vw, 3.8rem)',
                lineHeight: 1.04,
              }}>
                Anytime.{' '}
                <span style={{
                  background: 'linear-gradient(120deg, #e50914 0%, #ff5a1f 50%, #ff2d6e 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>
                  For Free.
                </span>
              </h1>
            </motion.div>

            {/* Sub */}
            <motion.p variants={item} style={{
              margin: 0,
              fontSize: isMobile ? '0.9rem' : '1rem',
              color: '#71717a', lineHeight: 1.65,
              maxWidth: isMobile ? '100%' : 360,
            }}>
              Movies, series & anime in one place — no sign-up walls, no limits, no interruptions.
            </motion.p>

            {/* CTA pair */}
            <motion.div variants={item} style={{ display: 'flex', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
              <motion.button
                className="btn-primary"
                onClick={openSignup}
                whileHover={{ scale: 1.03, boxShadow: '0 12px 48px rgba(229,9,20,0.5)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  flex: 1, position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  background: 'linear-gradient(135deg, #e50914 0%, #c0060f 100%)',
                  boxShadow: '0 6px 28px rgba(229,9,20,0.4)',
                  border: 'none', borderRadius: 18,
                  padding: isMobile ? '15px 24px' : '16px 24px',
                  fontSize: isMobile ? '0.92rem' : '0.95rem',
                  fontWeight: 800, color: 'white', cursor: 'pointer', letterSpacing: '-0.01em',
                  fontFamily: 'inherit',
                }}
              >
                <span className="btn-shine" style={{ position: 'absolute', top: 0, left: 0, width: '40%', height: '100%', background: 'rgba(255,255,255,0.15)', filter: 'blur(8px)', transform: 'translateX(-100%) skewX(-15deg)', pointerEvents: 'none' }} />
                <FiPlay size={16} style={{ fill: 'white', flexShrink: 0 }} />
                Start Watching Free
              </motion.button>

              <motion.button
                onClick={openLogin}
                whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  flex: isMobile ? 'none' : 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: 18,
                  padding: isMobile ? '15px 24px' : '16px 24px',
                  fontSize: isMobile ? '0.92rem' : '0.95rem',
                  fontWeight: 800, color: 'white', cursor: 'pointer', letterSpacing: '-0.01em',
                  fontFamily: 'inherit',
                }}
              >
                Sign In <FiArrowRight size={16} />
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={item} style={{ display: 'flex', alignItems: 'center', gap: 0, flexWrap: 'wrap' }}>
              {[
                { val: '10K+', lbl: 'Titles' },
                { val: '4K',   lbl: 'Quality' },
                { val: '100%', lbl: 'Free'    },
              ].map(({ val, lbl }, i) => (
                <React.Fragment key={lbl}>
                  {i > 0 && <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', margin: `0 ${isMobile ? 14 : 20}px` }} />}
                  <div>
                    <p style={{ margin: 0, fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 900, color: 'white', letterSpacing: '-0.03em' }}>{val}</p>
                    <p style={{ margin: '1px 0 0', fontSize: '0.58rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#52525b' }}>{lbl}</p>
                  </div>
                </React.Fragment>
              ))}

              <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)', margin: `0 ${isMobile ? 14 : 20}px` }} />

              <div style={{ display: 'flex', gap: 5 }}>
                {[FiTv, FiMonitor, FiTablet, FiSmartphone].map((Icon, i) => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <Icon size={12} color="#52525b" />
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </div>

        {/* ══ RIGHT — poster mosaic (tablet & desktop only) ══ */}
        {!isMobile && (
          <div style={{
            width: isTablet ? '42%' : '46%',
            height: '100vh',
            overflow: 'hidden',
            display: 'flex',
            gap: 10,
            padding: '0 6px',
            flexShrink: 0,
            position: isTablet ? 'relative' : 'relative',
          }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 110, zIndex: 10, background: 'linear-gradient(to right, #070707, transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 90, zIndex: 10, background: 'linear-gradient(to bottom, #070707, transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 90, zIndex: 10, background: 'linear-gradient(to top, #070707, transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 30, zIndex: 10, background: 'linear-gradient(to left, #070707, transparent)', pointerEvents: 'none' }} />

            <div style={{ flex: 1, marginTop: 0    }}><PosterColumn posters={COL_A} duration={30} /></div>
            <div style={{ flex: 1, marginTop: -80  }}><PosterColumn posters={COL_B} duration={24} /></div>
            {!isTablet && <div style={{ flex: 1, marginTop: -40  }}><PosterColumn posters={COL_C} duration={20} /></div>}
          </div>
        )}

        {/* Mobile: blurred poster background */}
        {isMobile && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
            <div style={{ display: 'flex', gap: 8, padding: '0 4px', height: '100%', opacity: 0.12, filter: 'blur(2px)' }}>
              <div style={{ flex: 1 }}><PosterColumn posters={COL_A} duration={30} /></div>
              <div style={{ flex: 1 }}><PosterColumn posters={COL_B} duration={24} /></div>
            </div>
          </div>
        )}

      </div>

      <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} initialMode={authMode} />
    </>
  )
}
