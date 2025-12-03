"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraduationCap, Users, Info, X, Filter, LayoutGrid, List, Star } from "lucide-react"

interface SchoolData {
  campusId: number
  name: string
  city: string
  zip: string
  district: string
  level: "ES" | "MS" | "HS"
  gradeSpan: string
  enrollment: number
  fitScore: number
  fitLabel: string
  academicScore: number
  academicLabel: string
  diversityScore: number
  diversityLabel: string
  demographics: { white: number; hispanic: number; asian: number; black: number; other: number }
  proficiency: { math: number; reading: number }
  stateRank: number
  stateTotal: number
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
  district: "all",
}

function getQuadrantLabel(academic: number, diversity: number): string {
  if (academic >= 50 && diversity >= 50) return "Balanced & Strong"
  if (academic >= 50 && diversity < 50) return "Strong, Less Diverse"
  if (academic < 50 && diversity >= 50) return "Diverse, Lower Performing"
  return "Needs Improvement"
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

  const schoolsWithFit = useMemo(() => {
    return schools.map((s) => ({
      ...s,
      fitScore: s.fitScore ?? Math.round((s.academicScore + s.diversityScore) / 2),
      fitLabel: s.fitLabel ?? getFitLabel(Math.round((s.academicScore + s.diversityScore) / 2)),
    }))
  }, [schools])

  const filteredSchools = useMemo(() => {
    return schoolsWithFit.filter((s) => {
      if (filters.level !== "all" && s.level !== filters.level) return false
      if (filters.schoolType !== "all" && s.schoolType !== filters.schoolType) return false
      if (filters.zip !== "all" && s.zip !== filters.zip) return false
      if (filters.district !== "all" && s.district !== filters.district) return false
      return true
    })
  }, [schoolsWithFit, filters])

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
        if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore
        if (b.academicScore !== a.academicScore) return b.academicScore - a.academicScore
        return b.diversityScore - a.diversityScore
      })
      sorted.forEach((school, idx) => {
        rankings[school.campusId] = idx + 1
      })
    })

    return rankings
  }, [schoolsWithFit])

  const uniqueZips = [...new Set(schoolsWithFit.map((s) => s.zip))].sort()
  const uniqueDistricts = [...new Set(schoolsWithFit.map((s) => s.district))].sort()
  const hasActiveFilters = Object.entries(filters).some(([_, v]) => v !== "all")

  const resetFilters = () => setFilters(DEFAULT_FILTERS)

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
            <p className="text-xs md:text-sm text-slate-500">Academic performance vs. diversity balance</p>
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
            <div className="space-y-1">
              <label className="text-xs text-slate-500">District</label>
              <Select value={filters.district} onValueChange={(v) => setFilters({ ...filters, district: v })}>
                <SelectTrigger className="w-full sm:w-56 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Districts</SelectItem>
                  {uniqueDistricts.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
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
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
            <Tooltip>
              <TooltipTrigger className="flex items-center gap-1 cursor-help">
                <Info className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">How to read</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm text-left">
                <p className="font-semibold mb-1">How to Read the Grid</p>
                <p className="text-xs">
                  <strong>Top-Right (Green):</strong> Balanced & Strong — high academics AND diverse student body
                </p>
                <p className="text-xs">
                  <strong>Top-Left (Yellow):</strong> Diverse but Lower Performing — diverse, but academics need work
                </p>
                <p className="text-xs">
                  <strong>Bottom-Right (Blue):</strong> Strong but Less Diverse — great scores, but one group dominates
                </p>
                <p className="text-xs">
                  <strong>Bottom-Left (Red):</strong> Needs Improvement — both areas have room to grow
                </p>
              </TooltipContent>
            </Tooltip>
            <span>{sortedSchools.length} schools</span>
          </div>
        </div>

        {/* Grid View */}
        {viewMode === "grid" && (
          <div className="flex flex-col gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="relative aspect-square max-w-lg mx-auto">
                  {/* Quadrant backgrounds */}
                  <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                    <div className="bg-yellow-100/50" />
                    <div className="bg-green-100/50" />
                    <div className="bg-red-100/50" />
                    <div className="bg-blue-100/50" />
                  </div>

                  {/* Axis labels */}
                  <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-slate-500 whitespace-nowrap">
                    Academic Score →
                  </div>
                  <div className="absolute bottom-[-24px] left-1/2 -translate-x-1/2 text-xs text-slate-500">
                    Diversity Score →
                  </div>

                  {/* School dots */}
                  {sortedSchools.map((school) => {
                    const x = (school.diversityScore / 100) * 100
                    const y = 100 - (school.academicScore / 100) * 100
                    const jitterX = ((school.campusId * 7) % 16) - 8
                    const jitterY = ((school.campusId * 11) % 16) - 8

                    return (
                      <button
                        key={school.campusId}
                        className={`absolute w-4 h-4 rounded-full transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-150 hover:z-10 ${
                          selectedSchool?.campusId === school.campusId
                            ? "ring-2 ring-offset-1 ring-slate-800 scale-150 z-10"
                            : ""
                        }`}
                        style={{
                          left: `calc(${x}% + ${jitterX}px)`,
                          top: `calc(${y}% + ${jitterY}px)`,
                          backgroundColor: LEVEL_COLORS[school.level],
                          boxShadow: "0 0 0 2px white",
                        }}
                        onClick={() => setSelectedSchool(school)}
                        title={school.name}
                      />
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Detail Card - Full Width Below Grid */}
            {selectedSchool && (
              <Card className="w-full">
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
                        <span className="text-xs text-green-600 font-medium">Diversity Score</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-green-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Entropy-based balance + dominance penalty (0 if any group &gt;80%)
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
                        const value =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
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
                        const value =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
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
                        <th className="text-center p-2 sm:p-3 font-medium text-slate-600">Diversity</th>
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
                            onClick={() => setSelectedSchool(school)}
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
              <Card className="w-full">
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
                        <span className="text-xs text-green-600 font-medium">Diversity Score</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="w-3 h-3 text-green-400" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            Entropy-based balance + dominance penalty (0 if any group &gt;80%)
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
                        const value =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
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
                        const value =
                          selectedSchool.demographics[demo.key as keyof typeof selectedSchool.demographics] || 0
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
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-3 sm:p-4">
            <h4 className="font-medium text-blue-800 mb-2 text-sm sm:text-base">How to Read the Grid</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
              <p>
                <span className="font-semibold text-green-700">Top-Right:</span>{" "}
                <span className="text-slate-600">Balanced & Strong</span>
              </p>
              <p>
                <span className="font-semibold text-yellow-700">Top-Left:</span>{" "}
                <span className="text-slate-600">Diverse but Lower Performing</span>
              </p>
              <p>
                <span className="font-semibold text-blue-700">Bottom-Right:</span>{" "}
                <span className="text-slate-600">Strong but Less Diverse</span>
              </p>
              <p>
                <span className="font-semibold text-red-700">Bottom-Left:</span>{" "}
                <span className="text-slate-600">Needs Improvement</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
