"use client"

import { useState } from "react"
import {
  Info,
  AlertCircle,
  BadgeCheck,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  MessageSquare,
  BarChart3,
} from "lucide-react"
import Image from "next/image"
import localReputationData from "@/data/localReputation.json"
import zipNuanceData from "@/data/zipNuance.json"

interface VotingProfile {
  zip_code: string
  city: string
  primary_counties: string[]
  is_multi_county: boolean
  presidential_2020: {
    dem_share: number
    rep_share: number
    lean_label: string
    data_scope: string
  }
  governor_2022: {
    dem_share: number
    rep_share: number
    lean_label: string
    data_scope: string
  }
  overall_lean: string
  political_spectrum: {
    margin: number
    label: string
    side: "Republican" | "Democratic" | "Mixed"
    intensity: "Far" | "Lean" | "Slight" | "None"
  }
  trend: {
    direction: "more_dem" | "more_rep" | "stable"
    shift_points: number
    description: string
  }
}

interface LocalReputation {
  city: string
  short_tag: string
  local_reputation: string
}

interface CivicProfileProps {
  data: VotingProfile | null
  isLoading?: boolean
}

const SPECTRUM_SEGMENTS = [
  { key: "Far Democratic", label: "Far D", color: "bg-blue-600" },
  { key: "Lean Democratic", label: "Lean D", color: "bg-blue-400" },
  { key: "Slight Democratic", label: "Slight D", color: "bg-blue-200" },
  { key: "Politically Mixed", label: "Mixed", color: "bg-slate-300" },
  { key: "Slight Republican", label: "Slight R", color: "bg-red-200" },
  { key: "Lean Republican", label: "Lean R", color: "bg-red-400" },
  { key: "Far Republican", label: "Far R", color: "bg-red-600" },
]

type ViewMode = "voting" | "reputation"

function getZipNuance(zip: string): string | null {
  const meta = (zipNuanceData as Record<string, { needs_nuance: boolean; nuance_copy?: string }>)[zip]
  if (!meta || !meta.needs_nuance) return null
  return meta.nuance_copy || null
}

