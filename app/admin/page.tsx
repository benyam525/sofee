"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface CSVData {
  prices?: Record<string, { medianSalePrice: number; rentMedian: number; priceUpdatedAt: string; sources: string[] }>
  schools?: Record<string, { schoolSignal: number; schoolUpdatedAt: string; sources: string[] }>
  parks?: Record<string, { parksCountPerSqMi: number; parksUpdatedAt: string; sources: string[] }>
}

function parseCSV(csvText: string): Record<string, any>[] {
  const lines = csvText.trim().split("\n")
  if (lines.length < 2) return []

  const headers = lines[0].split(",").map((h) => h.trim())
  const data: Record<string, any>[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim())
    const row: Record<string, any> = {}

    headers.forEach((header, index) => {
      let value: any = values[index]

      // Try to parse as number
      if (!isNaN(Number(value)) && value !== "") {
        value = Number(value)
      }

      // Handle sources as array (assuming pipe-separated in CSV)
      if (header === "sources" && typeof value === "string") {
        value = value.split("|").map((s) => s.trim())
      }

      row[header] = value
    })

    data.push(row)
  }

  return data
}

export default function AdminPage() {
  const [csvData, setCSVData] = useState<CSVData>({})
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [useLiveData, setUseLiveData] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("use-live-data") === "true"
    }
    return false
  })
  const [refreshLogs, setRefreshLogs] = useState<Array<{ source: string; updated: number; updatedAt: string }>>([])
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isRefreshingSD, setIsRefreshingSD] = useState(false)
  const [sdStatus, setSDStatus] = useState<null | any>(null)
  const { toast } = useToast()

  const handleFileUpload = async (file: File, type: "prices" | "schools" | "parks") => {
    try {
      const text = await file.text()
      const parsed = parseCSV(text)

      // Validate expected columns
      if (parsed.length === 0) {
        throw new Error("CSV file is empty or invalid")
      }

      const firstRow = parsed[0]
      let requiredColumns: string[] = []

      if (type === "prices") {
        requiredColumns = ["zip", "medianSalePrice", "rentMedian", "priceUpdatedAt", "sources"]
      } else if (type === "schools") {
        requiredColumns = ["zip", "schoolSignal", "schoolUpdatedAt", "sources"]
      } else if (type === "parks") {
        requiredColumns = ["zip", "parksCountPerSqMi", "parksUpdatedAt", "sources"]
      }

      const missingColumns = requiredColumns.filter((col) => !(col in firstRow))
      if (missingColumns.length > 0) {
        throw new Error(`Missing required columns: ${missingColumns.join(", ")}`)
      }

      // Convert array to keyed object by ZIP
      const dataByZip: Record<string, any> = {}
      parsed.forEach((row) => {
        const zip = row.zip
        delete row.zip
        dataByZip[zip] = row
      })

      setCSVData((prev) => ({
        ...prev,
        [type]: dataByZip,
      }))

      toast({
        title: "CSV uploaded successfully",
        description: `Loaded ${parsed.length} ZIP codes from ${file.name}`,
      })
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse CSV",
        variant: "destructive",
      })
    }
  }

  const handleSaveToStorage = () => {
    const zipCount = new Set([
      ...Object.keys(csvData.prices || {}),
      ...Object.keys(csvData.schools || {}),
      ...Object.keys(csvData.parks || {}),
    ]).size

    if (zipCount === 0) {
      toast({
        title: "No data to save",
        description: "Please upload at least one CSV file",
        variant: "destructive",
      })
      return
    }

    // Store in localStorage for runtime override
    localStorage.setItem("dfw_override_data", JSON.stringify(csvData))

    toast({
      title: "Data loaded",
      description: `${zipCount} ZIPs updated in memory`,
    })

    setUploadStatus(`✓ Data loaded (${zipCount} ZIPs updated)`)
  }

  const handleClearData = () => {
    localStorage.removeItem("dfw_override_data")
    setCSVData({})
    setUploadStatus("")

    toast({
      title: "Data cleared",
      description: "Override data has been removed",
    })
  }

  const handleRefreshPrices = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/refresh/prices")
      const data = await response.json()

      if (data.success) {
        setRefreshLogs((prev) => [
          ...prev,
          {
            source: "Prices",
            updated: data.updatedCount || 0,
            updatedAt: new Date().toISOString(),
          },
        ])

        toast({
          title: "Prices refreshed",
          description: `Updated ${data.updatedCount} ZIP codes from live data`,
        })
      } else {
        throw new Error(data.error || "Failed to refresh prices")
      }
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Failed to refresh prices",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshSchools = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/refresh/schools")
      const data = await response.json()

      if (data.success) {
        setRefreshLogs((prev) => [
          ...prev,
          {
            source: "Schools",
            updated: data.updatedCount || 0,
            updatedAt: new Date().toISOString(),
          },
        ])

        toast({
          title: "Schools refreshed",
          description: `Updated ${data.updatedCount} ZIP codes from live data`,
        })
      } else {
        throw new Error(data.error || "Failed to refresh schools")
      }
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Failed to refresh schools",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshParks = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/refresh/parks")
      const data = await response.json()

      if (data.success) {
        setRefreshLogs((prev) => [
          ...prev,
          {
            source: "Parks",
            updated: data.updatedCount || 0,
            updatedAt: new Date().toISOString(),
          },
        ])

        toast({
          title: "Parks refreshed",
          description: `Updated ${data.updatedCount} ZIP codes from live data`,
        })
      } else {
        throw new Error(data.error || "Failed to refresh parks")
      }
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Failed to refresh parks",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshSchoolDigger = async () => {
    setIsRefreshingSD(true)
    setSDStatus(null)

    try {
      const response = await fetch("/api/schools/refresh", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Failed to refresh SchoolDigger data")
      }

      setSDStatus(data)

      toast({
        title: "SchoolDigger data refreshed",
        description: `Scraped ${data.schoolsWritten} schools across ${data.zipsSummarized} ZIPs`,
      })
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Failed to refresh SchoolDigger data",
        variant: "destructive",
      })
    } finally {
      setIsRefreshingSD(false)
    }
  }

  const handleToggleLiveData = () => {
    const newValue = !useLiveData
    setUseLiveData(newValue)
    localStorage.setItem("use-live-data", String(newValue))

    toast({
      title: newValue ? "Live data enabled" : "Live data disabled",
      description: newValue
        ? "App will prioritize cache, then CSV, then static JSON"
        : "App will use CSV overrides or static JSON only",
    })
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-semibold text-foreground mb-2">Data Admin</h1>
        <p className="text-muted-foreground mb-8">Upload CSV files to override neighborhood data at runtime.</p>

        <div className="space-y-6">
          {/* Live Data Refresh Section */}
          <Card className="p-6 border border-border bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">Live Data Refresh</h2>
                <p className="text-sm text-muted-foreground">Fetch latest data from external sources</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLiveData}
                  onChange={handleToggleLiveData}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-sm text-foreground">Use Live Data</span>
              </label>
            </div>

            <div className="flex gap-3 mb-4">
              <Button onClick={handleRefreshPrices} variant="outline" disabled={isRefreshing || !useLiveData}>
                Refresh Prices
              </Button>
              <Button onClick={handleRefreshSchools} variant="outline" disabled={isRefreshing || !useLiveData}>
                Refresh Schools
              </Button>
              <Button onClick={handleRefreshParks} variant="outline" disabled={isRefreshing || !useLiveData}>
                Refresh Parks
              </Button>
            </div>

            {refreshLogs.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-foreground mb-2">Refresh Log</h3>
                <div className="space-y-2">
                  {refreshLogs
                    .slice(-5)
                    .reverse()
                    .map((log, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground flex items-center gap-3">
                        <span className="font-medium">{log.source}:</span>
                        <span>{log.updated} ZIPs updated</span>
                        <span className="text-xs">{new Date(log.updatedAt).toLocaleString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </Card>

          {/* SchoolDigger Refresh Card */}
          <Card className="p-6 border border-border bg-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-1">SchoolDigger Data</h2>
                <p className="text-sm text-muted-foreground">Discover → Scrape → Rollup (DFW 27 ZIPs)</p>
              </div>
              <Button onClick={handleRefreshSchoolDigger} disabled={isRefreshingSD} variant="outline">
                {isRefreshingSD ? "Scraping... (this takes a few minutes)" : "Refresh SchoolDigger Data"}
              </Button>
            </div>

            {sdStatus && (
              <div className="border-t pt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Discovered URLs:</span>
                  <span className="font-medium">{sdStatus.discoveredUrls}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Schools written:</span>
                  <span className="font-medium">{sdStatus.schoolsWritten}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">ZIPs summarized:</span>
                  <span className="font-medium">{sdStatus.zipsSummarized}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-3">
                  Updated files: {sdStatus.files.join(", ")} — Refresh the app to see changes
                </div>
              </div>
            )}

            <div className="mt-4 text-xs text-muted-foreground">
              Note: This process respects SchoolDigger's servers with 3-second delays between requests. It may take
              several minutes to complete.
            </div>
          </Card>

          {/* Prices CSV */}
          <Card className="p-6 border border-border bg-white">
            <h2 className="text-xl font-semibold text-foreground mb-3">Prices Data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Expected columns: zip, medianSalePrice, rentMedian, priceUpdatedAt, sources
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, "prices")
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80"
            />
            {csvData.prices && (
              <p className="mt-2 text-sm text-green-600">✓ {Object.keys(csvData.prices).length} ZIPs loaded</p>
            )}
          </Card>

          {/* Schools CSV */}
          <Card className="p-6 border border-border bg-white">
            <h2 className="text-xl font-semibold text-foreground mb-3">Schools Data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Expected columns: zip, schoolSignal, schoolUpdatedAt, sources
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, "schools")
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80"
            />
            {csvData.schools && (
              <p className="mt-2 text-sm text-green-600">✓ {Object.keys(csvData.schools).length} ZIPs loaded</p>
            )}
          </Card>

          {/* Parks CSV */}
          <Card className="p-6 border border-border bg-white">
            <h2 className="text-xl font-semibold text-foreground mb-3">Parks Data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Expected columns: zip, parksCountPerSqMi, parksUpdatedAt, sources
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, "parks")
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80"
            />
            {csvData.parks && (
              <p className="mt-2 text-sm text-green-600">✓ {Object.keys(csvData.parks).length} ZIPs loaded</p>
            )}
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={handleSaveToStorage} size="lg">
              Save to Memory
            </Button>
            <Button onClick={handleClearData} variant="outline" size="lg">
              Clear Data
            </Button>
          </div>

          {uploadStatus && (
            <Card className="p-4 border border-green-200 bg-green-50">
              <p className="text-sm text-green-800">{uploadStatus}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
