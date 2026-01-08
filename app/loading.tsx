'use client'

import { Zap } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="flex flex-col items-center gap-6 relative z-10">
        {/* Logo animation */}
        <div className="relative">
          {/* Outer ring */}
          <div className="absolute inset-0 w-24 h-24 border-2 border-purple-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
          
          {/* Spinning ring */}
          <div className="w-24 h-24 relative">
            <svg className="w-full h-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="2"
                strokeDasharray="70 200"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#9333ea" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 animate-pulse">
                <Zap className="text-white" size={28} />
              </div>
            </div>
          </div>
        </div>

        {/* Brand name with gradient */}
        <div className="text-center">
          <h1 className="text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 animate-pulse">
            NEXU
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-2 tracking-widest uppercase animate-fade-in">
            Betöltés...
          </p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-purple-500 animate-bounce-subtle"
              style={{
                animationDelay: `${i * 150}ms`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