export function CivicProfile({ data, isLoading }: CivicProfileProps) {
  const [showLeanInfo, setShowLeanInfo] = useState(false)
  const [showSpectrumInfo, setShowSpectrumInfo] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>("voting")

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-muted rounded w-1/3" />
        <div className="h-24 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
        <div className="h-32 bg-muted rounded" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No civic data available for this ZIP code.</p>
        <p className="text-sm text-muted-foreground mt-2">This ZIP may not be in Sofee's coverage area.</p>
      </div>
    )
  }

  const {
    zip_code,
    city,
    primary_counties,
    is_multi_county,
    presidential_2020,
    governor_2022,
    political_spectrum,
    trend,
  } = data

  const reputation = (localReputationData as Record<string, LocalReputation>)[zip_code]
  const hasReputation = !!reputation

  const nuanceCopy = getZipNuance(zip_code)

  const getLeanBgColor = (side: string) => {
    if (side === "Democratic") return "bg-blue-50/60 border-blue-100"
    if (side === "Republican") return "bg-red-50/60 border-red-100"
    return "bg-slate-50 border-slate-200"
  }

  const getLeanTextColor = (side: string) => {
    if (side === "Democratic") return "text-blue-700"
    if (side === "Republican") return "text-red-700"
    return "text-slate-700"
  }

  const getTrendIcon = () => {
    if (trend.direction === "more_dem") return <TrendingUp className="h-4 w-4 text-blue-600" />
    if (trend.direction === "more_rep") return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-slate-500" />
  }

  const getTrendColor = () => {
    if (trend.direction === "more_dem") return "text-blue-600 bg-blue-50"
    if (trend.direction === "more_rep") return "text-red-600 bg-red-50"
    return "text-slate-600 bg-slate-50"
  }

  const countiesDisplay = primary_counties.join(" & ")
  const activeSegmentIndex = SPECTRUM_SEGMENTS.findIndex((s) => s.key === political_spectrum.label)

  const getTagColor = (tag: string) => {
    const lowerTag = tag.toLowerCase()
    if (lowerTag.includes("conservative") || lowerTag.includes("right")) {
      return "bg-red-100 text-red-800 border-red-200"
    }
    if (
      lowerTag.includes("diverse") ||
      lowerTag.includes("mixed") ||
      lowerTag.includes("balanced") ||
      lowerTag.includes("moderate")
    ) {
      return "bg-purple-100 text-purple-800 border-purple-200"
    }
    if (lowerTag.includes("progressive") || lowerTag.includes("left") || lowerTag.includes("democratic")) {
      return "bg-blue-100 text-blue-800 border-blue-200"
    }
    return "bg-slate-100 text-slate-800 border-slate-200"
  }

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-slate-900">Civic Profile</h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Local voting patterns for {city}, TX {zip_code}
          </p>
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Based on the latest certified election results.</p>
        </div>
        <Image src="/sofee-logo.png" alt="Sofee" width={48} height={48} className="opacity-60 w-8 h-8 sm:w-12 sm:h-12" />
      </div>

      {/* Single/Multi County Badge */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full ${
            is_multi_county
              ? "bg-amber-50 text-amber-700 border border-amber-200"
              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
          }`}
        >
          <MapPin className="h-3 w-3" />
          {is_multi_county
            ? `Multi-county (${countiesDisplay})`
            : `${primary_counties[0]} County`}
        </span>
      </div>

      {hasReputation && (
        <div className="flex justify-center">
          <div className="inline-flex rounded-full p-0.5 sm:p-1 bg-slate-100 border border-slate-200">
            <button
              onClick={() => setViewMode("voting")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                viewMode === "voting" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Voting Data</span>
              <span className="sm:hidden">Voting</span>
            </button>
            <button
              onClick={() => setViewMode("reputation")}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                viewMode === "reputation" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Local Reputation</span>
              <span className="sm:hidden">Reputation</span>
            </button>
          </div>
        </div>
      )}

      {viewMode === "voting" && (
        <>
          <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-6 border ${getLeanBgColor(political_spectrum.side)}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-semibold text-slate-900">Overall Political Lean</h3>
                <button
                  onClick={() => setShowSpectrumInfo(!showSpectrumInfo)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="How is this calculated?"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              {/* Trend Badge */}
              <div
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium w-fit ${getTrendColor()}`}
              >
                {getTrendIcon()}
                <span>{trend.description}</span>
              </div>
            </div>

            {/* Spectrum Label */}
            <p className={`text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 ${getLeanTextColor(political_spectrum.side)}`}>
              {political_spectrum.label}
            </p>

            {/* 7-Segment Spectrum Bar */}
            <div className="space-y-2">
              <div className="flex h-2.5 sm:h-3 rounded-full overflow-hidden">
                {SPECTRUM_SEGMENTS.map((segment, idx) => (
                  <div
                    key={segment.key}
                    className={`flex-1 ${segment.color} ${idx === activeSegmentIndex ? "ring-2 ring-slate-900 ring-offset-1 z-10" : "opacity-50"} transition-all`}
                  />
                ))}
              </div>
              {/* Segment Labels - hide some on mobile */}
              <div className="flex justify-between text-[8px] sm:text-[10px] text-slate-500 px-0.5 sm:px-1">
                {SPECTRUM_SEGMENTS.map((segment, idx) => (
                  <span
                    key={segment.key}
                    className={`${idx === activeSegmentIndex ? "font-semibold text-slate-900" : ""} ${idx !== 0 && idx !== 3 && idx !== 6 ? "hidden sm:inline" : ""}`}
                  >
                    {segment.label}
                  </span>
                ))}
              </div>
              {/* Marker indicator */}
              <div className="relative h-3 sm:h-4 mt-1">
                <div
                  className="absolute w-2.5 sm:w-3 h-2.5 sm:h-3 bg-slate-900 rounded-full transform -translate-x-1/2 transition-all duration-300"
                  style={{ left: `${((activeSegmentIndex + 0.5) / SPECTRUM_SEGMENTS.length) * 100}%` }}
                />
              </div>
            </div>

            {showSpectrumInfo && (
              <div className="mt-4 text-sm text-slate-600 bg-white/80 rounded-lg p-4 border border-slate-200">
                <p>
                  Sofee Political Spectrum describes the general voting pattern of this ZIP. It's not a rating — just a
                  neutral summary of recent election results.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Calculated using 70% Presidential (2020) + 30% Governor (2022) results.
                </p>
              </div>
            )}

            {nuanceCopy && (
              <div className="mt-5 bg-white/90 rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Info className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Sofee's Take</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{nuanceCopy}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2020 Presidential */}
          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-medium text-slate-900">2020 Presidential</h3>
                <button
                  onClick={() => setShowLeanInfo(!showLeanInfo)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="How is this calculated?"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 bg-white px-2 py-0.5 sm:py-1 rounded-full border border-slate-200 w-fit">
                {presidential_2020.data_scope}
              </span>
            </div>

            {showLeanInfo && (
              <div className="text-sm text-slate-600 bg-white rounded-lg p-4 border border-slate-200 space-y-3">
                <p className="font-medium text-slate-800">How Political Lean is Calculated</p>
                <p>
                  {is_multi_county
                    ? `This ZIP code spans multiple counties (${countiesDisplay}). Results are weighted by approximate population distribution within each county.`
                    : `Results are from certified ${primary_counties[0]} County election data.`}
                </p>
                <div className="bg-slate-50 rounded p-2 text-xs font-mono">
                  <p>• Dem share - Rep share ≥ 10% → "Leans Democratic"</p>
                  <p>• Rep share - Dem share ≥ 10% → "Leans Republican"</p>
                  <p>• Otherwise → "Politically Mixed"</p>
                </div>
                <p className="text-xs text-slate-500 italic">
                  Note: Texas does not register voters by party. These percentages reflect actual election results, not
                  party registration.
                </p>
              </div>
            )}

            {/* Lean Bar */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="h-6 sm:h-8 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500"
                  style={{ width: `${presidential_2020.dem_share * 100}%` }}
                >
                  {presidential_2020.dem_share >= 0.15 && (
                    <span className="text-[10px] sm:text-xs font-medium text-white">
                      {Math.round(presidential_2020.dem_share * 100)}%
                    </span>
                  )}
                </div>
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-start pl-2 sm:pl-3 transition-all duration-500"
                  style={{ width: `${presidential_2020.rep_share * 100}%` }}
                >
                  {presidential_2020.rep_share >= 0.15 && (
                    <span className="text-[10px] sm:text-xs font-medium text-white">
                      {Math.round(presidential_2020.rep_share * 100)}%
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 text-center">
                {presidential_2020.lean_label} — {Math.round(presidential_2020.dem_share * 100)}% vs{" "}
                {Math.round(presidential_2020.rep_share * 100)}%
              </p>
            </div>
          </div>

          {/* 2022 Governor */}
          <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base sm:text-lg font-medium text-slate-900">2022 Governor</h3>
              <span className="text-[10px] sm:text-xs text-slate-500 bg-white px-2 py-0.5 sm:py-1 rounded-full border border-slate-200 w-fit">
                {governor_2022.data_scope}
              </span>
            </div>

            {/* Lean Bar */}
            <div className="space-y-1.5 sm:space-y-2">
              <div className="h-6 sm:h-8 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end pr-2 sm:pr-3 transition-all duration-500"
                  style={{ width: `${governor_2022.dem_share * 100}%` }}
                >
                  {governor_2022.dem_share >= 0.15 && (
                    <span className="text-[10px] sm:text-xs font-medium text-white">{Math.round(governor_2022.dem_share * 100)}%</span>
                  )}
                </div>
                <div
                  className="bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-start pl-2 sm:pl-3 transition-all duration-500"
                  style={{ width: `${governor_2022.rep_share * 100}%` }}
                >
                  {governor_2022.rep_share >= 0.15 && (
                    <span className="text-[10px] sm:text-xs font-medium text-white">{Math.round(governor_2022.rep_share * 100)}%</span>
                  )}
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 text-center">
                {governor_2022.lean_label} — {Math.round(governor_2022.dem_share * 100)}% vs{" "}
                {Math.round(governor_2022.rep_share * 100)}%
              </p>
            </div>
          </div>
        </>
      )}

      {viewMode === "reputation" && reputation && (
        <div className="rounded-2xl p-6 border border-slate-200 bg-gradient-to-br from-white to-slate-50">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Local Reputation</h3>
          </div>

          {/* Short Tag Badge */}
          <span
            className={`inline-block px-3 py-1.5 rounded-full text-sm font-medium border mb-4 ${getTagColor(reputation.short_tag)}`}
          >
            {reputation.short_tag}
          </span>

          {/* Reputation Text */}
          <p className="text-slate-700 leading-relaxed text-base mb-6">"{reputation.local_reputation}"</p>

          {/* Disclaimer */}
          <div className="text-xs text-slate-400 pt-4 border-t border-slate-100">
            <p>
              Local Reputation reflects how residents and families commonly describe this area. It complements, but does
              not replace, the election data.
            </p>
          </div>
        </div>
      )}

      {/* Data Transparency Footer */}
      <div className="text-xs text-slate-400 text-center pt-4 border-t border-slate-100 space-y-2">
        <p className="flex items-center justify-center gap-1">
          <BadgeCheck className="h-3 w-3" />
          {viewMode === "voting"
            ? "Source: Texas Secretary of State — Elections Division"
            : "Source: Local community insights and resident feedback"}
        </p>
        {viewMode === "voting" && (
          <>
            <p className="text-slate-300 max-w-lg mx-auto">
              ZIP-level political lean is calculated using official election results from the counties that overlap this
              ZIP. {is_multi_county && "This ZIP crosses county boundaries and uses weighted blended results."}
            </p>
            <p className="text-slate-300">
              Texas does not register voters by party. Results reflect actual votes cast.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
