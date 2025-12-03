"use client"

import { useState } from "react"
import { User, Lock, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import zipPersonasData from "@/data/zipPersonas.json"

interface ZipPersonaInsightProps {
  zipCode: string
  isPremium?: boolean
  onUnlock?: () => void
}

interface PersonaData {
  bestFor: string
  honestTake: string
}

const zipPersonas = zipPersonasData as Record<string, PersonaData>

export function ZipPersonaInsight({ zipCode, isPremium = false, onUnlock }: ZipPersonaInsightProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const persona = zipPersonas[zipCode]

  if (!persona) {
    return null
  }

  // Teaser view (non-premium)
  if (!isPremium) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none opacity-50">
          <Card className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-4 w-4 text-slate-500" />
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-slate-200 rounded w-48" />
                <div className="h-3 bg-slate-200 rounded w-64" />
                <div className="h-3 bg-slate-200 rounded w-56" />
              </div>
            </div>
          </Card>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="p-4 text-center max-w-xs bg-white/95 backdrop-blur-sm shadow-lg">
            <Lock className="h-5 w-5 text-slate-400 mx-auto mb-2" />
            <h3 className="font-semibold text-sm mb-1">Unlock Honest Take</h3>
            <p className="text-xs text-slate-600 mb-3">See who this ZIP is really best for — no sugarcoating.</p>
            <Button size="sm" onClick={onUnlock} className="w-full">
              Unlock Premium
            </Button>
          </Card>
        </div>
      </div>
    )
  }

  // Full premium view
  return (
    <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white to-slate-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-slate-900">Honest Take</h3>
            <p className="text-xs text-slate-500">Sofee's unfiltered perspective on {zipCode}</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-slate-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          {/* Best For */}
          <div className="pl-11">
            <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide mb-1">Best For</p>
            <p className="text-sm text-slate-700 leading-relaxed">{persona.bestFor}</p>
          </div>

          {/* Honest Take */}
          <div className="pl-11">
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">The Real Talk</p>
            <p className="text-sm text-slate-700 leading-relaxed italic">"{persona.honestTake}"</p>
          </div>

          {/* Disclaimer */}
          <div className="pl-11 pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400">
              Based on actual data: pricing, school scores, safety ratings, diversity index, and amenity counts. Not
              vibes — just honest analysis.
            </p>
          </div>
        </div>
      )}
    </Card>
  )
}

// Compact teaser version for inline use in results - Premium styled
export function ZipPersonaTeaser({ zipCode }: { zipCode: string }) {
  const router = useRouter()
  const persona = zipPersonas[zipCode]

  if (!persona) {
    return null
  }

  const handleClick = () => {
    router.push(`/zip-identity?zip=${zipCode}`)
  }

  return (
    <div className="mt-4 p-4 md:p-5 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 rounded-xl md:rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start gap-3 md:gap-4">
        <div className="flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center shadow-sm">
          <User className="h-4 w-4 md:h-5 md:w-5 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm md:text-base font-semibold text-slate-800 mb-1">Who is this ZIP for?</p>
          <p className="text-xs md:text-sm text-slate-600 leading-relaxed line-clamp-2">{persona.bestFor}</p>
          <button
            onClick={handleClick}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-full shadow-sm hover:shadow-md transition-all duration-200"
          >
            <Lock className="h-3 w-3 md:h-3.5 md:w-3.5" />
            See honest take
          </button>
        </div>
      </div>
    </div>
  )
}
