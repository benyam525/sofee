import { type NextRequest, NextResponse } from "next/server"
import dfwData from "@/data/dfwData.json"

// ZIP lookup API - returns data for any ZIP in the database
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const zip = searchParams.get("zip")

  if (!zip || !/^\d{5}$/.test(zip)) {
    return NextResponse.json({ error: "Invalid ZIP code" }, { status: 400 })
  }

  try {
    const zipData = dfwData.find((z: any) => z.zip === zip)

    if (!zipData) {
      return NextResponse.json({ error: "ZIP not found" }, { status: 404 })
    }

    return NextResponse.json({
      zip: zipData.zip,
      city: zipData.city,
      isd: zipData.isd || "Unknown ISD",
      medianHomePrice: zipData.medianHomePrice,
      schoolSignal: zipData.schoolSignal,
      safetySignal: zipData.safetySignal, // Now returning the numeric 1-5 value directly
      commuteTime: zipData.commuteTime || 0,
      localExplanation: zipData.localExplanation || "No local explanation available.",
      restaurantUniqueCount: zipData.restaurantUniqueCount || 0,
      entertainmentCount: zipData.entertainmentCount || 0,
      hasTownCenter: zipData.hasTownCenter || false,
      sources: zipData.sources || [],
    })
  } catch (error) {
    console.error("ZIP lookup error:", error)
    return NextResponse.json({ error: "Failed to look up ZIP" }, { status: 500 })
  }
}
