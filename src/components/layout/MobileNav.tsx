import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiHome, FiFilm, FiTv, FiTrendingUp, FiRadio } from 'react-icons/fi'

const NAV_ITEMS = [
  { icon: FiHome,       label: 'Home',    path: '/' },
  { icon: FiFilm,       label: 'Movies',  path: '/movies' },
  { icon: FiTv,         label: 'Series',  path: '/series' },
  { icon: FiTrendingUp, label: 'Popular', path: '/new-popular' },
  { icon: FiRadio,      label: 'Live TV', path: '/live-tv' },
]

const MobileNav = () => {
  const navigate  = useNavigate()
  const { pathname } = useLocation()

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
        background: 'rgba(8,8,8,0.97)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 -12px 40px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex items-stretch justify-around px-1 py-1">
        {NAV_ITEMS.map(item => {
          const active = pathname === item.path
          const Icon = item.icon
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className="relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 transition-colors active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-1 rounded-xl"
                    style={{ background: 'rgba(229,9,20,0.15)' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </AnimatePresence>

              {item.path === '/live-tv' && (
                <span className="absolute right-3 top-2 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
              )}

              <motion.div
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ duration: 0.2, type: 'spring', stiffness: 400 }}
              >
                <Icon
                  size={21}
                  strokeWidth={active ? 2.5 : 1.8}
                  color={active ? '#e50914' : '#737373'}
                />
              </motion.div>

              <span
                className="relative text-[10px] font-semibold"
                style={{ color: active ? '#e50914' : '#737373' }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </motion.nav>
  )
}

export default MobileNav
