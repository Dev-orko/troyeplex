import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/FirebaseAuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div
          className="h-14 w-14 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: '#e50914 transparent transparent transparent' }}
        />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/welcome" replace />
  }

  return <>{children}</>
}
