"use client"

import { useState, useEffect } from "react"
import { SchoolClarityGrid } from "@/components/school-clarity-grid"
import type { SchoolClarityData } from "@/lib/schoolData"

// Fallback sample data in case API fails
const FALLBACK_SCHOOLS: SchoolClarityData[] = [
  {
    campusId: "1",
    name: "McCoy Elementary",
    zip: "75007",
    city: "Carrollton",
    district: "Carrollton-Farmers Branch ISD",
    level: "ES",
    gradeSpan: "PK-5",
    enrollment: 480,
    fitScore: 80,
    fitLabel: "Excellent Fit",
    academicScore: 85,
    academicLabel: "Strong Academics",
    diversityScore: 75,
    diversityLabel: "Well Balanced",
    demographics: { white: 23, hispanic: 37, black: 15, asian: 20, other: 5 },
    proficiency: { math: 85, reading: 87 },
    stateRank: 138,
    stateTotal: 4651,
    schoolType: "Public",
  },
  {
    campusId: "2",
    name: "Kent Elementary",
    zip: "75007",
    city: "Carrollton",
    district: "Carrollton-Farmers Branch ISD",
    level: "ES",
    gradeSpan: "PK-5",
    enrollment: 430,
    fitScore: 73,
    fitLabel: "Great Fit",
    academicScore: 68,
    academicLabel: "Solid Academics",
    diversityScore: 77,
    diversityLabel: "Well Balanced",
    demographics: { white: 20, hispanic: 40, black: 15, asian: 20, other: 5 },
    proficiency: { math: 73, reading: 75 },
    stateRank: 441,
    stateTotal: 4651,
    schoolType: "Public",
  },
  {
    campusId: "3",
    name: "Country Place Elementary",
    zip: "75007",
    city: "Carrollton",
    district: "Carrollton-Farmers Branch ISD",
    level: "ES",
    gradeSpan: "PK-5",
    enrollment: 379,
    fitScore: 74,
    fitLabel: "Great Fit",
    academicScore: 70,
    academicLabel: "Solid Academics",
    diversityScore: 78,
    diversityLabel: "Well Balanced",
    demographics: { white: 22, hispanic: 38, black: 13, asian: 22, other: 5 },
    proficiency: { math: 70, reading: 78 },
    stateRank: 575,
    stateTotal: 4651,
    schoolType: "Public",
  },
  {
    campusId: "4",
    name: "Rosemeade Elementary",
    zip: "75007",
    city: "Carrollton",
    district: "Carrollton-Farmers Branch ISD",
    level: "ES",
    gradeSpan: "PK-5",
    enrollment: 392,
    fitScore: 72,
    fitLabel: "Great Fit",
    academicScore: 66,
    academicLabel: "Solid Academics",
    diversityScore: 77,
    diversityLabel: "Well Balanced",
    demographics: { white: 23, hispanic: 37, black: 13, asian: 22, other: 5 },
    proficiency: { math: 77, reading: 79 },
    stateRank: 628,
    stateTotal: 4651,
    schoolType: "Public",
  },
  {
    campusId: "5",
    name: "Furneaux Elementary",
    zip: "75007",
    city: "Carrollton",
    district: "Carrollton-Farmers Branch ISD",
    level: "ES",
    gradeSpan: "PK-5",
    enrollment: 336,
    fitScore: 64,
    fitLabel: "Good Fit",
    academicScore: 52,
    academicLabel: "Below Average",
    diversityScore: 75,
    diversityLabel: "Well Balanced",
    demographics: { white: 18, hispanic: 42, black: 15, asian: 20, other: 5 },
    proficiency: { math: 72, reading: 76 },
    stateRank: 1181,
    stateTotal: 4651,
    schoolType: "Public",
  },
]

export default function SchoolClarityPage() {
  const [schools, setSchools] = useState<SchoolClarityData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPremiumUnlocked, setIsPremiumUnlocked] = useState(true) // Default unlocked for demo

  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await fetch("/api/schools/clarity")
        const data = await res.json()
        if (data.schools && data.schools.length > 0) {
          setSchools(data.schools)
        } else {
          // Fallback to sample data if no schools found
          setSchools(FALLBACK_SCHOOLS)
        }
      } catch (err) {
        console.error("[v0] Failed to fetch schools:", err)
        setError("Failed to load school data")
        setSchools(FALLBACK_SCHOOLS)
      } finally {
        setLoading(false)
      }
    }
    fetchSchools()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Loading school data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">School Clarity Grid</h1>
          <p className="text-slate-600 mb-3">
            See how schools stack up on academics AND demographic balance. Click any school to dig into the details.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <strong>A note on "Demographic Balance":</strong> This isn't a judgment on whether a school is "diverse enough." We simply measure how evenly the student body is split across racial groups. A school that's 60% White scores the same as one that's 60% Hispanic — both have one dominant group. We show you the data; you decide what matters for your family.
          </div>
          {error && <p className="text-amber-600 text-sm mt-2">Using sample data: {error}</p>}
        </div>

        <SchoolClarityGrid
          schools={schools}
          isPremium={isPremiumUnlocked}
          onUnlock={() => setIsPremiumUnlocked(true)}
        />
      </div>
    </div>
  )
}
