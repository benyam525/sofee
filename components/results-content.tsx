"use client"

import React, { useEffect, useState, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  Info,
  X,
  ChevronRight,
  Search,
  Home,
  GraduationCap,
  Car,
  Shield,
  Utensils,
  MapPin,
  GitCompareArrows,
  Loader2,
  Music,
  PiggyBank,
  Unlock,
  Scale,
  Lightbulb,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import type { ZipSchoolSummary } from "@/types/schools"
// import { schoolQualityIndex } from "@/lib/schoolQuality"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ZipPersonaTeaser } from "@/components/zip-persona-insight"
import { LeadCaptureSection } from "@/components/lead-capture-section"

// REMOVED: Define ZipMetrics interface and import generateZipPersona function
// All persona logic now lives in the ZipPersonaTeaser component which reads from zipPersonas.json

// ADDED: Import generateZipPersona function
import { generateZipPersona } from "@/lib/zip-persona"

interface NeighborhoodDetail {
  name: string
  homeStyle: string
  typicalPriceRange: string
  vibe: string
  notes: string
}

interface NeighborhoodResult {
  zipCode: string
  city?: string
  isd?: string // Added ISD field to show school district
  score: number
  schools: number | string
  crime: number
  affordability: number
  parks: number
  reason: string
  medianHomePrice?: number
  commuteTime?: number
  climate?: string
  personalizedMatch?: string
  futureGrowth?: number
  priceUpdatedAt?: string
  schoolUpdatedAt?: string
  safetyUpdatedAt?: string
  parksUpdatedAt?: string
  isPriceOutdated?: boolean // Add pricing staleness field
  isStretchBudget?: boolean
  affordabilityGap?: number
  dataQuality?: "High" | "Medium" | "Low" // Add data quality field
  localExplanation?: string // Add localExplanation field
  scoringDetails?: {
    normalized: number
    adjustedScore?: number // Added adjustedScore
    perCriterion: {
      schoolQuality: { weight: number; score: number; contribution: number }
      affordability: { weight: number; score: number; contribution: number }
      commuteBurden: { weight: number; score: number; contribution: number }
      safetyStability: { weight: number; score: number; contribution: number }
      lifestyleConvenienceCulture: { weight: number; score: number; contribution: number }
      childDevelopmentOpportunity: { weight: number; score: number; contribution: number }
      taxBurden: { weight: number; score: number; contribution: number }
      tollRoadConvenience: { weight: number; score: number; contribution: number }
    }
  }
  modifiers?: {
    // Added modifiers
    townCenterBonus: number
    lifestyleTagBonus: number
  }
  rawData?: {
    medianSalePrice?: number
    rentMedian?: number
    schoolSignal?: number
    safetyBand?: string // Changed to string to match API response
    parksCountPerSqMi?: number
    sources?: string[]
    localExplanation?: string
    restaurantUniqueCount?: number
    entertainmentCount?: number
    hasTownCenter?: boolean
  }
  criteriaRankings?: Record<string, number> // Added criteriaRankings
  totalZipsCompared?: number // Added totalZipsCompared
  medianPrice?: number // Added medianPrice for display
  // Added fields for zip persona generation
  safetySignal?: number
  restaurantCount?: number
  entertainmentCount?: number
  diversityIndex?: number
  parksPerSqMi?: number
  convenienceScore?: number
  taxBurden?: number
  percentNewConstruction?: number
}

interface ExplorerResult {
  zip: string
  city: string
  isd: string
  medianHomePrice: number
  schoolSignal: number
  safetySignal: number
  commuteTime: number
  localExplanation: string
  restaurantUniqueCount: number
  entertainmentCount: number
  hasTownCenter: boolean
  sources?: string[]
}

interface SofeeInsight {
  type: "value-alternative" | "just-out-of-reach" | "trade-off-alert"
  icon: "piggy-bank" | "unlock" | "scale"
  title: string
  description: string
  highlight?: string
}

const loadingMessages = ["Crunching the zip codes…", "Weighing your priorities…", "Finding your best suburb…"]

function SofeeThinkingLoader() {
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
        <img src="/sofee-logo.png" alt="Sofee thinking" className="w-64 h-auto md:w-80 drop-shadow-xl" />
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

function SkeletonCard() {
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

function getTopNeighborhoods(zipCode: string): string[] {
  const neighborhoodMap: Record<string, string[]> = {
    "75034": ["Panther Creek", "Heather Ridge", "Dominion"],
    "75035": ["Panther Creek", "Heather Ridge", "Dominion"],
    "75013": ["Twin Creeks", "Watters Crossing"],
    "75070": ["Craig Ranch", "Stonebridge Ranch"],
    "75072": ["Craig Ranch", "Stonebridge Ranch"],
    "75024": ["Legacy West area", "Whiffletree", "Kings Ridge"],
    "75025": ["Legacy West area", "Whiffletree", "Kings Ridge"],
    "75093": ["Legacy West area", "Whiffletree", "Kings Ridge"],
    "75078": ["Windsong Ranch", "Star Trail"],
    "75009": ["Light Farms", "Bluewood"],
    "76092": ["Timarron", "Carillon"],
    "76034": ["Ross Downs", "Bransford Meadows"],
    "75007": ["Castle Hills", "Homestead"],
    "75010": ["Castle Hills", "Homestead"],
    "75052": ["Mira Lagos"],
  }

  return neighborhoodMap[zipCode] || []
}

async function getNeighborhoodDetails(zipCode: string): Promise<NeighborhoodDetail[]> {
  try {
    const response = await fetch("/data/dfwNeighborhoods.json")
    const data: Record<string, NeighborhoodDetail[]> = await response.json()
    return data[zipCode] || []
  } catch (error) {
    console.error("Error loading neighborhood details:", error)
    return []
  }
}

function getLifestyleBadges(result: NeighborhoodResult, userBudget?: number): string[] {
  const badges: string[] = []

  if (result.isStretchBudget) {
    badges.push("Stretch Budget")
  }

  // Great Schools badge
  if (typeof result.schools === "number" && result.schools >= 8.5) {
    badges.push("Great Schools")
  }

  // High Safety badge
  if (result.crime >= 8) {
    badges.push("High Safety")
  }

  // Affordable badge
  if (userBudget && result.medianHomePrice && result.medianHomePrice < userBudget) {
    badges.push("Affordable")
  }

  // City-specific badges
  if (result.city === "Prosper" || result.city === "Celina") {
    badges.push("New Development")
  } else if (result.city === "Southlake" || result.city === "Colleyville") {
    badges.push("Upscale Suburb")
  } else if (result.city === "Plano" || result.city === "Allen" || result.city === "McKinney") {
    badges.push("Balanced Living")
  }

  // Sports Families badge
  if (result.parks >= 7.5) {
    badges.push("Sports Families")
  }

  // Return max 3 badges
  return badges.slice(0, 3)
}

function generatePersonaSnapshot(result: NeighborhoodResult): string {
  const metrics = {
    zipCode: result.zipCode,
    city: result.city,
    medianHomePrice: result.medianHomePrice || 0,
    schoolScore: typeof result.schools === "number" ? result.schools * 10 : 0, // Convert 0-10 to 0-100
    safetySignal: result.safetySignal || 3,
    commuteTime: result.commuteTime || 30,
    restaurantCount: result.restaurantCount || 0,
    entertainmentCount: result.entertainmentCount || 0,
    diversityIndex: result.diversityIndex || 0.5,
    parksPerSqMi: result.parksPerSqMi || 0,
    hasTownCenter: result.hasTownCenter || false,
    convenienceScore: result.convenienceScore || 50,
    taxBurden: result.taxBurden || 12000,
    percentNewConstruction: result.percentNewConstruction || 0,
  }

  const { headline } = generateZipPersona(metrics)
  return headline
}

function generateWhyThisMatches(
  result: NeighborhoodResult,
  preferences: {
    schoolImportance: number
    safetyImportance: number
    affordabilityImportance: number
    parksImportance: number
    budget: number
    // Removed: maxCommute: number
  },
): string {
  const reasons: string[] = []

  // Check high importance ratings (4-5) and matching high scores
  if (preferences.schoolImportance >= 4 && typeof result.schools === "number" && result.schools >= 7.5) {
    reasons.push(
      "You rated schools as a high priority, and this ZIP offers some of the top-rated schools in the region.",
    )
  }

  if (preferences.safetyImportance >= 4 && result.crime >= 7.5) {
    reasons.push("Because you value safety, this ZIP's above-average safety score makes it a strong fit.")
  }

  if (
    preferences.affordabilityImportance >= 4 &&
    result.medianHomePrice &&
    result.medianHomePrice <= preferences.budget
  ) {
    reasons.push("Your budget aligns well with the median home prices in this area.")
  }

  if (preferences.parksImportance >= 4 && result.parks >= 7) {
    reasons.push(
      "With parks and recreation as a priority, this neighborhood's abundant green spaces and family amenities are ideal.",
    )
  }

  // Check commute alignment
  // Removed:
  // if (result.commuteTime && result.commuteTime <= preferences.maxCommute) {
  //   reasons.push(
  //     `The commute time of ${result.commuteTime} minutes fits comfortably within your ${preferences.maxCommute}-minute limit.`,
  //   )
  // }

  // Return up to 2 reasons
  if (reasons.length === 0) {
    return "This neighborhood balances your family's priorities well based on the preferences you provided."
  }

  return reasons.slice(0, 2).join(" ")
}

function getMostRecentUpdate(result: NeighborhoodResult): string | null {
  const dates = [result.priceUpdatedAt, result.schoolUpdatedAt, result.safetyUpdatedAt, result.parksUpdatedAt].filter(
    Boolean,
  ) as string[]

  if (dates.length === 0) return null

  // Convert YYYY-MM to comparable format and find most recent
  const sortedDates = dates.sort((a, b) => {
    const [yearA, monthA] = a.split("-").map(Number)
    const [yearB, monthB] = b.split("-").map(Number)
    if (yearA !== yearB) return yearB - yearA
    return monthB - yearA
  })

  return sortedDates[0]
}

const getOrdinal = (n: number): string => {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const getRankLabel = (rank: number, total: number): { label: string; color: string } => {
  const percentile = rank / total
  if (percentile <= 0.1) return { label: "Top 10%", color: "text-green-600" }
  if (percentile <= 0.25) return { label: "Top 25%", color: "text-emerald-600" }
  if (percentile <= 0.5) return { label: "Above Average", color: "text-blue-600" }
  if (percentile <= 0.75) return { label: "Below Average", color: "text-amber-600" }
  return { label: "Lower Rank", color: "text-red-500" }
}

// ADDED: Tooltip definitions and InfoTooltip component
const categoryInfo: Record<string, { title: string; description: string }> = {
  medianPrice: {
    title: "Median Home Price",
    description:
      "The middle sale price of homes in this ZIP code over the past 12 months. Half of homes sold for more, half for less.",
  },
  schoolScore: {
    title: "School Score",
    description:
      "A composite score (0-100) based on state test scores, graduation rates, and college readiness across all public schools in this ZIP. Data sourced from TEA and GreatSchools.",
  },
  avgCommute: {
    title: "Average Commute",
    description:
      "Typical one-way drive time to major employment centers in DFW during peak hours. Based on census commute data.",
  },
  safetyRating: {
    title: "Safety Rating",
    description:
      "Based on FBI crime statistics and local police data. Accounts for property crime and violent crime rates per 1,000 residents.",
  },
  restaurants: {
    title: "Restaurants",
    description:
      "Count of sit-down dining establishments, cafes, and local eateries. Does NOT include fast food chains. Sourced from Yelp business data.",
  },
  entertainment: {
    title: "Entertainment",
    description:
      "Venues for recreation including movie theaters, bowling alleys, live music venues, arcades, and performance spaces within the ZIP.",
  },
}

const InfoTooltip = ({ category }: { category: keyof typeof categoryInfo }) => {
  const info = categoryInfo[category]
  if (!info) return null
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-1 text-slate-400 hover:text-slate-600 transition-colors">
            <Info className="w-3.5 h-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-sm bg-slate-800 text-white p-3 rounded-lg shadow-xl">
          <p className="font-medium mb-1">{info.title}</p>
          <p className="text-slate-300 text-xs leading-relaxed">{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function ResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [results, setResults] = useState<NeighborhoodResult[]>([])
  const [loading, setLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const loadStartTime = useRef(Date.now())

  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [selectedZips, setSelectedZips] = useState<Set<string>>(new Set())
  const [userBudget, setUserBudget] = useState<number | undefined>()
  const [expandedNeighborhoods, setExpandedNeighborhoods] = useState<Set<string>>(new Set())
  const [neighborhoodDetails, setNeighborhoodDetails] = useState<Record<string, NeighborhoodDetail[]>>({})
  const [expandedEvidence, setExpandedEvidence] = useState<Set<string>>(new Set())
  const [expandedLocalVibe, setExpandedLocalVibe] = useState<Set<string>>(new Set())
  const [schoolSummaries, setSchoolSummaries] = useState<Record<string, ZipSchoolSummary>>({})
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set())
  const [normalizedSchools, setNormalizedSchools] = useState<any[]>([])

  const [expandedScoring, setExpandedScoring] = useState<Set<string>>(new Set())

  const [rankingModal, setRankingModal] = useState<{
    isOpen: boolean
    criterion: string
    currentZip: string
  } | null>(null)
  const [zipExplorerOpen, setZipExplorerOpen] = useState(false)
  const [explorerZipInput, setExplorerZipInput] = useState("")
  const [isExploring, setIsExploring] = useState(false)
  const [explorerError, setExplorerError] = useState<string | null>(null)

  const [explorerResult, setExplorerResult] = useState<ExplorerResult | null>(null)
  const [compareZip, setCompareZip] = useState("")
  const [compareResult, setCompareResult] = useState<ExplorerResult | null>(null)
  const [isLoadingCompare, setIsLoadingCompare] = useState(false)
  const [vibeExpanded, setVibeExpanded] = useState(false)
  const [compareVibeExpanded, setCompareVibeExpanded] = useState(false)

  const [allResults, setAllResults] = useState<NeighborhoodResult[]>([])
  const [insights, setInsights] = useState<SofeeInsight[]>([])

  const [activePriorities, setActivePriorities] = useState<string[]>([])
  const commuteBurdenWeight = Number.parseInt(searchParams.get("commuteBurden") || "3")
  // Removed: const maxCommuteParam = searchParams.get("maxCommute")
  const workplaceZip = searchParams.get("workplaceZip")
  const hasCommutePreference = commuteBurdenWeight > 0 && workplaceZip // Updated condition

  const getUserWeight = (key: string): number => {
    const weightMap: Record<string, string> = {
      schoolQuality: "schoolQuality",
      commuteBurden: "commuteBurden",
      safetyStability: "safetyStability",
      lifestyleConvenienceCulture: "lifestyleConvenienceCulture",
      childDevelopmentOpportunity: "childDevelopmentOpportunity",
      taxBurden: "taxBurden",
      tollRoadConvenience: "tollRoadConvenience",
    }
    const param = weightMap[key]
    if (!param) return 3
    return Number.parseInt(searchParams.get(param) || "3")
  }

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const requestBody = {
          budget: searchParams.get("budget") || "500000",
          budgetMin: searchParams.get("budgetMin") || "250000",
          homeType: searchParams.get("homeType") || "",
          // Removed: maxCommute: searchParams.get("maxCommute") || "",
          climate: searchParams.get("climate") || "",
          fromZip: searchParams.get("fromZip") || "",
          workplaceZip: searchParams.get("workplaceZip") || "",
          // Extract all weights from URL params
          schoolQuality: searchParams.get("schoolQuality") || "3",
          affordability: searchParams.get("affordability") || "3",
          commuteBurden: searchParams.get("commuteBurden") || "3",
          safetyStability: searchParams.get("safetyStability") || "3",
          lifestyleConvenienceCulture: searchParams.get("lifestyleConvenienceCulture") || "3",
          childDevelopmentOpportunity: searchParams.get("childDevelopmentOpportunity") || "3",
          taxBurden: searchParams.get("taxBurden") || "3",
          tollRoadConvenience: searchParams.get("tollRoadConvenience") || "3",
          // Extract lifestyle and special prefs
          lifestyleTags: searchParams.get("lifestyleTags") || "",
          preferTownCenter: searchParams.get("preferTownCenter") || "false",
          preferNewerHomes: searchParams.get("preferNewerHomes") || "false",
          preferEstablishedNeighborhoods: searchParams.get("preferEstablishedNeighborhoods") || "false",
          excludedCities: searchParams.get("excludedCities") || "",
        }

        console.log("[v0] CLIENT - URL searchParams:", {
          schoolQuality: searchParams.get("schoolQuality"),
          affordability: searchParams.get("affordability"),
          commuteBurden: searchParams.get("commuteBurden"),
          safetyStability: searchParams.get("safetyStability"),
        })
        console.log("[v0] CLIENT - Sending request body:", requestBody)

        const priorities = []
        const schoolQuality = Number.parseInt(requestBody.schoolQuality)
        const safetyStability = Number.parseInt(requestBody.safetyStability)
        const affordability = Number.parseInt(requestBody.affordability)
        const parksImportance = 3 // Default for now
        if (schoolQuality >= 4) priorities.push("Schools")
        if (safetyStability >= 4) priorities.push("Safety")
        if (affordability >= 4) priorities.push("Affordability")
        if (parksImportance >= 4) priorities.push("Parks")
        // Removed: if (requestBody.maxCommute && Number.parseInt(requestBody.maxCommute) < 45) priorities.push("Short Commute")
        setActivePriorities(priorities)

        const budgetValue = requestBody.budget ? Number.parseInt(requestBody.budget.replace(/\D/g, "")) : 500000
        setUserBudget(budgetValue)

        const userPrefs = {
          schoolImportance: Number.parseInt(requestBody.schoolQuality), // Assuming schoolQuality maps to importance
          safetyImportance: Number.parseInt(requestBody.safetyStability),
          affordabilityImportance: Number.parseInt(requestBody.affordability),
          parksImportance: parksImportance, // Using default for now
          budget: budgetValue,
          // Removed: maxCommute: Number.parseInt(requestBody.maxCommute) || 45,
        }

        let overrideData = null
        let liveData = null

        // Check if user wants to use live data
        const useLiveData = localStorage.getItem("use-live-data") === "true"

        if (useLiveData) {
          // Priority 1: Live cache data from refresh endpoints
          try {
            const cacheStored = localStorage.getItem("dfw-data-cache")
            if (cacheStored) {
              liveData = JSON.parse(cacheStored)
            }
          } catch (e) {
            console.error("Failed to parse live cache data:", e)
          }
        }

        // Priority 2: CSV override data from manual uploads
        try {
          const stored = localStorage.getItem("dfw_override_data")
          if (stored) {
            overrideData = JSON.parse(stored)
          }
        } catch (e) {
          console.error("Failed to parse override data:", e)
        }

        // Merge live data and override data (override takes precedence over live)
        let mergedData = null
        if (liveData || overrideData) {
          mergedData = {
            prices: { ...(liveData?.prices || {}), ...(overrideData?.prices || {}) },
            schools: { ...(liveData?.schools || {}), ...(overrideData?.schools || {}) },
            parks: { ...(liveData?.parks || {}), ...(overrideData?.parks || {}) },
          }
        }

        const response = await fetch("/api/neighborhoods", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...requestBody, overrideData: mergedData }), // Send all params in body
        })

        const data = await response.json()

        const resultsWithMatches = data.results.map((result: NeighborhoodResult) => ({
          ...result,
        }))

        setResults(resultsWithMatches)
        const allResultsCombined = [...(resultsWithMatches || [])]
        setAllResults(allResultsCombined)

        // Capture insights from API response
        if (data.insights && data.insights.length > 0) {
          setInsights(data.insights)
        }
      } catch (error) {
        console.error("Error fetching results:", error)
      } finally {
        const elapsed = Date.now() - loadStartTime.current
        const minLoadTime = 2500 // 2.5 seconds minimum
        const remainingTime = Math.max(0, minLoadTime - elapsed)

        setTimeout(() => {
          setLoading(false)
          setShowResults(true)
        }, remainingTime)
      }
    }

    fetchResults()
  }, [searchParams.toString()])

  useEffect(() => {
    const loadSchoolSummaries = async () => {
      try {
        const response = await fetch("/data/zip_school_summaries.json")
        const data: ZipSchoolSummary[] = await response.json()
        const summariesMap = data.reduce(
          (acc, summary) => {
            acc[summary.zip] = summary
            return acc
          },
          {} as Record<string, ZipSchoolSummary>,
        )
        setSchoolSummaries(summariesMap)
      } catch (error) {
        console.error("Error loading school summaries:", error)
      }
    }

    loadSchoolSummaries()
  }, [])

  useEffect(() => {
    const loadNormalizedSchools = async () => {
      try {
        const response = await fetch("/data/schools_normalized.json")
        const data = await response.json()
        setNormalizedSchools(data)
      } catch (error) {
        console.error("Error loading normalized schools:", error)
      }
    }

    loadNormalizedSchools()
  }, [])

  const toggleDetails = (zipCode: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(zipCode)) {
        newSet.delete(zipCode)
      } else {
        newSet.add(zipCode)
      }
      return newSet
    })
  }

  const toggleZipSelection = (zipCode: string) => {
    setSelectedZips((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(zipCode)) {
        newSet.delete(zipCode)
      } else {
        if (newSet.size < 3) {
          newSet.add(zipCode)
        }
      }
      return newSet
    })
  }

  const handleCompare = () => {
    if (selectedZips.size >= 2) {
      const selectedResults = results.filter((r) => selectedZips.has(r.zipCode))
      const compareData = encodeURIComponent(JSON.stringify(selectedResults))
      router.push(`/compare?data=${compareData}`)
    }
  }

  const toggleNeighborhoods = async (zipCode: string) => {
    setExpandedNeighborhoods((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(zipCode)) {
        newSet.delete(zipCode)
      } else {
        newSet.add(zipCode)
        if (!neighborhoodDetails[zipCode]) {
          getNeighborhoodDetails(zipCode).then((details) => {
            setNeighborhoodDetails((prev) => ({
              ...prev,
              [zipCode]: details,
            }))
          })
        }
      }
      return newSet
    })
  }

  const toggleLocalVibe = (zipCode: string) => {
    setExpandedLocalVibe((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(zipCode)) {
        newSet.delete(zipCode)
      } else {
        newSet.add(zipCode)
      }
      return newSet
    })
  }

  const toggleSchools = (zipCode: string) => {
    setExpandedSchools((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(zipCode)) {
        newSet.delete(zipCode)
      } else {
        newSet.add(zipCode)
      }
      return newSet
    })
  }

  const toggleEvidence = (zipCode: string) => {
    setExpandedEvidence((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(zipCode)) {
        newSet.delete(zipCode)
      } else {
        newSet.add(zipCode)
      }
      return newSet
    })
  }

  // Added toggle function for detailed scoring breakdown
  const toggleScoring = (zipCode: string) => {
    setExpandedScoring((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(zipCode)) {
        newSet.delete(zipCode)
      } else {
        newSet.add(zipCode)
      }
      return newSet
    })
  }

  // Helper to get top criteria for personalized match summary
  const getTopCriteria = (scoringDetails: any) => {
    if (!scoringDetails?.perCriterion) return []

    const criteria = Object.entries(scoringDetails.perCriterion).map(([key, value]: [string, any]) => ({
      key,
      weight: value.weight,
      score: value.score,
      contribution: value.contribution,
    }))

    return criteria
      .filter((c) => c.weight >= 3)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3)
  }

  // Helper to map scoring keys to readable labels
  const getCriteriaLabel = (key: string): string => {
    const labels: Record<string, string> = {
      schoolQuality: "School Quality",
      affordability: "Affordability",
      commuteBurden: "Commute Burden",
      safetyStability: "Safety & Stability",
      lifestyleConvenienceCulture: "Lifestyle & Culture",
      childDevelopmentOpportunity: "Child Development",
      taxBurden: "Tax Burden",
      tollRoadConvenience: "Toll Road Access",
    }
    return labels[key] || key
  }

  const getSchoolName = (campusId: string): string => {
    const school = normalizedSchools.find((s) => s.campusId === campusId)
    return school ? school.name : campusId
  }

  const getZipsSortedByCriterion = (
    criterion: string,
  ): Array<{ zip: string; city: string; rank: number; score: number }> => {
    return allResults
      .map((r) => ({
        zip: r.zipCode,
        city: r.city,
        rank: r.criteriaRankings?.[criterion] || 999,
        score: r.scoringDetails?.perCriterion?.[criterion]?.score || 0,
      }))
      .sort((a, b) => a.rank - b.rank)
  }

  const handleZipExplore = async () => {
    const cleanZip = explorerZipInput.trim()
    if (!/^\d{5}$/.test(cleanZip)) {
      setExplorerError("Please enter a valid 5-digit ZIP code")
      return
    }

    setIsExploring(true)
    setExplorerError(null)
    setExplorerResult(null)
    setCompareResult(null) // Clear comparison when searching new ZIP
    setCompareZip("")
    setVibeExpanded(false) // Reset vibe expansion

    try {
      const response = await fetch(`/api/zip-lookup?zip=${cleanZip}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 404) {
          setExplorerError(
            `ZIP code ${cleanZip} is not in Sofee's database yet. We currently cover select DFW suburbs.`,
          )
        } else {
          setExplorerError("Something went wrong. Please try again.")
        }
        return
      }

      setExplorerResult({
        zip: data.zip,
        city: data.city,
        isd: data.isd,
        medianHomePrice: data.medianHomePrice,
        schoolSignal: data.schoolSignal,
        safetySignal: data.safetySignal, // Now using numeric value directly from API
        commuteTime: data.commuteTime,
        localExplanation: data.localExplanation,
        restaurantUniqueCount: data.restaurantUniqueCount,
        entertainmentCount: data.entertainmentCount,
        hasTownCenter: data.hasTownCenter,
        sources: data.sources,
      })
    } catch (error) {
      console.error("ZIP lookup error:", error)
      setExplorerError("Something went wrong. Please try again.")
    } finally {
      setIsExploring(false)
    }
  }

  const handleCompareZip = async () => {
    const cleanZip = compareZip.trim()
    if (!/^\d{5}$/.test(cleanZip)) return
    if (cleanZip === explorerResult?.zip) {
      setCompareResult(null)
      return
    }

    setIsLoadingCompare(true)
    setCompareVibeExpanded(false) // Reset comparison vibe expansion

    try {
      const response = await fetch(`/api/zip-lookup?zip=${cleanZip}`)
      const data = await response.json()

      if (response.ok) {
        setCompareResult({
          zip: data.zip,
          city: data.city,
          isd: data.isd,
          medianHomePrice: data.medianHomePrice,
          schoolSignal: data.schoolSignal,
          safetySignal: data.safetySignal,
          commuteTime: data.commuteTime,
          localExplanation: data.localExplanation,
          restaurantUniqueCount: data.restaurantUniqueCount,
          entertainmentCount: data.entertainmentCount,
          hasTownCenter: data.hasTownCenter,
          sources: data.sources,
        })
      } else {
        setCompareResult(null)
      }
    } catch {
      setCompareResult(null)
    } finally {
      setIsLoadingCompare(false)
    }
  }

  const getSafetyLabel = (signal: number) => {
    switch (signal) {
      case 1:
        return "Excellent"
      case 2:
        return "Very Good"
      case 3:
        return "Good"
      case 4:
        return "Fair"
      case 5:
        return "Below Average"
      default:
        return "Unknown"
    }
  }

  const getSafetyColor = (signal: number) => {
    switch (signal) {
      case 1:
        return "text-emerald-600"
      case 2:
        return "text-green-600"
      case 3:
        return "text-blue-600"
      case 4:
        return "text-amber-600"
      case 5:
        return "text-red-600"
      default:
        return "text-slate-600"
    }
  }

  if (loading || !showResults) {
    return (
      <div>
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-semibold text-foreground mb-2">Recommended Neighborhoods</h1>
            <p className="text-sm md:text-base text-muted-foreground">Let Sofee work her magic...</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/")} className="w-fit">
            Back
          </Button>
        </div>

        {/* Use SofeeThinkingLoader */}
        <SofeeThinkingLoader />
      </div>
    )
  }

  const topMatches = results.slice(0, 4)
  const honorableMentions = results.slice(4)

  return (
    <TooltipProvider>
      <div>
        <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-4xl font-semibold text-foreground mb-2">Recommended Neighborhoods</h1>
            <p className="text-sm md:text-base text-muted-foreground max-w-3xl mb-2">
              We took the importance sliders you set (0–3), computed a score for each ZIP (0–100) across schools,
              affordability, commute, safety, lifestyle, child development, taxes, and toll road convenience, and then
              ranked neighborhoods by how well they match your unique weighting.
              <a href="/docs" className="ml-2 text-primary hover:underline text-xs md:text-sm font-medium">
                How we score →
              </a>
            </p>
            {activePriorities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Your Top Priorities:</span>
                {activePriorities.join(", ")}
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => router.push("/")} className="w-fit shrink-0">
            Back
          </Button>
        </div>

        {/* Sofee's Insights Card - using brand blue #6EA1D4 */}
        {insights.length > 0 && (
          <div className="block w-full mb-8">
            <div className="glass-card-strong rounded-2xl p-5 md:p-6 border border-[#6EA1D4]/30 bg-gradient-to-br from-[#6EA1D4]/10 via-white to-sky-50/40 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-[#6EA1D4] to-[#5A8BC0] text-white">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Sofee's Insights</h3>
                  <p className="text-xs text-muted-foreground">Personalized tips based on your search</p>
                </div>
              </div>
              <div className="space-y-3">
                {insights.map((insight, idx) => {
                  const IconComponent =
                    insight.icon === "piggy-bank"
                      ? PiggyBank
                      : insight.icon === "unlock"
                        ? Unlock
                        : Scale

                  const iconBg =
                    insight.type === "value-alternative"
                      ? "bg-emerald-100 text-emerald-600"
                      : insight.type === "just-out-of-reach"
                        ? "bg-[#6EA1D4]/20 text-[#5A8BC0]"
                        : "bg-purple-100 text-purple-600"

                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 md:p-4 rounded-xl bg-white/70 border border-white/50"
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-foreground">{insight.title}</span>
                          {insight.highlight && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[#6EA1D4]/15 text-[#5A8BC0]">
                              {insight.highlight}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{insight.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-foreground mb-1">Top Matches</h2>
          <p className="text-sm text-muted-foreground mb-4">These neighborhoods best align with your priorities</p>
          <div className="space-y-4">
            {topMatches.map((result, index) => (
              <React.Fragment key={result.zipCode}>
                {/* Insert Lead Capture after 2nd card */}
                {index === 2 && (
                  <LeadCaptureSection
                    topMatches={topMatches.map((m) => ({
                      zipCode: m.zipCode,
                      city: m.city,
                      score: m.scoringDetails?.adjustedScore ?? m.scoringDetails?.normalized ?? m.score
                    }))}
                    budgetMin={searchParams.get("budgetMin") || undefined}
                    budgetMax={searchParams.get("budget") || undefined}
                    workplaceZip={searchParams.get("workplaceZip") || undefined}
                    priorities={{
                      schoolQuality: searchParams.get("schoolQuality") || undefined,
                      commuteBurden: searchParams.get("commuteBurden") || undefined,
                      safetyStability: searchParams.get("safetyStability") || undefined,
                      affordability: searchParams.get("affordability") || undefined,
                      lifestyleConvenienceCulture: searchParams.get("lifestyleConvenienceCulture") || undefined,
                      childDevelopmentOpportunity: searchParams.get("childDevelopmentOpportunity") || undefined,
                      taxBurden: searchParams.get("taxBurden") || undefined,
                      tollRoadConvenience: searchParams.get("tollRoadConvenience") || undefined,
                    }}
                    preferences={{
                      lifestyleTags: searchParams.get("lifestyleTags") || undefined,
                      excludedCities: searchParams.get("excludedCities") || undefined,
                      preferTownCenter: searchParams.get("preferTownCenter") || undefined,
                      preferNewerHomes: searchParams.get("preferNewerHomes") || undefined,
                      preferEstablishedNeighborhoods: searchParams.get("preferEstablishedNeighborhoods") || undefined,
                    }}
                  />
                )}
              <Card className="border border-border bg-white p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 bg-primary px-2.5 md:px-3 py-1 rounded-br-lg border-b border-r border-border z-10">
                  <span className="text-xs font-bold text-primary-foreground">#{index + 1}</span>
                </div>

                <div className="pt-4 md:pt-2">
                  <div className="w-full">
                    <div className="flex flex-wrap items-start md:items-center gap-2 md:gap-3 mb-3">
                      <h2 className="text-lg md:text-2xl font-semibold text-foreground">
                        {result.city ? `${result.city} (${result.zipCode})` : `ZIP ${result.zipCode}`}
                      </h2>

                      {result.isd && (
                        <div className="rounded-full bg-purple-100 text-purple-700 px-2.5 md:px-3 py-0.5 md:py-1">
                          <span className="text-[10px] md:text-xs font-medium">{result.isd}</span>
                        </div>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="rounded-full bg-muted px-2.5 md:px-3 py-0.5 md:py-1 cursor-help">
                            <span className="text-xs md:text-sm font-medium text-foreground">
                              Match:{" "}
                              {result.scoringDetails?.adjustedScore // Use adjustedScore if available
                                ? `${Math.round(result.scoringDetails.adjustedScore)}/100`
                                : `${result.score}/100`}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            This score reflects how well this neighborhood matches your specific priorities (Schools,
                            Safety, Budget, etc.).
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      {result.dataQuality && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`rounded-full px-2 md:px-2.5 py-0.5 cursor-help ${
                                result.dataQuality === "High"
                                  ? "bg-green-100 text-green-700"
                                  : result.dataQuality === "Medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              <span className="text-[10px] md:text-xs font-medium">{result.dataQuality} Quality</span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              {result.dataQuality === "High"
                                ? "Data is recent (within 12 months)."
                                : result.dataQuality === "Medium"
                                  ? "Some data points may be older than 12 months."
                                  : "Data may be limited or outdated."}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}

                      {/* {schoolSummaries[result.zipCode] && (() => {
                        const sqi = schoolQualityIndex(schoolSummaries[result.zipCode])
                        return sqi !== null ? (
                          <div className="rounded-full bg-blue-100 text-blue-700 px-2.5 py-0.5">
                            <span className="text-xs font-medium">
                              School Quality: {sqi}
                            </span>
                          </div>
                        ) : null
                      })()} */}
                    </div>

                    {/* START: MERGE POINT for budget display */}
                    <div className="mb-3 md:mb-4 p-3 md:p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg md:rounded-xl border border-emerald-200/60">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                        <div>
                          <div className="text-[10px] md:text-xs text-emerald-600 font-medium uppercase tracking-wide">
                            Median Home Price
                          </div>
                          <div className="text-xl md:text-2xl font-bold text-emerald-800">
                            ${(result.medianPrice || result.medianHomePrice)?.toLocaleString() || "N/A"}
                          </div>
                        </div>
                        {result.affordabilityGap !== undefined && (
                          <div className="sm:text-right">
                            <div
                              className={`text-[10px] md:text-xs font-medium uppercase tracking-wide ${result.affordabilityGap > 0 ? "text-orange-600" : "text-emerald-600"}`}
                            >
                              {result.affordabilityGap > 0 ? "Over Budget" : "Under Budget"}
                            </div>
                            <div
                              className={`text-xl md:text-2xl font-bold ${result.affordabilityGap > 0 ? "text-orange-600" : "text-emerald-700"}`}
                            >
                              ${Math.abs(result.affordabilityGap).toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* END: MERGE POINT for budget display */}

                    {/* Replace score breakdown with rank-based display */}
                    {result.scoringDetails && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleScoring(result.zipCode)}
                          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedScoring.has(result.zipCode) ? "rotate-180" : ""
                            }`}
                          />
                          Why This Ranked
                        </button>

                        {expandedScoring.has(result.zipCode) && (
                          <div className="mt-3 pl-2">
                            <div className="space-y-2">
                              {Object.entries(result.scoringDetails.perCriterion)
                                .filter(([key, value]: [string, any]) => value.weight >= 3)
                                .sort((a: any, b: any) => b[1].weight - a[1].weight)
                                .map(([key, value]: [string, any]) => {
                                  const rank = result.criteriaRankings?.[key] || 0
                                  const total = result.totalZipsCompared || 27
                                  const rankInfo = getRankLabel(rank, total)

                                  // Find this section inside the "Why This Ranked" expandable area and replace:
                                  // <div
                                  //   key={key}
                                  //   className="flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg"
                                  // >
                                  // ... with this clickable version:
                                  return (
                                    <button
                                      key={key}
                                      onClick={() =>
                                        setRankingModal({ isOpen: true, criterion: key, currentZip: result.zipCode })
                                      }
                                      className="w-full flex items-center justify-between py-2 px-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                    >
                                      <div className="flex flex-col items-start">
                                        <span className="text-sm font-medium text-foreground">
                                          {getCriteriaLabel(key)}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          You weighted this {value.weight}/5
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="flex flex-col items-end">
                                          <span className={`text-sm font-semibold ${rankInfo.color}`}>
                                            {getOrdinal(rank)} of {total}
                                          </span>
                                          <span className={`text-xs ${rankInfo.color}`}>{rankInfo.label}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                      </div>
                                    </button>
                                  )
                                })}

                              {Object.values(result.scoringDetails.perCriterion).every((v: any) => v.weight < 3) && (
                                <p className="text-sm text-muted-foreground italic py-2">
                                  No criteria weighted 3 or higher. Rankings shown for your top priorities.
                                </p>
                              )}

                              {Object.values(result.scoringDetails.perCriterion).some(
                                (v: any) => v.weight > 0 && v.weight < 3,
                              ) && (
                                <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border">
                                  Lower priority criteria (weight 1-2) also factor into your match score but aren't
                                  shown here.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {getMostRecentUpdate(result) && (
                      <p className="text-xs text-muted-foreground mb-2">Last updated: {getMostRecentUpdate(result)}</p>
                    )}

                    {/* {schoolSummaries[result.zipCode] && schoolQualityIndex(schoolSummaries[result.zipCode]) !== null && (
                      <p className="text-xs text-muted-foreground/70 italic mb-2">
                        School Quality Index will be blended into overall scoring soon
                      </p>
                    )} */}

                    {result.isPriceOutdated && (
                      <div className="flex items-center gap-1.5 mb-2 text-xs text-orange-600/80">
                        <span>⚠️</span>
                        <span>Pricing may be out of date</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mb-3">
                      {getLifestyleBadges(result, userBudget).map((badge) => (
                        <span
                          key={badge}
                          className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>

                    <ZipPersonaTeaser
                      zipCode={result.zipCode}
                      onUnlock={() => {
                        // Navigate to civic page or show premium modal
                        router.push(`/civic?zip=${result.zipCode}`)
                      }}
                    />

                    {/* Adding School Data dropdown to top matches section */}
                    {schoolSummaries[result.zipCode] && (
                      <div className="mb-4">
                        <button
                          onClick={() => toggleSchools(result.zipCode)}
                          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedSchools.has(result.zipCode) ? "rotate-180" : ""
                            }`}
                          />
                          School Data
                        </button>

                        {expandedSchools.has(result.zipCode) && (
                          <div className="mt-3 pl-6 space-y-3">
                            {result.isd && (
                              <div className="p-2 bg-blue-50 rounded-md border border-blue-200 text-xs text-blue-900">
                                <strong>Note:</strong> All schools listed below are zoned to{" "}
                                <strong>{result.isd}</strong> for ZIP code {result.zipCode}.
                              </div>
                            )}

                            <div className="p-3 bg-muted/20 rounded-md border border-border">
                              <h4 className="font-semibold text-foreground mb-2">School Summary</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Total Schools:</span>
                                  <span className="text-foreground">
                                    {schoolSummaries[result.zipCode].counts?.total || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Elementary Schools:</span>
                                  <span className="text-foreground">
                                    {schoolSummaries[result.zipCode].counts?.ES || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Middle Schools:</span>
                                  <span className="text-foreground">
                                    {schoolSummaries[result.zipCode].counts?.MS || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">High Schools:</span>
                                  <span className="text-foreground">
                                    {schoolSummaries[result.zipCode].counts?.HS || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avg Math Proficiency:</span>
                                  <span className="text-foreground">
                                    {schoolSummaries[result.zipCode].avgProficiency?.math
                                      ? `${Math.round(schoolSummaries[result.zipCode].avgProficiency.math * 100)}%`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Avg Reading Proficiency:</span>
                                  <span className="text-foreground">
                                    {schoolSummaries[result.zipCode].avgProficiency?.reading
                                      ? `${Math.round(schoolSummaries[result.zipCode].avgProficiency.reading * 100)}%`
                                      : "N/A"}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">% A-Rated Schools:</span>
                                  <span className="text-foreground">
                                    {schoolSummaries[result.zipCode].pctRatedA || 0}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            {(() => {
                              const zipSchools = normalizedSchools.filter((s) => s.zip === result.zipCode)
                              const elemSchools = zipSchools.filter((s) => s.level === "ES")
                              const middleSchools = zipSchools.filter((s) => s.level === "MS")
                              const highSchools = zipSchools.filter((s) => s.level === "HS")

                              return (
                                <>
                                  {/* Elementary Schools Detail */}
                                  {elemSchools.length > 0 && (
                                    <div className="p-3 bg-blue-50/30 rounded-md border border-blue-200/50">
                                      <h5 className="font-medium text-foreground mb-3">
                                        Elementary Schools ({elemSchools.length}):
                                      </h5>
                                      <div className="space-y-3">
                                        {elemSchools.map((school) => (
                                          <div
                                            key={school.campusId}
                                            className="p-2 bg-white rounded border border-border"
                                          >
                                            <div className="flex items-start justify-between mb-1">
                                              <h6 className="font-semibold text-sm text-foreground">{school.name}</h6>
                                              {school.accountabilityRating && (
                                                <span
                                                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    school.accountabilityRating === "A"
                                                      ? "bg-green-100 text-green-800"
                                                      : school.accountabilityRating === "B"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : school.accountabilityRating === "C"
                                                          ? "bg-yellow-100 text-yellow-800"
                                                          : "bg-gray-100 text-gray-800"
                                                  }`}
                                                >
                                                  {school.accountabilityRating}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                              <div>
                                                {school.address}, {school.city}
                                              </div>
                                              <div className="flex gap-4 mt-1.5">
                                                {school.staarMathProficiency && (
                                                  <span>
                                                    Overall Math:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {Math.round(school.staarMathProficiency * 100)}%
                                                    </span>
                                                  </span>
                                                )}
                                                {school.staarReadingProficiency && (
                                                  <span>
                                                    Overall Reading:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {Math.round(school.staarReadingProficiency * 100)}%
                                                    </span>
                                                  </span>
                                                )}
                                              </div>
                                              {school.gradeLevelScores && school.gradeLevelScores.length > 0 && (
                                                <div className="mt-2 pt-2 border-t border-border/50">
                                                  <div className="text-xs font-medium text-foreground mb-1">
                                                    Grade Level Scores:
                                                  </div>
                                                  {school.gradeLevelScores.map((gradeScore: any) => (
                                                    <div
                                                      key={gradeScore.grade}
                                                      className="flex gap-4 text-xs text-muted-foreground ml-2"
                                                    >
                                                      <span className="font-medium text-foreground">
                                                        Grade {gradeScore.grade}:
                                                      </span>
                                                      <span>Math: {Math.round(gradeScore.math * 100)}%</span>
                                                      <span>Reading: {Math.round(gradeScore.reading * 100)}%</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                              {school.studentCount && (
                                                <div className="mt-1">
                                                  Students:{" "}
                                                  <span className="font-medium text-foreground">
                                                    {school.studentCount}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Middle Schools Detail */}
                                  {middleSchools.length > 0 && (
                                    <div className="p-3 bg-purple-50/30 rounded-md border border-purple-200/50">
                                      <h5 className="font-medium text-foreground mb-3">
                                        Middle Schools ({middleSchools.length}):
                                      </h5>
                                      <div className="space-y-3">
                                        {middleSchools.map((school) => (
                                          <div
                                            key={school.campusId}
                                            className="p-2 bg-white rounded border border-border"
                                          >
                                            <div className="flex items-start justify-between mb-1">
                                              <h6 className="font-semibold text-sm text-foreground">{school.name}</h6>
                                              {school.accountabilityRating && (
                                                <span
                                                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    school.accountabilityRating === "A"
                                                      ? "bg-green-100 text-green-800"
                                                      : school.accountabilityRating === "B"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : school.accountabilityRating === "C"
                                                          ? "bg-yellow-100 text-yellow-800"
                                                          : "bg-gray-100 text-gray-800"
                                                  }`}
                                                >
                                                  {school.accountabilityRating}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                              <div>
                                                {school.address}, {school.city}
                                              </div>
                                              <div className="flex gap-4 mt-1.5">
                                                {school.staarMathProficiency && (
                                                  <span>
                                                    Math:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {Math.round(school.staarMathProficiency * 100)}%
                                                    </span>
                                                  </span>
                                                )}
                                                {school.staarReadingProficiency && (
                                                  <span>
                                                    Reading:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {Math.round(school.staarReadingProficiency * 100)}%
                                                    </span>
                                                  </span>
                                                )}
                                              </div>
                                              {school.studentCount && (
                                                <div className="mt-1">
                                                  Students:{" "}
                                                  <span className="font-medium text-foreground">
                                                    {school.studentCount}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* High Schools Detail */}
                                  {highSchools.length > 0 && (
                                    <div className="p-3 bg-orange-50/30 rounded-md border border-orange-200/50">
                                      <h5 className="font-medium text-foreground mb-3">
                                        High Schools ({highSchools.length}):
                                      </h5>
                                      <div className="space-y-3">
                                        {highSchools.map((school) => (
                                          <div
                                            key={school.campusId}
                                            className="p-2 bg-white rounded border border-border"
                                          >
                                            <div className="flex items-start justify-between mb-1">
                                              <h6 className="font-semibold text-sm text-foreground">{school.name}</h6>
                                              {school.accountabilityRating && (
                                                <span
                                                  className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                    school.accountabilityRating === "A"
                                                      ? "bg-green-100 text-green-800"
                                                      : school.accountabilityRating === "B"
                                                        ? "bg-blue-100 text-blue-800"
                                                        : school.accountabilityRating === "C"
                                                          ? "bg-yellow-100 text-yellow-800"
                                                          : "bg-gray-100 text-gray-800"
                                                  }`}
                                                >
                                                  {school.accountabilityRating}
                                                </span>
                                              )}
                                            </div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                              <div>
                                                {school.address}, {school.city}
                                              </div>
                                              <div className="flex gap-4 mt-1.5">
                                                {school.staarMathProficiency && (
                                                  <span>
                                                    Math:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {Math.round(school.staarMathProficiency * 100)}%
                                                    </span>
                                                  </span>
                                                )}
                                                {school.staarReadingProficiency && (
                                                  <span>
                                                    Reading:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {Math.round(school.staarReadingProficiency * 100)}%
                                                    </span>
                                                  </span>
                                                )}
                                              </div>
                                              {school.studentCount && (
                                                <div className="mt-1">
                                                  Students:{" "}
                                                  <span className="font-medium text-foreground">
                                                    {school.studentCount}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    )}

                    {hasCommutePreference &&
                      result.commuteTime && ( // Changed to use derived hasCommutePreference
                        <div className="mb-4 p-3 bg-muted/20 rounded-md border border-border">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-medium text-foreground">Commute Time</h3>
                              <span className="text-sm text-muted-foreground">{result.commuteTime} minutes</span>
                            </div>
                            <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-foreground/70 rounded-full transition-all"
                                style={{
                                  width: `${Math.max(10, 100 - (result.commuteTime / 60) * 100)}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {result.commuteTime <= 20
                                ? "Excellent commute"
                                : result.commuteTime <= 30
                                  ? "Good commute"
                                  : result.commuteTime <= 40
                                    ? "Moderate commute"
                                    : "Longer commute"}
                            </p>
                          </div>
                        </div>
                      )}

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <div className="text-xs text-muted-foreground">Schools</div>
                          <div className="group relative">
                            <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-3 bg-foreground text-background text-xs rounded-md shadow-lg z-10">
                              <div className="space-y-1.5">
                                <p className="font-medium">How we calculate school score:</p>
                                <p>
                                  <strong>schoolSignal</strong> is a 0–100 composite from state accountability and
                                  achievement data.
                                </p>
                                <p>
                                  <strong>schoolScore</strong> = round(schoolSignal ÷ 10)
                                </p>
                                <p className="text-background/80 italic">
                                  If schoolSignal is missing, we display "—" and adjust scoring weights proportionally.
                                </p>
                              </div>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-foreground"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-lg font-medium text-foreground">
                          {typeof result.schools === "number" ? result.schools.toFixed(1) : result.schools}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Safety</div>
                        <div className="text-lg font-medium text-foreground">{result.crime.toFixed(1)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Affordability</div>
                        <div className="text-lg font-medium text-foreground">{result.affordability.toFixed(1)}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">Parks</div>
                        <div className="text-lg font-medium text-foreground">{result.parks.toFixed(1)}</div>
                      </div>
                    </div>

                    {/* START: MERGE POINT for future growth */}
                    {result.futureGrowth !== undefined && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="space-y-1 cursor-help">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                Future Growth Potential
                                <Info className="h-3 w-3" />
                              </div>
                              <div className="text-lg font-medium text-foreground">
                                {result.futureGrowth.toFixed(1)}/10
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">
                              <strong>Projected 5-year appreciation potential</strong> based on school quality, parks
                              access, home price trends, commute convenience, and development momentum in the area.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    {/* END: MERGE POINT for future growth */}

                    <div className="mt-4 border-t border-border pt-3">
                      <button
                        onClick={() => toggleDetails(result.zipCode)}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedCards.has(result.zipCode) ? "rotate-180" : ""
                          }`}
                        />
                        View Details
                      </button>

                      <div className="mt-3 space-y-2 pl-6">
                        {result.affordabilityGap !== undefined && Math.abs(result.affordabilityGap) < 200000 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {result.affordabilityGap > 0 ? "Over Budget By:" : "Under Budget By:"}
                            </span>
                            <span
                              className={`font-medium ${result.affordabilityGap > 0 ? "text-orange-600" : "text-green-600"}`}
                            >
                              ${Math.abs(result.affordabilityGap).toLocaleString()}
                            </span>
                          </div>
                        )}
                        {hasCommutePreference && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Commute Time:</span>
                            <span className="text-foreground">
                              {result.commuteTime ? `${result.commuteTime} minutes` : "N/A"}
                            </span>
                          </div>
                        )}
                        {!hasCommutePreference && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Commute:</span>
                            <span className="text-muted-foreground italic">Not a priority</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Median Home Price:</span>
                          <span className="text-foreground">
                            {result.medianHomePrice ? `$${result.medianHomePrice.toLocaleString()}` : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
              </React.Fragment>
            ))}
          </div>
        </div>

        {honorableMentions.length > 0 && (
          <div className="mt-8 md:mt-12">
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-1">Honorable Mentions</h2>
            <p className="text-xs md:text-sm text-muted-foreground mb-4">
              These neighborhoods are also great options and worth considering.
            </p>
            <div className="space-y-3 md:space-y-4">
              {honorableMentions.map((result, index) => (
                <Card
                  key={result.zipCode}
                  className="border border-border bg-white/90 p-4 md:p-6 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 bg-muted px-2.5 md:px-3 py-1 rounded-br-lg border-b border-r border-border z-10">
                    <span className="text-xs font-bold text-muted-foreground">#{index + 5}</span>
                  </div>

                  <div className="pt-4 md:pt-2">
                    <div className="w-full">
                      <div className="flex flex-wrap items-start md:items-center gap-2 md:gap-3 mb-3">
                        <h2 className="text-lg md:text-2xl font-semibold text-foreground">
                          {result.city ? `${result.city} (${result.zipCode})` : `ZIP ${result.zipCode}`}
                        </h2>

                        {result.isd && (
                          <div className="rounded-full bg-purple-100 text-purple-700 px-2.5 md:px-3 py-0.5 md:py-1">
                            <span className="text-[10px] md:text-xs font-medium">{result.isd}</span>
                          </div>
                        )}

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="rounded-full bg-muted px-2.5 md:px-3 py-0.5 md:py-1 cursor-help">
                              <span className="text-xs md:text-sm font-medium text-foreground">
                                Match:{" "}
                                {result.scoringDetails?.adjustedScore
                                  ? `${Math.round(result.scoringDetails.adjustedScore)}/100`
                                  : `${result.score}/100`}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              This score reflects how well this neighborhood matches your specific priorities.
                            </p>
                          </TooltipContent>
                        </Tooltip>

                        {result.dataQuality && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className={`rounded-full px-2 md:px-2.5 py-0.5 cursor-help ${
                                  result.dataQuality === "High"
                                    ? "bg-green-100 text-green-700"
                                    : result.dataQuality === "Medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <span className="text-[10px] md:text-xs font-medium">{result.dataQuality} Quality</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                {result.dataQuality === "High"
                                  ? "Data is recent (within 12 months)."
                                  : result.dataQuality === "Medium"
                                    ? "Some data points may be older than 12 months."
                                    : "Data may be limited or outdated."}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {getLifestyleBadges(result, userBudget).map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex items-center rounded-md bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      {/* START: MERGE POINT for school data in honorable mentions */}
                      {schoolSummaries[result.zipCode] && (
                        <div className="mb-4">
                          <button
                            onClick={() => toggleSchools(result.zipCode)}
                            className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
                          >
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedSchools.has(result.zipCode) ? "rotate-180" : ""
                              }`}
                            />
                            School Data
                          </button>

                          {expandedSchools.has(result.zipCode) && (
                            <div className="mt-3 pl-6 space-y-3">
                              {result.isd && (
                                <div className="p-2 bg-blue-50 rounded-md border border-blue-200 text-xs text-blue-900">
                                  <strong>Note:</strong> All schools listed below are zoned to{" "}
                                  <strong>{result.isd}</strong> for ZIP code {result.zipCode}.
                                </div>
                              )}

                              <div className="p-3 bg-muted/20 rounded-md border border-border">
                                <h4 className="font-semibold text-foreground mb-2">School Summary</h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Schools:</span>
                                    <span className="text-foreground">
                                      {schoolSummaries[result.zipCode].counts?.total || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Elementary Schools:</span>
                                    <span className="text-foreground">
                                      {schoolSummaries[result.zipCode].counts?.ES || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Middle Schools:</span>
                                    <span className="text-foreground">
                                      {schoolSummaries[result.zipCode].counts?.MS || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">High Schools:</span>
                                    <span className="text-foreground">
                                      {schoolSummaries[result.zipCode].counts?.HS || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg Math Proficiency:</span>
                                    <span className="text-foreground">
                                      {schoolSummaries[result.zipCode].avgProficiency?.math
                                        ? `${Math.round(schoolSummaries[result.zipCode].avgProficiency.math * 100)}%`
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Avg Reading Proficiency:</span>
                                    <span className="text-foreground">
                                      {schoolSummaries[result.zipCode].avgProficiency?.reading
                                        ? `${Math.round(schoolSummaries[result.zipCode].avgProficiency.reading * 100)}%`
                                        : "N/A"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">% A-Rated Schools:</span>
                                    <span className="text-foreground">
                                      {schoolSummaries[result.zipCode].pctRatedA || 0}%
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {(() => {
                                const zipSchools = normalizedSchools.filter((s) => s.zip === result.zipCode)
                                const elemSchools = zipSchools.filter((s) => s.level === "ES")
                                const middleSchools = zipSchools.filter((s) => s.level === "MS")
                                const highSchools = zipSchools.filter((s) => s.level === "HS")

                                return (
                                  <>
                                    {/* Elementary Schools Detail */}
                                    {elemSchools.length > 0 && (
                                      <div className="p-3 bg-blue-50/30 rounded-md border border-blue-200/50">
                                        <h5 className="font-medium text-foreground mb-3">
                                          Elementary Schools ({elemSchools.length}):
                                        </h5>
                                        <div className="space-y-3">
                                          {elemSchools.map((school) => (
                                            <div
                                              key={school.campusId}
                                              className="p-2 bg-white rounded border border-border"
                                            >
                                              <div className="flex items-start justify-between mb-1">
                                                <h6 className="font-semibold text-sm text-foreground">{school.name}</h6>
                                                {school.accountabilityRating && (
                                                  <span
                                                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                      school.accountabilityRating === "A"
                                                        ? "bg-green-100 text-green-800"
                                                        : school.accountabilityRating === "B"
                                                          ? "bg-blue-100 text-blue-800"
                                                          : school.accountabilityRating === "C"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                  >
                                                    {school.accountabilityRating}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground space-y-1">
                                                <div>
                                                  {school.address}, {school.city}
                                                </div>
                                                <div className="flex gap-4 mt-1.5">
                                                  {school.staarMathProficiency && (
                                                    <span>
                                                      Overall Math:{" "}
                                                      <span className="font-medium text-foreground">
                                                        {Math.round(school.staarMathProficiency * 100)}%
                                                      </span>
                                                    </span>
                                                  )}
                                                  {school.staarReadingProficiency && (
                                                    <span>
                                                      Overall Reading:{" "}
                                                      <span className="font-medium text-foreground">
                                                        {Math.round(school.staarReadingProficiency * 100)}%
                                                      </span>
                                                    </span>
                                                  )}
                                                </div>
                                                {school.gradeLevelScores && school.gradeLevelScores.length > 0 && (
                                                  <div className="mt-2 pt-2 border-t border-border/50">
                                                    <div className="text-xs font-medium text-foreground mb-1">
                                                      Grade Level Scores:
                                                    </div>
                                                    {school.gradeLevelScores.map((gradeScore: any) => (
                                                      <div
                                                        key={gradeScore.grade}
                                                        className="flex gap-4 text-xs text-muted-foreground ml-2"
                                                      >
                                                        <span className="font-medium text-foreground">
                                                          Grade {gradeScore.grade}:
                                                        </span>
                                                        <span>Math: {Math.round(gradeScore.math * 100)}%</span>
                                                        <span>Reading: {Math.round(gradeScore.reading * 100)}%</span>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                                {school.studentCount && (
                                                  <div className="mt-1">
                                                    Students:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {school.studentCount}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Middle Schools Detail */}
                                    {middleSchools.length > 0 && (
                                      <div className="p-3 bg-purple-50/30 rounded-md border border-purple-200/50">
                                        <h5 className="font-medium text-foreground mb-3">
                                          Middle Schools ({middleSchools.length}):
                                        </h5>
                                        <div className="space-y-3">
                                          {middleSchools.map((school) => (
                                            <div
                                              key={school.campusId}
                                              className="p-2 bg-white rounded border border-border"
                                            >
                                              <div className="flex items-start justify-between mb-1">
                                                <h6 className="font-semibold text-sm text-foreground">{school.name}</h6>
                                                {school.accountabilityRating && (
                                                  <span
                                                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                      school.accountabilityRating === "A"
                                                        ? "bg-green-100 text-green-800"
                                                        : school.accountabilityRating === "B"
                                                          ? "bg-blue-100 text-blue-800"
                                                          : school.accountabilityRating === "C"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                  >
                                                    {school.accountabilityRating}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground space-y-1">
                                                <div>
                                                  {school.address}, {school.city}
                                                </div>
                                                <div className="flex gap-4 mt-1.5">
                                                  {school.staarMathProficiency && (
                                                    <span>
                                                      Math:{" "}
                                                      <span className="font-medium text-foreground">
                                                        {Math.round(school.staarMathProficiency * 100)}%
                                                      </span>
                                                    </span>
                                                  )}
                                                  {school.staarReadingProficiency && (
                                                    <span>
                                                      Reading:{" "}
                                                      <span className="font-medium text-foreground">
                                                        {Math.round(school.staarReadingProficiency * 100)}%
                                                      </span>
                                                    </span>
                                                  )}
                                                </div>
                                                {school.studentCount && (
                                                  <div className="mt-1">
                                                    Students:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {school.studentCount}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* High Schools Detail */}
                                    {highSchools.length > 0 && (
                                      <div className="p-3 bg-orange-50/30 rounded-md border border-orange-200/50">
                                        <h5 className="font-medium text-foreground mb-3">
                                          High Schools ({highSchools.length}):
                                        </h5>
                                        <div className="space-y-3">
                                          {highSchools.map((school) => (
                                            <div
                                              key={school.campusId}
                                              className="p-2 bg-white rounded border border-border"
                                            >
                                              <div className="flex items-start justify-between mb-1">
                                                <h6 className="font-semibold text-sm text-foreground">{school.name}</h6>
                                                {school.accountabilityRating && (
                                                  <span
                                                    className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                      school.accountabilityRating === "A"
                                                        ? "bg-green-100 text-green-800"
                                                        : school.accountabilityRating === "B"
                                                          ? "bg-blue-100 text-blue-800"
                                                          : school.accountabilityRating === "C"
                                                            ? "bg-yellow-100 text-yellow-800"
                                                            : "bg-gray-100 text-gray-800"
                                                    }`}
                                                  >
                                                    {school.accountabilityRating}
                                                  </span>
                                                )}
                                              </div>
                                              <div className="text-xs text-muted-foreground space-y-1">
                                                <div>
                                                  {school.address}, {school.city}
                                                </div>
                                                <div className="flex gap-4 mt-1.5">
                                                  {school.staarMathProficiency && (
                                                    <span>
                                                      Math:{" "}
                                                      <span className="font-medium text-foreground">
                                                        {Math.round(school.staarMathProficiency * 100)}%
                                                      </span>
                                                    </span>
                                                  )}
                                                  {school.staarReadingProficiency && (
                                                    <span>
                                                      Reading:{" "}
                                                      <span className="font-medium text-foreground">
                                                        {Math.round(school.staarReadingProficiency * 100)}%
                                                      </span>
                                                    </span>
                                                  )}
                                                </div>
                                                {school.studentCount && (
                                                  <div className="mt-1">
                                                    Students:{" "}
                                                    <span className="font-medium text-foreground">
                                                      {school.studentCount}
                                                    </span>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      {/* END: MERGE POINT for school data in honorable mentions */}

                      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Schools</div>
                          <div className="text-lg font-medium text-foreground">
                            {typeof result.schools === "number" ? result.schools.toFixed(1) : result.schools}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Safety</div>
                          <div className="text-lg font-medium text-foreground">{result.crime.toFixed(1)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Affordability</div>
                          <div className="text-lg font-medium text-foreground">{result.affordability.toFixed(1)}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Parks</div>
                          <div className="text-lg font-medium text-foreground">{result.parks.toFixed(1)}</div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-border pt-3">
                        <button
                          onClick={() => toggleDetails(result.zipCode)}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedCards.has(result.zipCode) ? "rotate-180" : ""
                            }`}
                          />
                          View Details
                        </button>

                        <div className="mt-3 space-y-2 pl-6">
                          {result.affordabilityGap !== undefined && Math.abs(result.affordabilityGap) < 200000 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">
                                {result.affordabilityGap > 0 ? "Over Budget By:" : "Under Budget By:"}
                              </span>
                              <span
                                className={`font-medium ${result.affordabilityGap > 0 ? "text-orange-600" : "text-green-600"}`}
                              >
                                ${Math.abs(result.affordabilityGap).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {hasCommutePreference && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Commute Time:</span>
                              <span className="text-foreground">
                                {result.commuteTime ? `${result.commuteTime} minutes` : "N/A"}
                              </span>
                            </div>
                          )}
                          {!hasCommutePreference && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Commute:</span>
                              <span className="text-muted-foreground italic">Not a priority</span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Median Home Price:</span>
                            <span className="text-foreground">
                              {result.medianHomePrice ? `$${result.medianHomePrice.toLocaleString()}` : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* START: MERGE POINT for ZIP explorer */}
      <div className="mt-12 mb-8">
        <div className="glass-card rounded-2xl overflow-hidden" style={{ backgroundColor: "rgba(247, 247, 247, 0.8)" }}>
          {/* Collapsed header - always visible */}
          <button
            onClick={() => setZipExplorerOpen(!zipExplorerOpen)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-100 to-blue-100 flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Already have a ZIP in mind?</h3>
                <p className="text-sm text-slate-500">Explore it here</p>
              </div>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${zipExplorerOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Expanded content */}
          {zipExplorerOpen && (
            <div className="px-5 pb-5 border-t border-slate-200/50">
              <p className="text-sm text-slate-600 mt-4 mb-5 leading-relaxed">
                If you've heard about a ZIP and want Sofee to break it down, enter it below. This won't change your
                recommendations — it's just extra context.
              </p>

              {/* Search input */}
              <div className="flex gap-3 mb-5">
                <input
                  type="text"
                  value={explorerZipInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 5)
                    setExplorerZipInput(val)
                    setExplorerError("")
                  }}
                  placeholder="Enter ZIP code"
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white/80 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  maxLength={5}
                />
                <Button
                  onClick={handleZipExplore}
                  disabled={explorerZipInput.length !== 5 || isExploring}
                  className="px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExploring ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search ZIP"}
                </Button>
              </div>

              {/* Error message */}
              {explorerError && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm mb-5">
                  {explorerError}
                </div>
              )}

              {/* Result card - Replace with side-by-side comparison layout */}
              {explorerResult && (
                <>
                  <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                    <GitCompareArrows className="w-5 h-5 text-blue-600" />
                    <span className="text-sm text-slate-600">Compare with:</span>
                    <input
                      type="text"
                      value={compareZip}
                      onChange={(e) => setCompareZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
                      onKeyDown={(e) => e.key === "Enter" && handleCompareZip()}
                      placeholder="Enter ZIP"
                      className="w-24 px-3 py-1.5 text-sm rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <Button
                      size="sm"
                      onClick={handleCompareZip}
                      disabled={compareZip.length !== 5 || isLoadingCompare}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoadingCompare ? <Loader2 className="w-4 h-4 animate-spin" /> : "Compare"}
                    </Button>
                    {compareResult && (
                      <button
                        onClick={() => {
                          setCompareResult(null)
                          setCompareZip("")
                        }}
                        className="ml-auto text-xs text-slate-500 hover:text-slate-700"
                      >
                        Clear comparison
                      </button>
                    )}
                  </div>

                  <div className={`grid gap-6 ${compareResult ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}>
                    {/* Primary ZIP Result */}
                    <div className="glass-card rounded-2xl p-6 border border-white/40 shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                          Power-User View — Does not affect your recommended matches
                        </span>
                      </div>

                      {/* ADDED: Tooltip for ZIP badge */}
                      <div className="flex items-center gap-3 mb-4">
                        <TooltipProvider delayDuration={200}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm cursor-help">
                                {explorerResult.zip.slice(-2)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-white px-3 py-2 rounded-lg">
                              <p className="text-sm">ZIP Code: {explorerResult.zip}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div>
                          <h4 className="font-semibold text-slate-800">
                            {explorerResult.city} {explorerResult.zip}
                          </h4>
                          <p className="text-sm text-blue-600">{explorerResult.isd}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mb-4 italic">Here's what Sofee knows about this ZIP:</p>

                      {/* Stats Grid - Updated with InfoTooltips */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                          <Home className="w-4 h-4 text-emerald-600" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-xs text-slate-500">Median Price</p>
                              <InfoTooltip category="medianPrice" />
                            </div>
                            <p className="font-semibold text-slate-800">
                              ${explorerResult.medianHomePrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                          <GraduationCap className="w-4 h-4 text-blue-600" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-xs text-slate-500">School Score</p>
                              <InfoTooltip category="schoolScore" />
                            </div>
                            <p className="font-semibold text-slate-800">{explorerResult.schoolSignal}/100</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                          <Car className="w-4 h-4 text-amber-600" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-xs text-slate-500">Avg Commute</p>
                              <InfoTooltip category="avgCommute" />
                            </div>
                            <p className="font-semibold text-slate-800">{explorerResult.commuteTime} min</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                          <Shield className="w-4 h-4 text-violet-600" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-xs text-slate-500">Safety Rating</p>
                              <InfoTooltip category="safetyRating" />
                            </div>
                            <p className="font-semibold text-slate-800">
                              {explorerResult.safetySignal === 1
                                ? "Excellent"
                                : explorerResult.safetySignal === 2
                                  ? "Very Good"
                                  : explorerResult.safetySignal === 3
                                    ? "Good"
                                    : explorerResult.safetySignal === 4
                                      ? "Fair"
                                      : "Below Avg"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                          <Utensils className="w-4 h-4 text-rose-600" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-xs text-slate-500">Restaurants</p>
                              <InfoTooltip category="restaurants" />
                            </div>
                            <p className="font-semibold text-slate-800">
                              {explorerResult.restaurantUniqueCount}+ spots
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                          <Music className="w-4 h-4 text-indigo-600" />
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-xs text-slate-500">Entertainment</p>
                              <InfoTooltip category="entertainment" />
                            </div>
                            <p className="font-semibold text-slate-800">{explorerResult.entertainmentCount} venues</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Local Vibe</span>
                          {explorerResult.localExplanation.length > 200 && (
                            <button
                              onClick={() => setVibeExpanded(!vibeExpanded)}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              {vibeExpanded ? "Show less" : "Read more"}
                              <ChevronDown
                                className={`w-3 h-3 transition-transform ${vibeExpanded ? "rotate-180" : ""}`}
                              />
                            </button>
                          )}
                        </div>
                        <p
                          className={`text-sm text-slate-700 leading-relaxed whitespace-pre-line ${!vibeExpanded && explorerResult.localExplanation.length > 200 ? "line-clamp-3" : ""}`}
                        >
                          {explorerResult.localExplanation}
                        </p>
                      </div>

                      {explorerResult.hasTownCenter && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                          <MapPin className="w-4 h-4" />
                          <span>Has a walkable town center or main street</span>
                        </div>
                      )}

                      {explorerResult.sources && explorerResult.sources.length > 0 && (
                        <p className="mt-3 text-xs text-slate-400">Data sources: {explorerResult.sources.join(", ")}</p>
                      )}
                    </div>

                    {compareResult && (
                      // ADDED: Comparison card styling and content
                      <div className="glass-card p-5 rounded-2xl border border-indigo-200/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <TooltipProvider delayDuration={200}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm cursor-help">
                                    {compareResult.zip.slice(-2)}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="bg-slate-800 text-white px-3 py-2 rounded-lg">
                                  <p className="text-sm">ZIP Code: {compareResult.zip}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <div>
                              <h4 className="font-semibold text-slate-800">
                                {compareResult.city} {compareResult.zip}
                              </h4>
                              <p className="text-sm text-indigo-600">{compareResult.isd}</p>
                            </div>
                          </div>
                          {/* CHANGE: Add comparison context label */}
                          <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            vs {explorerResult.zip}
                          </div>
                        </div>

                        {/* CHANGE: Update comparison stats to include info tooltips */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                            <Home className="w-4 h-4 text-emerald-600" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="text-xs text-slate-500">Median Price</p>
                                <InfoTooltip category="medianPrice" />
                              </div>
                              <p className="font-semibold text-slate-800">
                                ${compareResult.medianHomePrice.toLocaleString()}
                              </p>
                              <p
                                className={`text-xs ${compareResult.medianHomePrice < explorerResult.medianHomePrice ? "text-emerald-600" : compareResult.medianHomePrice > explorerResult.medianHomePrice ? "text-rose-600" : "text-slate-400"}`}
                              >
                                {compareResult.medianHomePrice === explorerResult.medianHomePrice
                                  ? "Same"
                                  : `${compareResult.medianHomePrice < explorerResult.medianHomePrice ? "" : "+"}$${Math.abs(compareResult.medianHomePrice - explorerResult.medianHomePrice).toLocaleString()}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                            <GraduationCap className="w-4 h-4 text-blue-600" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="text-xs text-slate-500">School Score</p>
                                <InfoTooltip category="schoolScore" />
                              </div>
                              <p className="font-semibold text-slate-800">{compareResult.schoolSignal}/100</p>
                              <p
                                className={`text-xs ${compareResult.schoolSignal > explorerResult.schoolSignal ? "text-emerald-600" : compareResult.schoolSignal < explorerResult.schoolSignal ? "text-rose-600" : "text-slate-400"}`}
                              >
                                {compareResult.schoolSignal === explorerResult.schoolSignal
                                  ? "Same"
                                  : `${compareResult.schoolSignal > explorerResult.schoolSignal ? "+" : ""}${compareResult.schoolSignal - explorerResult.schoolSignal} pts`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                            <Car className="w-4 h-4 text-amber-600" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="text-xs text-slate-500">Avg Commute</p>
                                <InfoTooltip category="avgCommute" />
                              </div>
                              <p className="font-semibold text-slate-800">{compareResult.commuteTime} min</p>
                              <p
                                className={`text-xs ${compareResult.commuteTime < explorerResult.commuteTime ? "text-emerald-600" : compareResult.commuteTime > explorerResult.commuteTime ? "text-rose-600" : "text-slate-400"}`}
                              >
                                {compareResult.commuteTime === explorerResult.commuteTime
                                  ? "Same"
                                  : `${compareResult.commuteTime < explorerResult.commuteTime ? "" : "+"}${compareResult.commuteTime - explorerResult.commuteTime} min`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                            <Shield className="w-4 h-4 text-violet-600" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="text-xs text-slate-500">Safety Rating</p>
                                <InfoTooltip category="safetyRating" />
                              </div>
                              <p className="font-semibold text-slate-800">
                                {compareResult.safetySignal === 1
                                  ? "Excellent"
                                  : compareResult.safetySignal === 2
                                    ? "Very Good"
                                    : compareResult.safetySignal === 3
                                      ? "Good"
                                      : compareResult.safetySignal === 4
                                        ? "Fair"
                                        : "Below Avg"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                            <Utensils className="w-4 h-4 text-rose-600" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="text-xs text-slate-500">Restaurants</p>
                                <InfoTooltip category="restaurants" />
                              </div>
                              <p className="font-semibold text-slate-800">
                                {compareResult.restaurantUniqueCount}+ spots
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 p-3 rounded-lg bg-white/60">
                            <Music className="w-4 h-4 text-indigo-600" />
                            <div className="flex-1">
                              <div className="flex items-center">
                                <p className="text-xs text-slate-500">Entertainment</p>
                                <InfoTooltip category="entertainment" />
                              </div>
                              <p className="font-semibold text-slate-800">{compareResult.entertainmentCount} venues</p>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Local Vibe for comparison */}
                        <div className="p-4 rounded-xl bg-gradient-to-br from-white/80 to-indigo-50/30 border border-indigo-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                              Local Vibe
                            </span>
                            {compareResult.localExplanation.length > 200 && (
                              <button
                                onClick={() => setCompareVibeExpanded(!compareVibeExpanded)}
                                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                              >
                                {compareVibeExpanded ? "Show less" : "Read more"}
                                <ChevronDown
                                  className={`w-3 h-3 transition-transform ${compareVibeExpanded ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </div>
                          <p
                            className={`text-sm text-slate-700 leading-relaxed whitespace-pre-line ${!compareVibeExpanded && compareResult.localExplanation.length > 200 ? "line-clamp-3" : ""}`}
                          >
                            {compareResult.localExplanation}
                          </p>
                        </div>

                        {compareResult.hasTownCenter && (
                          <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
                            <MapPin className="w-4 h-4" />
                            <span>Has a walkable town center or main street</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {/* END: MERGE POINT for ZIP explorer */}

      <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
        <GitCompareArrows className="w-5 h-5 text-blue-600" />
        <span className="text-sm text-slate-600">Compare with:</span>
        <input
          type="text"
          value={compareZip}
          onChange={(e) => setCompareZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
          onKeyDown={(e) => e.key === "Enter" && handleCompareZip()}
          placeholder="Enter ZIP"
          className="w-24 px-3 py-1.5 text-sm rounded-lg border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <Button
          size="sm"
          onClick={handleCompareZip}
          disabled={compareZip.length !== 5 || isLoadingCompare}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isLoadingCompare ? <Loader2 className="w-4 h-4 animate-spin" /> : "Compare"}
        </Button>
        {compareResult && (
          <button
            onClick={() => {
              setCompareResult(null)
              setCompareZip("")
            }}
            className="ml-auto text-xs text-slate-500 hover:text-slate-700"
          >
            Clear comparison
          </button>
        )}
      </div>

      {/* Ranking modal component */}
      {rankingModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setRankingModal(null)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Slide-up panel */}
          <div
            className="relative w-full max-w-md mx-4 mb-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 shadow-2xl border border-slate-200/50 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-white/10">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {getCriteriaLabel(rankingModal.criterion)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">All neighborhoods ranked</p>
              </div>
              <button
                onClick={() => setRankingModal(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>

            {/* Rankings list */}
            <div className="max-h-[50vh] overflow-y-auto p-2">
              {getZipsSortedByCriterion(rankingModal.criterion).map((item, idx) => {
                const isCurrentZip = item.zip === rankingModal.currentZip

                return (
                  <div
                    key={item.zip}
                    className={`flex items-center justify-between p-3 rounded-xl mb-1 transition-colors ${
                      isCurrentZip ? "bg-blue-600 text-white shadow-lg" : "hover:bg-slate-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold ${
                          idx < 3
                            ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md"
                            : isCurrentZip
                              ? "bg-white/20 text-white"
                              : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {item.rank}
                      </span>
                      <div>
                        <span
                          className={`text-sm font-semibold ${isCurrentZip ? "text-white" : "text-slate-900 dark:text-white"}`}
                        >
                          {item.city}
                        </span>
                        <span
                          className={`text-xs ml-2 ${isCurrentZip ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}
                        >
                          {item.zip}
                        </span>
                      </div>
                    </div>
                    {isCurrentZip && (
                      <span className="text-xs font-semibold text-white bg-white/20 px-2 py-1 rounded-full">You</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}
