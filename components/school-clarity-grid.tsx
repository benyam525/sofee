"use client"

import { useState, useMemo, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Users, Info, X, Filter, LayoutGrid, List, Star } from "lucide-react"

interface SchoolData {
  campusId: string
  name: string
  city: string | null
  zip: string
  district: string
  level: "ES" | "MS" | "HS"
  gradeSpan: string | null
  enrollment: number | null
  fitScore: number | null
  fitLabel: string
  academicScore: number | null
  academicLabel: string
  diversityScore: number | null
  diversityLabel: string
  demographics: { white: number | null; hispanic: number | null; asian: number | null; black: number | null; other: number | null }
  proficiency: { math: number | null; reading: number | null }
  stateRank: number | null
  stateTotal: number | null
  schoolType: string
}

interface SchoolClarityGridProps {
  schools: SchoolData[]
  isPremium?: boolean
  onUnlock?: () => void
}

const LEVEL_COLORS = {
  ES: "#22c55e",
  MS: "#3b82f6",
  HS: "#a855f7",
}

const LEVEL_LABELS = {
  ES: "Elementary",
  MS: "Middle",
  HS: "High",
}

const DEMO_CONFIG = [
  { key: "white", label: "White", color: "#60a5fa" },
  { key: "hispanic", label: "Hispanic", color: "#fbbf24" },
  { key: "black", label: "Black", color: "#a78bfa" },
  { key: "asian", label: "Asian", color: "#34d399" },
  { key: "other", label: "Other", color: "#94a3b8" },
]

const DEFAULT_FILTERS = {
  level: "all",
  schoolType: "all",
  zip: "all",
  districts: [] as string[], // Changed to array for multi-select (up to 2)
}

// Colors for comparing districts (border colors)
const DISTRICT_COLORS = [
  "#1e40af", // Blue-800
  "#b45309", // Amber-700
]

function getQuadrantLabel(academic: number, balance: number): string {
  if (academic >= 50 && balance >= 50) return "Checks Both Boxes"
  if (academic >= 50 && balance < 50) return "Great Scores, One Group Leads"
  if (academic < 50 && balance >= 50) return "Good Mix, Scores Lag"
  return "Work in Progress"
}

function getRankBadge(rank: number): { label: string; className: string } | null {
  if (rank === 1) return { label: "Best Overall Fit", className: "bg-amber-100 text-amber-700 border border-amber-300" }
  if (rank === 2 || rank === 3)
    return { label: "Great Fit", className: "bg-blue-100 text-blue-700 border border-blue-300" }
  return null
}

function getFitLabel(score: number): string {
  if (score >= 80) return "Excellent Fit"
  if (score >= 70) return "Great Fit"
  if (score >= 60) return "Good Fit"
  if (score >= 50) return "Fair Fit"
  return "Below Average Fit"
}

