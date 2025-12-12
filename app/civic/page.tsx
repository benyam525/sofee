"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { CivicProfile } from "@/components/civic-profile"
import { Search, X, Table, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ZIP_CITY_MAP: Record<string, string> = {
  // Allen
  "75002": "Allen",
  "75013": "Allen",
  // Carrollton
  "75006": "Carrollton",
  "75007": "Carrollton",
  "75010": "Carrollton",
  // Celina
  "75009": "Celina",
  // Coppell
  "75019": "Coppell",
  // Flower Mound
  "75022": "Flower Mound",
  "75028": "Flower Mound",
  // Plano
  "75023": "Plano",
  "75024": "Plano",
  "75025": "Plano",
  "75074": "Plano",
  "75075": "Plano",
  "75093": "Plano",
  // Frisco
  "75034": "Frisco",
  "75035": "Frisco",
  // Irving
  "75038": "Irving",
  "75039": "Irving",
  "75062": "Irving",
  // Grand Prairie
  "75052": "Grand Prairie",
  // Lewisville
  "75067": "Lewisville",
  "75077": "Lewisville",
  // McKinney
  "75069": "McKinney",
  "75070": "McKinney",
  "75071": "McKinney",
  "75072": "McKinney",
  // Prosper
  "75078": "Prosper",
  // Richardson
  "75080": "Richardson",
  "75081": "Richardson",
  "75082": "Richardson",
  // Farmers Branch
  "75234": "Farmers Branch",
  "75244": "Farmers Branch",
  // Colleyville
  "76034": "Colleyville",
  // Southlake
  "76092": "Southlake",
}

const CITY_TO_ZIPS: Record<string, string[]> = {}
Object.entries(ZIP_CITY_MAP).forEach(([zip, city]) => {
  const cityLower = city.toLowerCase()
  if (!CITY_TO_ZIPS[cityLower]) CITY_TO_ZIPS[cityLower] = []
  CITY_TO_ZIPS[cityLower].push(zip)
})

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

function ComparisonCard({ data, onRemove }: { data: VotingProfile; onRemove: () => void }) {
  const getSpectrumPillColor = (side: string) => {
    if (side === "Democratic") return "bg-blue-100 text-blue-700 border-blue-200"
    if (side === "Republican") return "bg-red-100 text-red-700 border-red-200"
    return "bg-slate-100 text-slate-700 border-slate-200"
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 relative">
      <button
        onClick={onRemove}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>

      {/* City + ZIP */}
      <h4 className="font-semibold text-slate-900 text-lg">
        {data.city}, {data.zip_code}
      </h4>

      {/* County Badge */}
      <p className="text-xs text-slate-500 mt-1">
        {data.is_multi_county
          ? `Multi-county (${data.primary_counties.join(" & ")})`
          : `${data.primary_counties[0]} County`}
      </p>

      {/* Political Spectrum Label */}
      <div className="mt-4">
        <span
          className={`inline-block text-sm font-medium px-3 py-1 rounded-full border ${getSpectrumPillColor(data.political_spectrum.side)}`}
        >
          {data.political_spectrum.label}
        </span>
      </div>

      {/* Election Results */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">2020 Presidential</span>
          <span className="font-medium">
            <span className="text-blue-600">{Math.round(data.presidential_2020.dem_share * 100)}%</span>
            {" / "}
            <span className="text-red-600">{Math.round(data.presidential_2020.rep_share * 100)}%</span>
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">2022 Governor</span>
          <span className="font-medium">
            <span className="text-blue-600">{Math.round(data.governor_2022.dem_share * 100)}%</span>
            {" / "}
            <span className="text-red-600">{Math.round(data.governor_2022.rep_share * 100)}%</span>
          </span>
        </div>
      </div>
    </div>
  )
}

type SortKey = "city" | "lean" | "pres2020" | "gov2022" | "trend"
type SortDir = "asc" | "desc"

function AllZipsTable({
  data,
  onSelectZip,
  sortKey,
  sortDir,
  onSort,
}: {
  data: VotingProfile[]
  onSelectZip: (zip: string) => void
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
}) {
  const getSpectrumPillColor = (side: string) => {
    if (side === "Democratic") return "bg-blue-100 text-blue-700"
    if (side === "Republican") return "bg-red-100 text-red-700"
    return "bg-slate-100 text-slate-700"
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />
    return sortDir === "asc" ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            <th
              className="text-left py-3 px-4 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("city")}
            >
              <span className="flex items-center">
                Location <SortIcon column="city" />
              </span>
            </th>
            <th className="text-left py-3 px-4 font-semibold text-slate-900">County</th>
            <th
              className="text-left py-3 px-4 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("lean")}
            >
              <span className="flex items-center">
                Political Lean <SortIcon column="lean" />
              </span>
            </th>
            <th
              className="text-center py-3 px-4 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("pres2020")}
            >
              <span className="flex items-center justify-center">
                2020 Pres. <SortIcon column="pres2020" />
              </span>
            </th>
            <th
              className="text-center py-3 px-4 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("gov2022")}
            >
              <span className="flex items-center justify-center">
                2022 Gov. <SortIcon column="gov2022" />
              </span>
            </th>
            <th
              className="text-center py-3 px-4 font-semibold text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => onSort("trend")}
            >
              <span className="flex items-center justify-center">
                Trend <SortIcon column="trend" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((profile) => (
            <tr
              key={profile.zip_code}
              className="border-b border-slate-100 hover:bg-primary/5 cursor-pointer transition-colors"
              onClick={() => onSelectZip(profile.zip_code)}
            >
              <td className="py-3 px-4">
                <span className="font-medium text-slate-900">{profile.city}</span>
                <span className="text-slate-500 ml-1">{profile.zip_code}</span>
              </td>
              <td className="py-3 px-4 text-slate-600">
                {profile.is_multi_county ? profile.primary_counties.join(" / ") : profile.primary_counties[0]}
              </td>
              <td className="py-3 px-4">
                <span
                  className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${getSpectrumPillColor(profile.political_spectrum.side)}`}
                >
                  {profile.political_spectrum.label}
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="text-blue-600 font-medium">
                  {Math.round(profile.presidential_2020.dem_share * 100)}%
                </span>
                <span className="text-slate-400 mx-1">/</span>
                <span className="text-red-600 font-medium">
                  {Math.round(profile.presidential_2020.rep_share * 100)}%
                </span>
              </td>
              <td className="py-3 px-4 text-center">
                <span className="text-blue-600 font-medium">{Math.round(profile.governor_2022.dem_share * 100)}%</span>
                <span className="text-slate-400 mx-1">/</span>
                <span className="text-red-600 font-medium">{Math.round(profile.governor_2022.rep_share * 100)}%</span>
              </td>
              <td className="py-3 px-4 text-center">
                <span
                  className={`text-xs ${
                    profile.trend.direction === "more_dem"
                      ? "text-blue-600"
                      : profile.trend.direction === "more_rep"
                        ? "text-red-600"
                        : "text-slate-500"
                  }`}
                >
                  {profile.trend.direction === "stable"
                    ? "Stable"
                    : `${profile.trend.direction === "more_dem" ? "+" : "-"}${profile.trend.shift_points.toFixed(1)}pts`}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CivicContent() {
  const searchParams = useSearchParams()
  const initialZip = searchParams.get("zip") || ""

  const [searchInput, setSearchInput] = useState(initialZip)
  const [activeZip, setActiveZip] = useState(initialZip)
  const [data, setData] = useState<VotingProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [viewMode, setViewMode] = useState<"search" | "table">("search")
  const [allZipsData, setAllZipsData] = useState<VotingProfile[]>([])
  const [isLoadingAll, setIsLoadingAll] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>("city")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  const filteredZips = useMemo(() => {
    const query = searchInput.toLowerCase().trim()
    if (!query) return Object.keys(ZIP_CITY_MAP).sort()

    // If it looks like a ZIP code
    if (/^\d+$/.test(query)) {
      return Object.keys(ZIP_CITY_MAP)
        .filter((zip) => zip.startsWith(query))
        .sort()
    }

    // Search by city name
    return Object.entries(ZIP_CITY_MAP)
      .filter(([_, city]) => city.toLowerCase().includes(query))
      .map(([zip]) => zip)
      .sort()
  }, [searchInput])

  useEffect(() => {
    if (viewMode === "table" && allZipsData.length === 0) {
      setIsLoadingAll(true)
      Promise.all(
        Object.keys(ZIP_CITY_MAP).map((zip) =>
          fetch(`/api/civic/voting?zip=${zip}`).then((res) => (res.ok ? res.json() : null)),
        ),
      )
        .then((results) => {
          setAllZipsData(results.filter(Boolean))
        })
        .finally(() => {
          setIsLoadingAll(false)
        })
    }
  }, [viewMode, allZipsData.length])

  const sortedZipsData = useMemo(() => {
    if (!allZipsData.length) return []

    return [...allZipsData].sort((a, b) => {
      let comparison = 0
      switch (sortKey) {
        case "city":
          comparison = a.city.localeCompare(b.city)
          break
        case "lean":
          // Sort by margin (negative = Dem, positive = Rep)
          comparison = a.political_spectrum.margin - b.political_spectrum.margin
          break
        case "pres2020":
          comparison = a.presidential_2020.dem_share - b.presidential_2020.dem_share
          break
        case "gov2022":
          comparison = a.governor_2022.dem_share - b.governor_2022.dem_share
          break
        case "trend":
          const trendA =
            a.trend.direction === "more_dem"
              ? a.trend.shift_points
              : a.trend.direction === "more_rep"
                ? -a.trend.shift_points
                : 0
          const trendB =
            b.trend.direction === "more_dem"
              ? b.trend.shift_points
              : b.trend.direction === "more_rep"
                ? -b.trend.shift_points
                : 0
          comparison = trendA - trendB
          break
      }
      return sortDir === "asc" ? comparison : -comparison
    })
  }, [allZipsData, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  useEffect(() => {
    if (!activeZip) return

    setIsLoading(true)
    setError(null)

    fetch(`/api/civic/voting?zip=${activeZip}`)
      .then((res) => {
        if (!res.ok) throw new Error("ZIP not found")
        return res.json()
      })
      .then((votingData) => {
        setData(votingData)
      })
      .catch((err) => {
        setError(err.message)
        setData(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [activeZip])

  const handleSearch = () => {
    const query = searchInput.toLowerCase().trim()

    // Direct ZIP match
    if (/^\d{5}$/.test(query) && ZIP_CITY_MAP[query]) {
      setActiveZip(query)
      return
    }

    // City match - if only one ZIP for that city, select it
    if (CITY_TO_ZIPS[query]?.length === 1) {
      setActiveZip(CITY_TO_ZIPS[query][0])
    }
  }

  const handleSelectZip = (zip: string) => {
    setSearchInput(zip)
    setActiveZip(zip)
    setViewMode("search")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Civic Profile</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Local voting patterns based on recent election results (2020 Presidential & 2022 Governor). Neutral,
            factual, and non-persuasive.
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <div className="flex items-center bg-white rounded-xl border border-slate-200 p-1">
            <button
              onClick={() => setViewMode("search")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "search"
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Search className="h-4 w-4" />
              Search
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "table" ? "bg-primary text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Table className="h-4 w-4" />
              All ZIPs
            </button>
          </div>
        </div>

        {viewMode === "search" && (
          <>
            <div className="max-w-md mx-auto mb-6">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="text"
                    placeholder="Search by ZIP or city (e.g., 75007 or Plano)"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 h-12 rounded-xl border-slate-200"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
                <Button onClick={handleSearch} className="h-12 px-6 rounded-xl">
                  Look Up
                </Button>
              </div>

              {!activeZip && (
                <div className="mt-6">
                  <p className="text-sm text-slate-500 mb-3">
                    {searchInput ? `Matching "${searchInput}":` : "Select a ZIP code:"}
                  </p>
                  <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl p-2 bg-white">
                    {filteredZips.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {filteredZips.map((zip) => (
                          <button
                            key={zip}
                            onClick={() => {
                              setSearchInput(zip)
                              setActiveZip(zip)
                            }}
                            className="flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-primary/10 hover:border-primary/30 border border-transparent rounded-lg text-left transition-colors"
                          >
                            <span className="font-medium text-slate-900">{zip}</span>
                            <span className="text-sm text-slate-500">{ZIP_CITY_MAP[zip]}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500 py-4">No matching ZIPs found</p>
                    )}
                  </div>
                </div>
              )}

              {/* Clear selection button */}
              {activeZip && (
                <button
                  onClick={() => {
                    setActiveZip("")
                    setSearchInput("")
                    setData(null)
                  }}
                  className="mt-3 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mx-auto"
                >
                  <X className="h-4 w-4" />
                  Clear selection
                </button>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="text-center py-8">
                <p className="text-red-600">{error}</p>
                <p className="text-slate-500 text-sm mt-2">This ZIP code may not be in our database yet.</p>
              </div>
            )}

            {/* Content */}
            {(activeZip || isLoading) && (
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
                <CivicProfile data={data} isLoading={isLoading} />
              </div>
            )}
          </>
        )}

        {viewMode === "table" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {isLoadingAll ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-pulse text-slate-500">Loading all ZIPs...</div>
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <p className="text-sm text-slate-600">
                    <span className="font-medium">{sortedZipsData.length}</span> ZIP codes in DFW area. Click any row to
                    view full profile. Click column headers to sort.
                  </p>
                </div>
                <AllZipsTable
                  data={sortedZipsData}
                  onSelectZip={handleSelectZip}
                  sortKey={sortKey}
                  sortDir={sortDir}
                  onSort={handleSort}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function CivicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </div>
      }
    >
      <CivicContent />
    </Suspense>
  )
}
