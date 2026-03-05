import React from 'react'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div
        className="h-14 w-14 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: '#e50914 transparent transparent transparent' }}
      />
    </div>
  )
}
