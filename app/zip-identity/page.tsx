"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  User,
  MapPin,
  TrendingUp,
  Home,
  Shield,
  GraduationCap,
  Utensils,
  Fingerprint,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import zipPersonasData from "@/data/zipPersonas.json"

interface PersonaData {
  bestFor: string
  honestTake: string
}

const zipPersonas = zipPersonasData as Record<string, PersonaData>

// ZIP metadata for display
const zipMetadata: Record<string, { city: string; price: string; schools: number; safety: string; diversity: number }> =
  {
    // Frisco
    "75034": { city: "Frisco", price: "$650k", schools: 93, safety: "Excellent", diversity: 0.85 },
    "75035": { city: "Frisco", price: "$620k", schools: 95, safety: "Excellent", diversity: 0.75 },
    // Allen
    "75002": { city: "Allen", price: "$550k", schools: 92, safety: "Excellent", diversity: 0.72 },
    "75013": { city: "Allen", price: "$520k", schools: 90, safety: "Excellent", diversity: 0.7 },
    // McKinney
    "75069": { city: "McKinney", price: "$450k", schools: 83, safety: "Very Good", diversity: 0.74 },
    "75070": { city: "McKinney", price: "$490k", schools: 85, safety: "Very Good", diversity: 0.65 },
    "75071": { city: "McKinney", price: "$520k", schools: 86, safety: "Very Good", diversity: 0.68 },
    "75072": { city: "McKinney", price: "$540k", schools: 87, safety: "Very Good", diversity: 0.68 },
    // Plano
    "75023": { city: "Plano", price: "$480k", schools: 85, safety: "Very Good", diversity: 0.78 },
    "75024": { city: "Plano", price: "$580k", schools: 88, safety: "Very Good", diversity: 0.92 },
    "75025": { city: "Plano", price: "$520k", schools: 86, safety: "Excellent", diversity: 0.75 },
    "75074": { city: "Plano", price: "$450k", schools: 84, safety: "Very Good", diversity: 0.95 },
    "75075": { city: "Plano", price: "$520k", schools: 87, safety: "Excellent", diversity: 0.82 },
    "75093": { city: "Plano", price: "$670k", schools: 92, safety: "Excellent", diversity: 0.8 },
    // Prosper
    "75078": { city: "Prosper", price: "$700k", schools: 90, safety: "Excellent", diversity: 0.6 },
    // Celina
    "75009": { city: "Celina", price: "$550k", schools: 85, safety: "Very Good", diversity: 0.5 },
    // Flower Mound
    "75022": { city: "Flower Mound", price: "$580k", schools: 88, safety: "Excellent", diversity: 0.68 },
    "75028": { city: "Flower Mound", price: "$620k", schools: 90, safety: "Excellent", diversity: 0.7 },
    // Southlake
    "76092": { city: "Southlake", price: "$1.1M", schools: 100, safety: "Excellent", diversity: 0.82 },
    // Colleyville
    "76034": { city: "Colleyville", price: "$850k", schools: 94, safety: "Excellent", diversity: 0.72 },
    // Carrollton
    "75006": { city: "Carrollton", price: "$410k", schools: 75, safety: "Good", diversity: 0.88 },
    "75007": { city: "Carrollton", price: "$430k", schools: 78, safety: "Good", diversity: 0.88 },
    "75010": { city: "Carrollton", price: "$480k", schools: 80, safety: "Good", diversity: 0.9 },
    // Coppell
    "75019": { city: "Coppell", price: "$620k", schools: 90, safety: "Excellent", diversity: 0.7 },
    // Grand Prairie
    "75052": { city: "Grand Prairie", price: "$380k", schools: 70, safety: "Fair", diversity: 0.85 },
    // Richardson
    "75080": { city: "Richardson", price: "$450k", schools: 82, safety: "Very Good", diversity: 0.94 },
    "75081": { city: "Richardson", price: "$460k", schools: 80, safety: "Good", diversity: 0.92 },
    "75082": { city: "Richardson", price: "$470k", schools: 84, safety: "Very Good", diversity: 0.93 },
    // Irving
    "75038": { city: "Irving", price: "$390k", schools: 72, safety: "Good", diversity: 0.91 },
    "75039": { city: "Irving", price: "$410k", schools: 74, safety: "Very Good", diversity: 0.89 },
    "75062": { city: "Irving", price: "$400k", schools: 76, safety: "Very Good", diversity: 0.87 },
    // Farmers Branch
    "75234": { city: "Farmers Branch", price: "$440k", schools: 79, safety: "Very Good", diversity: 0.86 },
    "75244": { city: "Farmers Branch", price: "$460k", schools: 81, safety: "Very Good", diversity: 0.84 },
    // Lewisville
    "75067": { city: "Lewisville", price: "$420k", schools: 77, safety: "Good", diversity: 0.72 },
    "75077": { city: "Lewisville", price: "$500k", schools: 82, safety: "Very Good", diversity: 0.76 },
  }

// Group ZIPs by city for browsing
const zipsByCity = Object.entries(zipMetadata).reduce(
  (acc, [zip, meta]) => {
    if (!acc[meta.city]) acc[meta.city] = []
    acc[meta.city].push({ zip, ...meta })
    return acc
  },
  {} as Record<
    string,
    Array<{ zip: string; city: string; price: string; schools: number; safety: string; diversity: number }>
  >,
)

// Sort cities alphabetically
const sortedCities = Object.keys(zipsByCity).sort()

function ZipIdentityContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const zipCode = searchParams.get("zip")

  const persona = zipCode ? zipPersonas[zipCode] : null
  const meta = zipCode ? zipMetadata[zipCode] : null

  const safetyColor = (safety: string) =>
    ({
      Excellent: "text-emerald-600 bg-emerald-50",
      "Very Good": "text-blue-600 bg-blue-50",
      Good: "text-amber-600 bg-amber-50",
      Fair: "text-orange-600 bg-orange-50",
    })[safety] || "text-slate-600 bg-slate-50"

  if (!zipCode || !persona || !meta) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push("/results")} className="text-slate-600 px-2 sm:px-3">
                <ArrowLeft className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Back to Results</span>
              </Button>
              <div className="h-4 w-px bg-slate-200" />
              <span className="text-xs sm:text-sm text-slate-500">ZIP Identity Profiles™</span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
          {/* Hero */}
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 sm:mb-4">
              <Fingerprint className="h-6 sm:h-8 w-6 sm:w-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3">ZIP Identity Profiles™</h1>
            <p className="text-sm sm:text-lg text-slate-600 max-w-xl mx-auto px-2">
              Honest, data-driven insights about who each ZIP code is really for.
            </p>
          </div>

          {/* Browse by City */}
          <div className="space-y-5 sm:space-y-6">
            {sortedCities.map((city) => (
              <div key={city}>
                <h2 className="text-base sm:text-lg font-semibold text-slate-900 mb-2 sm:mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {city}
                </h2>
                <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                  {zipsByCity[city].map((item) => (
                    <Card
                      key={item.zip}
                      className="p-3 sm:p-4 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group"
                      onClick={() => router.push(`/zip-identity?zip=${item.zip}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {item.zip}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            {item.price} • Schools: {item.schools}/100
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                      </div>
                      <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 sm:mt-2 line-clamp-1">
                        {zipPersonas[item.zip]?.bestFor || "Profile available"}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Data Sources */}
          <div className="text-center pt-6 sm:pt-8 mt-6 sm:mt-8 border-t border-slate-100">
            <p className="text-[10px] sm:text-xs text-slate-400 px-2">
              Analysis based on median home prices, GreatSchools ratings, FBI crime statistics, restaurant diversity
              index, and amenity density data. Updated monthly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show individual ZIP profile
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/zip-identity")} className="text-slate-600 px-2 sm:px-3">
              <ArrowLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">All Profiles</span>
            </Button>
            <div className="h-4 w-px bg-slate-200" />
            <span className="text-xs sm:text-sm text-slate-500">ZIP Identity Profiles™</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Hero */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-1 sm:mb-2">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>{meta.city}, TX</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">{zipCode}</h1>
          <p className="text-sm sm:text-lg text-slate-600">Honest insights powered by data, not vibes.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Card className="p-2.5 sm:p-3 text-center">
            <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base sm:text-lg font-semibold text-slate-900">{meta.price}</p>
            <p className="text-[10px] sm:text-xs text-slate-500">Median Price</p>
          </Card>
          <Card className="p-2.5 sm:p-3 text-center">
            <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base sm:text-lg font-semibold text-slate-900">{meta.schools}/100</p>
            <p className="text-[10px] sm:text-xs text-slate-500">School Score</p>
          </Card>
          <Card className="p-2.5 sm:p-3 text-center">
            <Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 mx-auto mb-1" />
            <p className={`text-xs sm:text-sm font-semibold px-1.5 sm:px-2 py-0.5 rounded-full inline-block ${safetyColor(meta.safety)}`}>
              {meta.safety}
            </p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">Safety</p>
          </Card>
          <Card className="p-2.5 sm:p-3 text-center">
            <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 mx-auto mb-1" />
            <p className="text-base sm:text-lg font-semibold text-slate-900">{Math.round(meta.diversity * 100)}%</p>
            <p className="text-[10px] sm:text-xs text-slate-500">Diversity Index</p>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Best For */}
          <Card className="overflow-hidden">
            <div className="bg-emerald-50 px-4 sm:px-5 py-2.5 sm:py-3 border-b border-emerald-100">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                <h2 className="text-sm sm:text-base font-semibold text-emerald-900">Best For</h2>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{persona.bestFor}</p>
            </div>
          </Card>

          {/* The Real Talk */}
          <Card className="overflow-hidden">
            <div className="bg-amber-50 px-4 sm:px-5 py-2.5 sm:py-3 border-b border-amber-100">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
                <h2 className="text-sm sm:text-base font-semibold text-amber-900">The Real Talk</h2>
              </div>
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed italic">"{persona.honestTake}"</p>
            </div>
          </Card>

          {/* Data Sources */}
          <div className="text-center pt-4 border-t border-slate-100">
            <p className="text-[10px] sm:text-xs text-slate-400 px-2">
              Analysis based on median home prices, GreatSchools ratings, FBI crime statistics, restaurant diversity
              index, and amenity density data. Updated monthly.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:justify-center gap-2 sm:gap-3">
          <Button onClick={() => router.push(`/civic?zip=${zipCode}`)} variant="outline" className="w-full sm:w-auto">
            View Civic Profile
          </Button>
          <Button onClick={() => router.push("/results")} className="w-full sm:w-auto">Back to Results</Button>
        </div>
      </div>
    </div>
  )
}

export default function ZipIdentityPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Loading profiles...</div>
        </div>
      }
    >
      <ZipIdentityContent />
    </Suspense>
  )
}
