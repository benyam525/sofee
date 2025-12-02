"use client"

import { Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface NeighborhoodResult {
  zipCode: string
  city?: string
  score: number
  schools: number
  crime: number
  affordability: number
  parks: number
  reason: string
  medianHomePrice?: number
  commuteTime?: number
  climate?: string
}

function getStrengths(neighborhood: NeighborhoodResult): string {
  const strengths: string[] = []

  if (neighborhood.schools >= 8.5) strengths.push("Excellent schools")
  if (neighborhood.crime >= 8) strengths.push("Very safe")
  if (neighborhood.parks >= 7.5) strengths.push("Great parks & recreation")
  if (neighborhood.affordability >= 7) strengths.push("Good value")

  return strengths.length > 0 ? strengths.join(", ") : "Balanced overall"
}

function getTradeoffs(neighborhood: NeighborhoodResult): string {
  const tradeoffs: string[] = []

  if (neighborhood.schools < 6) tradeoffs.push("Schools need improvement")
  if (neighborhood.crime < 6) tradeoffs.push("Safety concerns")
  if (neighborhood.parks < 5) tradeoffs.push("Limited recreation")
  if (neighborhood.affordability < 5) tradeoffs.push("Higher cost")
  if (neighborhood.commuteTime && neighborhood.commuteTime > 35) tradeoffs.push("Longer commute")

  return tradeoffs.length > 0 ? tradeoffs.join(", ") : "No significant tradeoffs"
}

function CompareContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const data = searchParams.get("data")
  const neighborhoods: NeighborhoodResult[] = data ? JSON.parse(decodeURIComponent(data)) : []

  if (neighborhoods.length === 0) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8">
            <Button variant="outline" onClick={() => router.back()}>
              Back to Results
            </Button>
          </div>
          <p className="text-muted-foreground">No neighborhoods to compare.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-foreground mb-2">Compare Neighborhoods</h1>
            <p className="text-muted-foreground">Side-by-side comparison of selected ZIP codes</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            Back to Results
          </Button>
        </div>

        <Card className="border border-border bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 bg-muted text-foreground font-semibold">Metric</th>
                  {neighborhoods.map((neighborhood) => (
                    <th key={neighborhood.zipCode} className="text-left p-4 bg-muted text-foreground font-semibold">
                      {neighborhood.city
                        ? `${neighborhood.city} (${neighborhood.zipCode})`
                        : `ZIP ${neighborhood.zipCode}`}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground font-medium">School Score</td>
                  {neighborhoods.map((neighborhood) => (
                    <td key={neighborhood.zipCode} className="p-4 text-foreground">
                      {neighborhood.schools}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground font-medium">Safety Score</td>
                  {neighborhoods.map((neighborhood) => (
                    <td key={neighborhood.zipCode} className="p-4 text-foreground">
                      {neighborhood.crime}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground font-medium">Median Home Price</td>
                  {neighborhoods.map((neighborhood) => (
                    <td key={neighborhood.zipCode} className="p-4 text-foreground">
                      {neighborhood.medianHomePrice ? `$${neighborhood.medianHomePrice.toLocaleString()}` : "N/A"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground font-medium">Parks Score</td>
                  {neighborhoods.map((neighborhood) => (
                    <td key={neighborhood.zipCode} className="p-4 text-foreground">
                      {neighborhood.parks}/10
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground font-medium">Commute Time</td>
                  {neighborhoods.map((neighborhood) => (
                    <td key={neighborhood.zipCode} className="p-4 text-foreground">
                      {neighborhood.commuteTime ? `${neighborhood.commuteTime} min` : "N/A"}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-border">
                  <td className="p-4 text-muted-foreground font-medium">Strengths</td>
                  {neighborhoods.map((neighborhood) => (
                    <td key={neighborhood.zipCode} className="p-4 text-foreground text-sm">
                      {getStrengths(neighborhood)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 text-muted-foreground font-medium">Tradeoffs</td>
                  {neighborhoods.map((neighborhood) => (
                    <td key={neighborhood.zipCode} className="p-4 text-foreground text-sm">
                      {getTradeoffs(neighborhood)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background p-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <div className="h-10 w-64 bg-muted animate-pulse rounded-lg mb-2" />
                <div className="h-5 w-48 bg-muted animate-pulse rounded-lg" />
              </div>
              <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
            </div>
            <div className="h-96 w-full bg-muted animate-pulse rounded-xl" />
          </div>
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  )
}
