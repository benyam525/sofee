import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { discoverAllDFW } from "@/lib/scrape/discoverSchoolDiggerUrls"
import { runScrapeFromUrls } from "@/lib/scrape/runScrape"
import { buildZipSummaries } from "@/lib/normalize/buildZipSummariesFromSD"

export async function POST(request: Request) {
  try {
    // Simple auth check
    const authHeader = request.headers.get("x-admin-token")
    const adminToken = process.env.ADMIN_TOKEN

    if (adminToken && authHeader !== adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const startedAt = new Date().toISOString()

    console.log("[v0] Starting SchoolDigger refresh...")

    // 1) Discover URLs
    console.log("[v0] Step 1: Discovering school URLs for 27 DFW ZIPs...")
    const urls = await discoverAllDFW(3000)

    const seedPath = path.resolve("data/sd_seed_urls.json")
    fs.mkdirSync(path.dirname(seedPath), { recursive: true })
    fs.writeFileSync(seedPath, JSON.stringify(urls, null, 2))

    console.log(`[v0] Discovered ${urls.length} school URLs`)

    // 2) Scrape school pages
    console.log("[v0] Step 2: Scraping school pages...")
    const schoolCount = await runScrapeFromUrls(urls, "public/data/schools_normalized.json", 3000)

    console.log(`[v0] Scraped ${schoolCount} schools`)

    // 3) Build ZIP summaries
    console.log("[v0] Step 3: Building ZIP-level summaries...")
    const zipCount = buildZipSummaries("public/data/schools_normalized.json", "public/data/zip_school_summaries.json")

    console.log(`[v0] Built summaries for ${zipCount} ZIPs`)

    const finishedAt = new Date().toISOString()

    return NextResponse.json({
      ok: true,
      startedAt,
      finishedAt,
      discoveredUrls: urls.length,
      schoolsWritten: schoolCount,
      zipsSummarized: zipCount,
      files: ["/public/data/schools_normalized.json", "/public/data/zip_school_summaries.json"],
    })
  } catch (error) {
    console.error("[v0] SchoolDigger refresh failed:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Refresh failed",
        ok: false,
      },
      { status: 500 },
    )
  }
}
