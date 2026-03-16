import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSearch, FiUser, FiLogOut, FiX, FiChevronDown, FiSettings, FiBookmark, FiEye, FiMenu } from 'react-icons/fi'
import { useAuth } from '../../contexts/FirebaseAuthContext'
import { useProfile } from '../../hooks/useProfile'
import { useBreakpoint } from '../../hooks/useBreakpoint'

const NAV_LINKS = [
  { label: 'Home',          path: '/'            },
  { label: 'Movies',        path: '/movies'      },
  { label: 'Series',        path: '/series'      },
  { label: 'New & Popular', path: '/new-popular' },
  { label: 'Live TV',       path: '/live-tv'     },
]

export default function Header() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user, logout } = useAuth()
  const { profile, avatarGradient, initial, watchlistCount, watchedCount, role } = useProfile()

  const { isMobile, isTablet } = useBreakpoint()
  const [scrolled,      setScrolled]      = useState(false)
  const [searchOpen,    setSearchOpen]    = useState(false)
  const [searchQuery,   setSearchQuery]   = useState('')
  const [profileOpen,   setProfileOpen]   = useState(false)
  const [menuOpen,      setMenuOpen]      = useState(false)
  const profileRef   = useRef<HTMLDivElement>(null)
  const searchRef    = useRef<HTMLInputElement>(null)
  const searchLeaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50)
  }, [searchOpen])

  // Cleanup leave timer on unmount
  useEffect(() => {
    return () => { if (searchLeaveTimer.current) clearTimeout(searchLeaveTimer.current) }
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setSearchQuery('')
    }
  }

  const isActive = (path: string) => location.pathname === path

  const headerHeight = isMobile ? 56 : 64
  const sidePad = isMobile ? 16 : isTablet ? 28 : 24

  return (
    <>
      <header
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          transition: 'background 0.4s, backdrop-filter 0.4s, border-color 0.4s',
          background: scrolled || menuOpen ? 'rgba(8,8,8,0.97)' : 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, transparent 100%)',
          backdropFilter: scrolled || menuOpen ? 'blur(20px) saturate(160%)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.05)' : '1px solid transparent',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: headerHeight, maxWidth: 1600, margin: '0 auto',
          padding: `0 ${sidePad}px`,
        }}>

          {/* ── Left: Hamburger (mobile) + Logo ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 0, flexShrink: 0 }}>
            {/* Hamburger for mobile */}
            {isMobile && (
              <button
                onClick={() => setMenuOpen(v => !v)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36, borderRadius: 10,
                  color: 'rgba(255,255,255,0.8)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {menuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiX size={22} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FiMenu size={22} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            )}

            {/* Logo */}
            <div
              onClick={() => navigate('/')}
              style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0, userSelect: 'none' }}
            >
              <span style={{ fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: '#e50914' }}>TROYE</span>
              <span style={{ fontSize: isMobile ? '1.2rem' : '1.4rem', fontWeight: 900, letterSpacing: '-0.04em', color: 'white' }}>PLEX</span>
            </div>
          </div>

          {/* ── Nav (desktop/tablet only) ── */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {NAV_LINKS.map(link => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  style={{
                    position: 'relative', background: 'none', border: 'none', cursor: 'pointer',
                    padding: '6px 12px', borderRadius: 8, fontSize: '0.83rem', fontWeight: 600,
                    color: isActive(link.path) ? 'white' : 'rgba(255,255,255,0.55)',
                    transition: 'color 0.2s, background 0.2s',
                  }}
                  onMouseEnter={e => { if (!isActive(link.path)) (e.currentTarget as HTMLButtonElement).style.color = 'white' }}
                  onMouseLeave={e => { if (!isActive(link.path)) (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.55)' }}
                >
                  {link.label}
                  {isActive(link.path) && (
                    <motion.span
                      layoutId="nav-pill"
                      style={{
                        position: 'absolute', inset: 0, borderRadius: 8,
                        background: 'rgba(255,255,255,0.1)',
                        zIndex: -1,
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                    />
                  )}
                </button>
              ))}
            </nav>
          )}

          {/* ── Right actions ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 6 }}>

            {/* Search — clip-path reveal */}
            <div
              style={{ position: 'relative', display: 'flex', alignItems: 'center', height: 36 }}
              onMouseEnter={() => {
                if (searchLeaveTimer.current) clearTimeout(searchLeaveTimer.current)
              }}
              onMouseLeave={() => {
                if (!isMobile) {
                  searchLeaveTimer.current = setTimeout(() => {
                    setSearchOpen(false)
                    setSearchQuery('')
                  }, 900)
                }
              }}
            >

              {/* Expanded search bar */}
              <motion.form
                onSubmit={handleSearch}
                initial={false}
                animate={searchOpen
                  ? {
                      clipPath: 'inset(0 0% 0 0 round 10px)',
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      pointerEvents: 'auto',
                    }
                  : {
                      clipPath: 'inset(0 100% 0 0 round 10px)',
                      opacity: 0,
                      y: -6,
                      scale: 0.97,
                      pointerEvents: 'none',
                    }
                }
                transition={searchOpen
                  ? { duration: 0.38, ease: [0.22, 1, 0.36, 1] }
                  : {
                      clipPath: { duration: 0.52, ease: [0.4, 0, 0.2, 1] },
                      opacity:  { duration: 0.38, ease: 'easeIn', delay: 0.08 },
                      y:        { duration: 0.44, ease: [0.4, 0, 0.2, 1] },
                      scale:    { duration: 0.44, ease: [0.4, 0, 0.2, 1] },
                    }
                }
                style={{
                  position: isMobile ? 'fixed' : 'absolute',
                  right: isMobile ? 16 : 0,
                  left: isMobile ? 16 : 'auto',
                  top: isMobile ? (headerHeight - 36) / 2 : 'auto',
                  width: isMobile ? 'auto' : (isTablet ? 220 : 264),
                  maxWidth: isMobile ? 'none' : 264,
                  height: 36,
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(12,12,12,0.92)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 10,
                  backdropFilter: 'blur(20px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  zIndex: 10,
                }}
              >
                {/* Submit icon */}
                <button
                  type="submit"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 0 0 12px', flexShrink: 0, color: 'rgba(255,255,255,0.5)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
                >
                  <FiSearch size={15} />
                </button>

                {/* Input */}
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Escape' && (setSearchOpen(false), setSearchQuery(''))}
                  placeholder="Search movies, series…"
                  style={{
                    flex: 1, background: 'transparent', border: 'none', outline: 'none',
                    padding: '0 10px', fontSize: '0.83rem', color: 'white',
                    fontFamily: 'inherit', minWidth: 0,
                  }}
                />

                {/* Clear / close button */}
                <button
                  type="button"
                  onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 10px', flexShrink: 0,
                    color: 'rgba(255,255,255,0.35)',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'white')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  <FiX size={15} />
                </button>
              </motion.form>

              {/* Search icon toggle button */}
              <motion.button
                onClick={() => setSearchOpen(v => !v)}
                animate={{ opacity: searchOpen ? 0 : 1, scale: searchOpen ? 0.8 : 1 }}
                transition={{ duration: 0.18 }}
                style={{
                  position: 'relative', zIndex: 11,
                  width: 36, height: 36, borderRadius: 10,
                  background: searchOpen ? 'transparent' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${searchOpen ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
                  pointerEvents: searchOpen ? 'none' : 'auto',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                whileHover={{ background: 'rgba(255,255,255,0.12)', color: 'white' } as any}
              >
                <FiSearch size={16} />
              </motion.button>
            </div>

            {/* Profile */}
            <div ref={profileRef} style={{ position: 'relative' }}>
              {/* Trigger button */}
              <button
                onClick={() => setProfileOpen(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8,
                  background: profileOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${profileOpen ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, padding: isMobile ? '4px 6px 4px 4px' : '4px 10px 4px 4px', cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { if (!profileOpen) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.09)' } }}
                onMouseLeave={e => { if (!profileOpen) { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.05)' } }}
              >
                {/* Mini avatar */}
                <div style={{
                  width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: 9, flexShrink: 0,
                  background: profile.avatarPhoto ? 'transparent' : `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? '0.65rem' : '0.74rem', fontWeight: 900, color: 'white',
                  boxShadow: `0 0 8px ${avatarGradient.from}55`,
                  overflow: 'hidden',
                }}>
                  {profile.avatarPhoto
                    ? <img src={profile.avatarPhoto} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : user?.email ? initial : <FiUser size={isMobile ? 11 : 13} />
                  }
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.85)', maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                  className="hidden sm:block">
                  {profile.displayName || user?.email?.split('@')[0] || 'Account'}
                </span>
                <motion.div
                  animate={{ rotate: profileOpen ? 180 : 0 }}
                  transition={{ duration: 0.22 }}
                  className="hidden sm:block"
                >
                  <FiChevronDown size={12} color="rgba(255,255,255,0.38)" />
                </motion.div>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, scale: 1,    filter: 'blur(0px)' }}
                    exit={{    opacity: 0, y: 6, scale: 0.97, filter: 'blur(3px)' }}
                    transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      position: 'fixed',
                      top: headerHeight + 6,
                      right: isMobile ? 8 : 16,
                      left: isMobile ? 8 : 'auto',
                      width: isMobile ? 'auto' : 292,
                      background: 'rgba(8,8,8,0.96)',
                      border: '1px solid rgba(255,255,255,0.09)',
                      borderRadius: 20,
                      boxShadow: '0 32px 80px rgba(0,0,0,0.95), 0 0 0 1px rgba(255,255,255,0.03)',
                      backdropFilter: 'blur(28px)',
                      zIndex: 9999,
                    }}
                  >
                    {/* ── colour bar top ── */}
                    <div style={{
                      height: 2,
                      background: `linear-gradient(90deg,${avatarGradient.from},${avatarGradient.to})`,
                      borderRadius: '20px 20px 0 0',
                    }} />

                    {/* ── hero: avatar + info ── */}
                    <div style={{
                      padding: '16px 16px 14px',
                      background: `linear-gradient(135deg,${avatarGradient.from}14,${avatarGradient.to}08,transparent 70%)`,
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* avatar */}
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 13, overflow: 'hidden',
                            background: profile.avatarPhoto
                              ? 'transparent'
                              : `linear-gradient(135deg,${avatarGradient.from},${avatarGradient.to})`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1.1rem', fontWeight: 900, color: 'white',
                            boxShadow: `0 4px 16px ${avatarGradient.from}50`,
                          }}>
                            {profile.avatarPhoto
                              ? <img src={profile.avatarPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              : initial}
                          </div>
                          <div style={{
                            position: 'absolute', bottom: 1, right: 1,
                            width: 9, height: 9, borderRadius: '50%',
                            background: '#22c55e', border: '2px solid #080808',
                          }} />
                        </div>

                        {/* text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{
                            margin: '0 0 1px',
                            fontSize: '0.88rem', fontWeight: 800, color: 'white',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {profile.displayName}
                          </p>
                          <p style={{
                            margin: '0 0 7px',
                            fontSize: '0.67rem', color: 'rgba(255,255,255,0.35)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {user?.email}
                          </p>
                          {/* role pill */}
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            fontSize: '0.57rem', fontWeight: 800,
                            letterSpacing: '0.12em', textTransform: 'uppercase',
                            padding: '3px 8px', borderRadius: 6,
                            background: role==='admin'   ? 'rgba(251,191,36,0.15)'
                                      : role==='brother' ? 'rgba(99,102,241,0.15)'
                                      :                    'rgba(255,255,255,0.07)',
                            color:      role==='admin'   ? '#fde68a'
                                      : role==='brother' ? '#c7d2fe'
                                      :                    'rgba(255,255,255,0.4)',
                            border:     `1px solid ${
                                          role==='admin'   ? 'rgba(251,191,36,0.25)'
                                        : role==='brother' ? 'rgba(99,102,241,0.25)'
                                        :                    'rgba(255,255,255,0.1)'
                                        }`,
                          }}>
                            {role==='admin' ? '★' : role==='brother' ? '◆' : '○'}
                            {role==='admin' ? 'Admin' : role==='brother' ? 'Brother' : 'Guest'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ── stats row ── */}
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      borderBottom: '1px solid rgba(255,255,255,0.06)',
                    }}>
                      {[
                        { icon:<FiBookmark size={12}/>, label:'Watchlist', value:watchlistCount, accent:avatarGradient.from },
                        { icon:<FiEye      size={12}/>, label:'Watched',   value:watchedCount,   accent:avatarGradient.to   },
                      ].map(({ icon, label, value, accent }, i) => (
                        <div key={label} style={{
                          padding: '11px 0 10px',
                          textAlign: 'center',
                          borderRight: i===0 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                        }}>
                          <p style={{ margin: '0 0 3px', fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{value}</p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, color: accent, opacity: 0.7 }}>
                            {icon}
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── nav items ── */}
                    <div style={{ padding: '6px 8px' }}>
                      {([
                        { icon:<FiUser     size={14}/>, label:'My Profile',  sub:'View & edit account',    action:() => { setProfileOpen(false); navigate('/profile') } },
                        { icon:<FiSettings size={14}/>, label:'Appearance',  sub:'Avatar & theme',         action:() => { setProfileOpen(false); navigate('/profile?tab=Appearance') } },
                      ] as { icon:React.ReactNode; label:string; sub:string; action:()=>void }[]).map(({ icon, label, sub, action }) => (
                        <button
                          key={label}
                          onClick={action}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                            background: 'none', border: 'none', cursor: 'pointer',
                            padding: '9px 10px', borderRadius: 11, textAlign: 'left',
                            transition: 'background 0.15s',
                          }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                        >
                          <div style={{
                            width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                            background: 'rgba(255,255,255,0.06)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'rgba(255,255,255,0.55)',
                          }}>
                            {icon}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>{label}</p>
                            <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.32)' }}>{sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* ── sign out ── */}
                    <div style={{ padding: '4px 8px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <button
                        onClick={async () => { setProfileOpen(false); await logout(); navigate('/welcome') }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                          background: 'none', border: 'none', cursor: 'pointer',
                          padding: '9px 10px', borderRadius: 11, textAlign: 'left',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(229,9,20,0.09)'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                      >
                        <div style={{
                          width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                          background: 'rgba(229,9,20,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#f87171',
                        }}>
                          <FiLogOut size={14} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700, color: '#f87171' }}>Sign Out</p>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(229,9,20,0.45)' }}>End your session</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile Nav Overlay ── */}
      <AnimatePresence>
        {menuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed',
              top: headerHeight,
              left: 0, right: 0, bottom: 0,
              zIndex: 49,
              background: 'rgba(8,8,8,0.98)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Nav links */}
            <motion.nav
              initial="hidden"
              animate="show"
              exit="hidden"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
              }}
              style={{
                padding: '16px 20px 24px',
                display: 'flex', flexDirection: 'column', gap: 4,
              }}
            >
              {NAV_LINKS.map(link => (
                <motion.button
                  key={link.path}
                  variants={{
                    hidden: { opacity: 0, x: -24 },
                    show:   { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
                  }}
                  onClick={() => { navigate(link.path); setMenuOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: isActive(link.path) ? 'rgba(229,9,20,0.12)' : 'none',
                    border: isActive(link.path) ? '1px solid rgba(229,9,20,0.2)' : '1px solid transparent',
                    borderRadius: 14,
                    padding: '14px 18px',
                    cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent',
                    transition: 'background 0.2s',
                  }}
                >
                  {/* Active indicator */}
                  {isActive(link.path) && (
                    <div style={{
                      width: 4, height: 4, borderRadius: '50%',
                      background: '#e50914',
                      boxShadow: '0 0 6px rgba(229,9,20,0.5)',
                      flexShrink: 0,
                    }} />
                  )}
                  <span style={{
                    fontSize: '1.05rem',
                    fontWeight: isActive(link.path) ? 800 : 500,
                    color: isActive(link.path) ? 'white' : 'rgba(255,255,255,0.55)',
                    letterSpacing: '-0.01em',
                  }}>
                    {link.label}
                  </span>
                  {link.path === '/live-tv' && (
                    <span style={{
                      marginLeft: 'auto',
                      display: 'flex', alignItems: 'center', gap: 5,
                      fontSize: '0.6rem', fontWeight: 700,
                      color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em',
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#ef4444',
                        boxShadow: '0 0 0 2px rgba(239,68,68,0.2)',
                      }} />
                      Live
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.nav>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '0 20px' }} />

            {/* Quick links */}
            <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button
                onClick={() => { navigate('/profile'); setMenuOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '12px 16px', borderRadius: 12,
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${avatarGradient.from}, ${avatarGradient.to})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.78rem', fontWeight: 900, color: 'white',
                  overflow: 'hidden',
                }}>
                  {profile.avatarPhoto
                    ? <img src={profile.avatarPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initial}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: 700, color: 'white' }}>
                    {profile.displayName || 'My Profile'}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)' }}>
                    View & edit account
                  </p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
