/**
 * API Route: Check School Data Status
 *
 * Returns which ZIPs have complete school data with demographics
 * and which need to be scraped.
 */

import { NextResponse } from "next/server"
import schoolsData from "@/public/data/schools_normalized.json"
import { getSupportedZips, hasSchoolDataForZip, getMissingZips, hasAllSchoolData } from "@/lib/schoolData"
import type { SchoolRecord } from "@/types/schools"

export async function GET() {
  const schools = schoolsData as SchoolRecord[]
  const supportedZips = getSupportedZips()

  // Check each ZIP
  const zipStatus = supportedZips.map((zip) => ({
    zip,
    hasData: hasSchoolDataForZip(zip, schools),
    schoolCount: schools.filter((s) => s.zip === zip).length,
    withDemographics: schools.filter((s) => s.zip === zip && s.demographics).length,
  }))

  const missingZips = getMissingZips(schools)
  const allComplete = hasAllSchoolData(schools)

  return NextResponse.json({
    totalZips: supportedZips.length,
    completeZips: supportedZips.length - missingZips.length,
    missingZips,
    allComplete,
    zipStatus,
    totalSchools: schools.length,
    schoolsWithDemographics: schools.filter((s) => s.demographics).length,
  })
}
