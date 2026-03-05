import React from 'react'
import { FiRadio, FiTv } from 'react-icons/fi'

const CHANNELS = [
  { name: 'BBC World News', genre: 'News', color: '#B00000' },
  { name: 'CNN International', genre: 'News', color: '#CC0000' },
  { name: 'ESPN', genre: 'Sports', color: '#007A33' },
  { name: 'Discovery Channel', genre: 'Documentary', color: '#006FB9' },
  { name: 'National Geographic', genre: 'Documentary', color: '#FFB800' },
  { name: 'MTV', genre: 'Music', color: '#00A86B' },
  { name: 'Cartoon Network', genre: 'Animation', color: '#000000' },
  { name: 'HBO', genre: 'Premium', color: '#4A0F6D' },
]

export default function LiveTV() {
  return (
    <div className="min-h-screen bg-black text-white pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-8 md:px-12 py-8">
        <div className="mb-8 flex items-center gap-3">
          <FiRadio className="h-8 w-8" style={{ color: '#e50914' }} />
          <div>
            <h1 className="text-3xl font-black text-white sm:text-4xl">Live TV</h1>
            <p className="text-sm text-gray-400">Stream live channels from around the world</p>
          </div>
          <span className="ml-3 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
            style={{ background: 'rgba(229,9,20,0.2)', border: '1px solid rgba(229,9,20,0.3)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CHANNELS.map((channel, i) => (
            <div key={i}
              className="group relative cursor-pointer overflow-hidden rounded-2xl transition-all hover:-translate-y-1 hover:shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex aspect-video items-center justify-center" style={{ background: channel.color + '33' }}>
                <FiTv className="h-12 w-12 opacity-40" />
              </div>
              <div className="p-4">
                <div className="mb-1 flex items-center justify-between">
                  <h3 className="font-bold text-white">{channel.name}</h3>
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                </div>
                <p className="text-xs text-gray-500">{channel.genre}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center gap-4 rounded-2xl p-12 text-center"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <FiRadio className="h-16 w-16 text-gray-600" />
          <h2 className="text-2xl font-bold text-white">More Channels Coming Soon</h2>
          <p className="max-w-md text-gray-500">
            We&apos;re adding more live TV channels. Stay tuned for sports, news, entertainment, and more.
          </p>
        </div>
      </div>
    </div>
  )
}
