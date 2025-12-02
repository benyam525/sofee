"use client"

import { useEffect, useState } from "react"

const loadingMessages = ["Crunching the zip codes...", "Weighing your priorities...", "Finding your best suburb..."]

export function SofeeThinkingLoader() {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      {/* Sofee thinking image with subtle bounce */}
      <div className="relative mb-8 animate-bounce-subtle">
        <img src="/sofee-thinking.png" alt="Sofee thinking" className="w-64 h-auto md:w-80 drop-shadow-xl" />
      </div>

      {/* Loading message with fade transition */}
      <div className="text-center">
        <p className="text-2xl md:text-3xl font-medium text-primary italic transition-opacity duration-500">
          {loadingMessages[messageIndex]}
        </p>

        {/* Subtle progress dots */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i === messageIndex ? "bg-primary scale-125" : "bg-primary/30"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card-strong rounded-[1.75rem] p-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-32 bg-white/40 rounded-xl" />
            <div className="h-6 w-24 bg-white/40 rounded-full" />
          </div>

          <div className="space-y-3 mb-5">
            <div className="h-4 w-full bg-white/40 rounded-lg" />
            <div className="h-4 w-3/4 bg-white/40 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-16 bg-white/40 rounded" />
                <div className="h-5 w-12 bg-white/40 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
