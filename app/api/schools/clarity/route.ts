import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import type { SchoolRecord } from "@/types/schools"
import { getSchoolClarityData } from "@/lib/schoolData"

export async function GET() {
  try {
    // Read schools from the normalized JSON file (SchoolDigger data)
    const filePath = path.join(process.cwd(), "public/data/schools_normalized.json")
    const fileContents = await fs.readFile(filePath, "utf-8")
    const schools: SchoolRecord[] = JSON.parse(fileContents)

    // Transform to SchoolClarityData format using the lib function
    // This applies Sofee scoring logic (academic + diversity scores)
    const clarityData = getSchoolClarityData(schools)

    return NextResponse.json({ schools: clarityData })
  } catch (error) {
    console.error("[School Clarity API] Error loading school data:", error)
    return NextResponse.json({ schools: [], error: "Failed to load school data" }, { status: 500 })
  }
}
