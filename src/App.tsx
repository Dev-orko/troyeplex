import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Header from './components/layout/Header'
import MobileNav from './components/layout/MobileNav'
import OptimizedHome from './pages/OptimizedHome'
import MovieDetails from './pages/MovieDetails'
import Movies from './pages/Movies'
import Series from './pages/Series'
import NewAndPopular from './pages/NewAndPopular'
import LiveTV from './pages/LiveTV'
import Profile from './pages/Profile'
import Landing from './pages/Landing'
import ErrorBoundary from './components/common/ErrorBoundary'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider, useAuth } from './contexts/FirebaseAuthContext'
import { WatchlistProvider } from './contexts/WatchlistContext'

/* ── Page transition wrapper ─────────────────────────────────────────────── */
function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.985, filter: 'blur(4px)' }}
      animate={{ opacity: 1,  scale: 1,     filter: 'blur(0px)' }}
      exit={{    opacity: 0,  scale: 1.008, filter: 'blur(3px)' }}
      transition={{
        opacity: { duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] },
        scale:   { duration: 0.48, ease: [0.25, 0.46, 0.45, 0.94] },
        filter:  { duration: 0.36, ease: 'easeOut' },
      }}
      style={{ willChange: 'opacity, transform, filter' }}
    >
      {children}
    </motion.div>
  )
}

/* ── Animated inner routes ───────────────────────────────────────────────── */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><OptimizedHome /></PageTransition>} />
          <Route path="/movies" element={<PageTransition><Movies /></PageTransition>} />
          <Route path="/series" element={<PageTransition><Series /></PageTransition>} />
          <Route path="/new-popular" element={<PageTransition><NewAndPopular /></PageTransition>} />
        <Route path="/live-tv" element={<PageTransition><LiveTV /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><Profile /></PageTransition>} />
        <Route path="/movie/:id" element={<PageTransition><MovieDetails /></PageTransition>} />
          <Route path="/tv/:id" element={<PageTransition><MovieDetails /></PageTransition>} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/welcome" element={user ? <Navigate to="/" replace /> : <Landing />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-black overflow-x-hidden antialiased">
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 pb-20 md:pb-8">
                  <AnimatedRoutes />
                </main>
                <MobileNav />
              </div>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <WatchlistProvider>
        <ErrorBoundary>
          <Router>
            <AppRoutes />
          </Router>
        </ErrorBoundary>
      </WatchlistProvider>
    </AuthProvider>
  )
}

export default App