export function SchoolClarityGrid({ schools, isPremium = true, onUnlock }: SchoolClarityGridProps) {
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(true)
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const listDetailRef = useRef<HTMLDivElement>(null)

  const schoolsWithFit = useMemo(() => {
    return schools.map((s) => ({
      ...s,
      academicScore: s.academicScore ?? 0,
      diversityScore: s.diversityScore ?? 0,
      fitScore: s.fitScore ?? Math.round(((s.academicScore ?? 0) + (s.diversityScore ?? 0)) / 2),
      fitLabel: s.fitLabel ?? getFitLabel(Math.round(((s.academicScore ?? 0) + (s.diversityScore ?? 0)) / 2)),
    }))
  }, [schools])

  const filteredSchools = useMemo(() => {
    return schoolsWithFit.filter((s) => {
      if (filters.level !== "all" && s.level !== filters.level) return false
      if (filters.schoolType !== "all" && s.schoolType !== filters.schoolType) return false
      if (filters.zip !== "all" && s.zip !== filters.zip) return false
      // Multi-district filter: if districts selected, school must be in one of them
      if (filters.districts.length > 0 && !filters.districts.includes(s.district)) return false
      return true
    })
  }, [schoolsWithFit, filters])

  // Get district color for a school (for border)
  const getDistrictColor = (district: string): string | null => {
    if (filters.districts.length === 0) return null
    const idx = filters.districts.indexOf(district)
    return idx >= 0 ? DISTRICT_COLORS[idx] : null
  }

  const sortedSchools = useMemo(() => {
    return [...filteredSchools].sort((a, b) => {
      if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore
      if (b.academicScore !== a.academicScore) return b.academicScore - a.academicScore
      return b.diversityScore - a.diversityScore
    })
  }, [filteredSchools])

  const schoolRankings = useMemo(() => {
    const rankings: Record<string, number> = {}

    // Group schools by district + level
    const groups: Record<string, SchoolData[]> = {}
    schoolsWithFit.forEach((school) => {
      const key = `${school.district}|${school.level}`
      if (!groups[key]) groups[key] = []
      groups[key].push(school)
    })

    // Sort each group by fit score and assign ranks
    Object.values(groups).forEach((group) => {
      const sorted = [...group].sort((a, b) => {
        if ((b.fitScore ?? 0) !== (a.fitScore ?? 0)) return (b.fitScore ?? 0) - (a.fitScore ?? 0)
        if ((b.academicScore ?? 0) !== (a.academicScore ?? 0)) return (b.academicScore ?? 0) - (a.academicScore ?? 0)
        return (b.diversityScore ?? 0) - (a.diversityScore ?? 0)
      })
      sorted.forEach((school, idx) => {
        rankings[school.campusId] = idx + 1
      })
    })

    return rankings
  }, [schoolsWithFit])

  const uniqueZips = [...new Set(schoolsWithFit.map((s) => s.zip))].sort()
  const uniqueDistricts = [...new Set(schoolsWithFit.map((s) => s.district))].sort()
  const hasActiveFilters =
    filters.level !== "all" ||
    filters.schoolType !== "all" ||
    filters.zip !== "all" ||
    filters.districts.length > 0

  const resetFilters = () => setFilters({ ...DEFAULT_FILTERS, districts: [] })

  // Toggle district selection (max 2)
  const toggleDistrict = (district: string) => {
    if (filters.districts.includes(district)) {
      // Remove district
      setFilters({ ...filters, districts: filters.districts.filter((d) => d !== district) })
    } else if (filters.districts.length < 2) {
      // Add district (max 2)
      setFilters({ ...filters, districts: [...filters.districts, district] })
    }
  }

  if (!isPremium) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none opacity-50">
          <div className="h-96 bg-slate-100 rounded-xl" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Card className="p-6 text-center max-w-sm">
            <h3 className="font-semibold text-lg mb-2">Unlock School Clarity Grid</h3>
            <p className="text-sm text-slate-600 mb-4">
              See how schools balance academics with diversity in one visual.
            </p>
            <Button onClick={onUnlock}>Unlock Premium</Button>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-800">School Clarity Grid</h3>
            <p className="text-xs md:text-sm text-slate-500">Academic performance vs. demographic balance</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 ${viewMode === "grid" ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 ${viewMode === "list" ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Level</label>
              <Select value={filters.level} onValueChange={(v) => setFilters({ ...filters, level: v })}>
                <SelectTrigger className="w-full sm:w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="ES">Elementary</SelectItem>
                  <SelectItem value="MS">Middle</SelectItem>
                  <SelectItem value="HS">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">Type</label>
              <Select value={filters.schoolType} onValueChange={(v) => setFilters({ ...filters, schoolType: v })}>
                <SelectTrigger className="w-full sm:w-32 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Public">Public</SelectItem>
                  <SelectItem value="Charter">Charter</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500">ZIP Code</label>
              <Select value={filters.zip} onValueChange={(v) => setFilters({ ...filters, zip: v })}>
                <SelectTrigger className="w-full sm:w-28 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All ZIPs</SelectItem>
                  {uniqueZips.map((zip) => (
                    <SelectItem key={zip} value={zip}>
                      {zip}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 col-span-2 sm:col-span-1">
              <label className="text-xs text-slate-500">Compare Districts (up to 2)</label>
              <Select
                value={filters.districts.length === 0 ? "none" : "selected"}
                onValueChange={(v) => {
                  if (v === "none") {
                    setFilters({ ...filters, districts: [] })
                  } else if (v !== "selected") {
                    toggleDistrict(v)
                  }
                }}
              >
                <SelectTrigger className="w-full sm:w-64 h-9">
                  <span className="truncate">
                    {filters.districts.length === 0
                      ? "All Districts"
                      : filters.districts.length === 1
                        ? filters.districts[0].replace(" ISD", "")
                        : `${filters.districts[0].replace(" ISD", "")} vs ${filters.districts[1].replace(" ISD", "")}`}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">All Districts</SelectItem>
                  {uniqueDistricts.map((d) => {
                    const isSelected = filters.districts.includes(d)
                    const colorIdx = filters.districts.indexOf(d)
                    return (
                      <SelectItem
                        key={d}
                        value={d}
                        disabled={!isSelected && filters.districts.length >= 2}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <div
                              className="w-3 h-3 rounded-full border-2"
                              style={{ borderColor: DISTRICT_COLORS[colorIdx] }}
                            />
                          )}
                          <span className={isSelected ? "font-medium" : ""}>{d}</span>
                          {isSelected && <span className="text-xs text-slate-400 ml-auto">✓</span>}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-500 col-span-2 sm:col-span-1">
                <X className="w-3 h-3 mr-1" /> Reset
              </Button>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            {/* School level legend */}
            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5">
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-green-500" />
                <span className="text-slate-600">Elem</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600">Middle</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600">High</span>
              </div>
            </div>
            {/* District comparison legend (only show when comparing) */}
            {filters.districts.length > 0 && (
              <div className="flex items-center gap-3 text-xs sm:text-sm border-l border-slate-200 pl-3 sm:pl-4">
                <span className="text-slate-400 text-xs">Border:</span>
                {filters.districts.map((d, idx) => (
                  <div key={d} className="flex items-center gap-1.5">
                    <div
                      className="w-3 h-3 rounded-full bg-slate-200 border-2"
                      style={{ borderColor: DISTRICT_COLORS[idx] }}
                    />
                    <span className="text-slate-600 truncate max-w-24">{d.replace(" ISD", "")}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                <Info className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">How to read</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm text-left">
                <p className="font-semibold mb-1">How to Read the Grid</p>
                <p className="text-xs">
                  <strong>Top-Right (Green):</strong> Checks Both Boxes — high academics AND no single group dominates
                </p>
                <p className="text-xs">
                  <strong>Top-Left (Blue):</strong> Great Scores, One Group Leads — strong academics, but 60%+ one race
                </p>
                <p className="text-xs">
                  <strong>Bottom-Right (Yellow):</strong> Good Mix, Scores Lag — even mix, but test scores need work
                </p>
                <p className="text-xs">
                  <strong>Bottom-Left (Red):</strong> Work in Progress — both areas have room to grow
                </p>
              </TooltipContent>
            </Tooltip>
            <span>{sortedSchools.length} schools</span>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Grid Card */}
            <Card className="overflow-hidden bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-sm border border-white/60 shadow-xl lg:flex-1">
              <CardContent className="p-6 sm:p-8">
                {/* Grid container with axis labels */}
                <div className="flex items-stretch gap-4">
                  {/* Y-axis label */}
                  <div className="flex flex-col items-center justify-center w-8 sm:w-10">
                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium mb-auto pt-2">High</div>
                    <div className="-rotate-90 text-xs sm:text-sm text-slate-600 font-semibold whitespace-nowrap tracking-wide">
                      Academic Score
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 font-medium mt-auto pb-2">Low</div>
                  </div>

                  {/* Main grid area */}
                  <div className="flex-1 flex flex-col">
                    <div className="relative w-full aspect-square max-w-3xl mx-auto rounded-2xl overflow-hidden shadow-inner">
                      {/* Quadrant backgrounds with centered labels - liquid glass effect */}
                      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                        {/* Top-Left: Great Scores, One Group Leads (High academics, low balance) */}
                        <div className="relative bg-gradient-to-br from-blue-100/70 to-blue-50/50 backdrop-blur-sm border-r border-b border-white/40 flex items-center justify-center">
                          <div className="text-center px-2">
                            <span className="text-xs sm:text-sm text-blue-800/90 font-semibold drop-shadow-sm">
                              Great Scores,
                            </span>
                            <br />
                            <span className="text-xs sm:text-sm text-blue-800/90 font-semibold drop-shadow-sm">
                              One Group Leads
                            </span>
                          </div>
                        </div>
                        {/* Top-Right: Checks Both Boxes (High academics, high balance) */}
                        <div className="relative bg-gradient-to-bl from-green-100/70 to-green-50/50 backdrop-blur-sm border-b border-white/40 flex items-center justify-center">
                          <div className="text-center px-2">
                            <span className="text-xs sm:text-sm text-green-800/90 font-semibold drop-shadow-sm">
                              Checks
                            </span>
                            <br />
                            <span className="text-xs sm:text-sm text-green-800/90 font-semibold drop-shadow-sm">
                              Both Boxes
                            </span>
                          </div>
                        </div>
                        {/* Bottom-Left: Work in Progress (Low academics, low balance) */}
                        <div className="relative bg-gradient-to-tr from-red-100/70 to-red-50/50 backdrop-blur-sm border-r border-white/40 flex items-center justify-center">
                          <div className="text-center px-2">
                            <span className="text-xs sm:text-sm text-red-800/90 font-semibold drop-shadow-sm">
                              Work in
                            </span>
                            <br />
                            <span className="text-xs sm:text-sm text-red-800/90 font-semibold drop-shadow-sm">
                              Progress
                            </span>
                          </div>
                        </div>
                        {/* Bottom-Right: Good Mix, Test Scores Lag (Low academics, high balance) */}
                        <div className="relative bg-gradient-to-tl from-yellow-100/70 to-yellow-50/50 backdrop-blur-sm flex items-center justify-center">
                          <div className="text-center px-2">
                            <span className="text-xs sm:text-sm text-yellow-800/90 font-semibold drop-shadow-sm">
                              Good Mix,
                            </span>
                            <br />
                            <span className="text-xs sm:text-sm text-yellow-800/90 font-semibold drop-shadow-sm">
                              Scores Lag
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Center crosshair lines with glass effect */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-slate-300/60 via-slate-400/80 to-slate-300/60" />
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-slate-300/60 via-slate-400/80 to-slate-300/60" />
                      </div>

                      {/* School dots */}
                      {sortedSchools.map((school, idx) => {
                        const x = (school.diversityScore / 100) * 100
                        const y = 100 - (school.academicScore / 100) * 100
                        const jitterX = ((idx * 7) % 16) - 8
                        const jitterY = ((idx * 11) % 16) - 8
                        const districtColor = getDistrictColor(school.district)

                        return (
                          <button
                            key={school.campusId}
                            className={`absolute w-4 h-4 sm:w-5 sm:h-5 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-150 hover:z-20 ${
                              selectedSchool?.campusId === school.campusId
                                ? "ring-2 ring-offset-2 ring-slate-800 scale-150 z-20"
                                : "z-10"
                            }`}
                            style={{
                              left: `calc(${x}% + ${jitterX}px)`,
                              top: `calc(${y}% + ${jitterY}px)`,
                              backgroundColor: LEVEL_COLORS[school.level],
                              boxShadow: districtColor
                                ? `0 2px 8px rgba(0,0,0,0.15), 0 0 0 3px ${districtColor}`
                                : "0 2px 8px rgba(0,0,0,0.15), 0 0 0 2px rgba(255,255,255,0.9)",
                            }}
                            onClick={() => setSelectedSchool(school)}
                            title={`${school.name} (${school.district})`}
                          />
                        )
                      })}
                    </div>

                    {/* X-axis label */}
                    <div className="flex items-center justify-between mt-3 px-2">
                      <div className="text-[10px] sm:text-xs text-slate-500 font-medium">One Group</div>
                      <div className="text-xs sm:text-sm text-slate-600 font-semibold tracking-wide">
                        Demographic Balance
                      </div>
                      <div className="text-[10px] sm:text-xs text-slate-500 font-medium">Even Mix</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detail Card - Side panel on desktop, below on mobile */}
            {selectedSchool ? (
              <Card className="w-full lg:w-80 xl:w-96 lg:self-start bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm border border-white/60 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-amber-700">
                        Sofee Fit Score: {selectedSchool.fitScore} / 100
                      </span>
                      <span className="text-xs text-amber-600">— {selectedSchool.fitLabel}</span>
                    </div>
                    <button onClick={() => setSelectedSchool(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LEVEL_COLORS[selectedSchool.level] }}
                    />
                    <h4 className="font-semibold text-slate-800 text-lg">{selectedSchool.name}</h4>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    {selectedSchool.district} • {selectedSchool.city} {selectedSchool.zip} •{" "}
                    {LEVEL_LABELS[selectedSchool.level]} School • Grades {selectedSchool.gradeSpan}
                  </p>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">Academic Score</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-blue-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            60% state rank percentile + 40% math/reading proficiency blend
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{selectedSchool.academicScore}</div>
                      <div className="text-xs text-blue-600">{selectedSchool.academicLabel}</div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Demographic Balance</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-green-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="font-medium mb-1">What this measures:</p>
                            <p className="text-xs mb-2">How evenly the student body is split across racial groups — not whether a school is "diverse" in the traditional sense.</p>
                            <p className="text-xs"><strong>Example:</strong> A school that's 60% White and a school that's 60% Hispanic get the same score. Both have one dominant group.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{selectedSchool.diversityScore}</div>
                      <div className="text-xs text-green-600">{selectedSchool.diversityLabel}</div>
                    </div>
                  </div>

                  {/* Demographics Bar */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                      Student Demographics
                    </div>
                    <div className="flex h-5 mb-1">
                      {DEMO_CONFIG.map((demo) => {
                        const rawValue =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
                        const value = Math.round(rawValue)
                        if (value < 1) return null
                        return (
                          <div
                            key={demo.key}
                            className="flex items-end justify-center text-xs text-slate-600"
                            style={{ width: `${value}%` }}
                          >
                            {value}%
                          </div>
                        )
                      })}
                    </div>
                    <div className="h-6 rounded-lg overflow-hidden flex">
                      {DEMO_CONFIG.map((demo) => {
                        const rawValue =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
                        const value = Math.round(rawValue)
                        if (value < 1) return null
                        return (
                          <div
                            key={demo.key}
                            className="h-full"
                            style={{ width: `${value}%`, backgroundColor: demo.color }}
                          />
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {DEMO_CONFIG.map((demo) => (
                        <div key={demo.key} className="flex items-center gap-1 text-xs text-slate-500">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: demo.color }} />
                          {demo.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="w-full lg:w-80 xl:w-96 lg:self-start bg-gradient-to-br from-slate-50/90 to-white/90 backdrop-blur-sm border border-slate-200/60 shadow-md hidden lg:block">
                <CardContent className="p-5 text-center">
                  <div className="text-slate-400 mb-2">
                    <Info className="w-8 h-8 mx-auto" />
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Click a school dot</p>
                  <p className="text-xs text-slate-400 mt-1">to see Sofee's take</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <>
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-xs sm:text-sm min-w-[600px]">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-2 sm:p-3 font-medium text-slate-600">School</th>
                        <th className="text-left p-2 sm:p-3 font-medium text-slate-600 hidden sm:table-cell">District</th>
                        <th className="text-center p-2 sm:p-3 font-medium text-slate-600 whitespace-nowrap">
                          <span className="text-amber-600">Sofee's Fit</span>
                        </th>
                        <th className="text-center p-2 sm:p-3 font-medium text-slate-600">Academic</th>
                        <th className="text-center p-2 sm:p-3 font-medium text-slate-600">Balance</th>
                        <th className="text-left p-2 sm:p-3 font-medium text-slate-600 hidden md:table-cell">Quadrant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSchools.map((school) => {
                        const quadrant = getQuadrantLabel(school.academicScore, school.diversityScore)
                        const rank = schoolRankings[school.campusId]
                        const badge = getRankBadge(rank)

                        return (
                          <tr
                            key={school.campusId}
                            className={`border-b hover:bg-slate-50 cursor-pointer ${selectedSchool?.campusId === school.campusId ? "bg-blue-50" : ""}`}
                            onClick={() => {
                              setSelectedSchool(school)
                              setTimeout(() => {
                                listDetailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
                              }, 50)
                            }}
                          >
                            <td className="p-2 sm:p-3">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <div
                                  className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: LEVEL_COLORS[school.level] }}
                                />
                                <span className="font-medium text-slate-800 line-clamp-1">{school.name}</span>
                                {badge && (
                                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap hidden sm:inline ${badge.className}`}>
                                    {badge.label}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-2 sm:p-3 text-slate-600 hidden sm:table-cell">{school.district}</td>
                            <td className="p-2 sm:p-3 text-center font-semibold text-amber-600">{school.fitScore}</td>
                            <td className="p-2 sm:p-3 text-center font-semibold text-blue-600">{school.academicScore}</td>
                            <td className="p-2 sm:p-3 text-center font-semibold text-green-600">{school.diversityScore}</td>
                            <td className="p-2 sm:p-3 text-slate-600 text-xs hidden md:table-cell">{quadrant}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Detail Card - Full Width Below List */}
            {selectedSchool && (
              <Card ref={listDetailRef} className="w-full bg-gradient-to-br from-white/90 to-slate-50/90 backdrop-blur-sm border border-white/60 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="text-sm font-semibold text-amber-700">
                        Sofee Fit Score: {selectedSchool.fitScore} / 100
                      </span>
                      <span className="text-xs text-amber-600">— {selectedSchool.fitLabel}</span>
                    </div>
                    <button onClick={() => setSelectedSchool(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: LEVEL_COLORS[selectedSchool.level] }}
                    />
                    <h4 className="font-semibold text-slate-800 text-lg">{selectedSchool.name}</h4>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">
                    {selectedSchool.district} • {selectedSchool.city} {selectedSchool.zip} •{" "}
                    {LEVEL_LABELS[selectedSchool.level]} School • Grades {selectedSchool.gradeSpan}
                  </p>

                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">Academic Score</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-blue-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            60% state rank percentile + 40% math/reading proficiency blend
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{selectedSchool.academicScore}</div>
                      <div className="text-xs text-blue-600">{selectedSchool.academicLabel}</div>
                    </div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Demographic Balance</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-green-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs p-3">
                            <p className="font-medium mb-1">What this measures:</p>
                            <p className="text-xs mb-2">How evenly the student body is split across racial groups — not whether a school is "diverse" in the traditional sense.</p>
                            <p className="text-xs"><strong>Example:</strong> A school that's 60% White and a school that's 60% Hispanic get the same score. Both have one dominant group.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-2xl font-bold text-green-700">{selectedSchool.diversityScore}</div>
                      <div className="text-xs text-green-600">{selectedSchool.diversityLabel}</div>
                    </div>
                  </div>

                  {/* Demographics Bar */}
                  <div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                      Student Demographics
                    </div>
                    <div className="flex h-5 mb-1">
                      {DEMO_CONFIG.map((demo) => {
                        const rawValue =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
                        const value = Math.round(rawValue)
                        if (value < 1) return null
                        return (
                          <div
                            key={demo.key}
                            className="flex items-end justify-center text-xs text-slate-600"
                            style={{ width: `${value}%` }}
                          >
                            {value}%
                          </div>
                        )
                      })}
                    </div>
                    <div className="h-6 rounded-lg overflow-hidden flex">
                      {DEMO_CONFIG.map((demo) => {
                        const rawValue =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
                        const value = Math.round(rawValue)
                        if (value < 1) return null
                        return (
                          <div
                            key={demo.key}
                            className="h-full"
                            style={{ width: `${value}%`, backgroundColor: demo.color }}
                          />
                        )
                      })}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      {DEMO_CONFIG.map((demo) => (
                        <div key={demo.key} className="flex items-center gap-1 text-xs text-slate-500">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: demo.color }} />
                          {demo.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* How to Read Legend */}
        <Card className="bg-gradient-to-br from-blue-50/80 to-slate-50/60 backdrop-blur-sm border border-blue-100/60 shadow-md">
          <CardContent className="p-4 sm:p-5">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">Understanding the Grid</h4>
            <p className="text-xs sm:text-sm text-slate-600 mb-4">
              <strong>What "Demographic Balance" means:</strong> We measure how evenly students are distributed across racial groups — not whether a school is "diverse" in the way you might typically think. A school that's 60% White gets the same balance score as one that's 60% Hispanic. Both have one dominant group.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-green-50/60">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-green-200 to-green-100 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-green-800">Top-Right:</span>{" "}
                  <span className="text-slate-600">Checks Both Boxes — high scores AND no group dominates</span>
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-blue-50/60">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-200 to-blue-100 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-blue-800">Top-Left:</span>{" "}
                  <span className="text-slate-600">Great Scores, One Group Leads — strong academics, 60%+ one race</span>
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-yellow-50/60">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-yellow-200 to-yellow-100 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-yellow-800">Bottom-Right:</span>{" "}
                  <span className="text-slate-600">Good Mix, Scores Lag — balanced but test scores need work</span>
                </p>
              </div>
              <div className="flex items-start gap-2 p-2 rounded-lg bg-red-50/60">
                <div className="w-3 h-3 rounded bg-gradient-to-br from-red-200 to-red-100 flex-shrink-0 mt-0.5" />
                <p>
                  <span className="font-semibold text-red-800">Bottom-Left:</span>{" "}
                  <span className="text-slate-600">Work in Progress — both areas need improvement</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
