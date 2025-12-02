// Cache utilities for storing and retrieving refreshed data

interface ZipDataPatch {
  zip: string
  medianSalePrice?: number
  rentMedian?: number
  priceUpdatedAt?: string
  schoolSignal?: number
  schoolUpdatedAt?: string
  parksCountPerSqMi?: number
  parksUpdatedAt?: string
  sources?: string[]
}

interface CacheData {
  prices: Record<string, any>
  schools: Record<string, any>
  parks: Record<string, any>
  lastUpdated: string
}

// In-memory cache fallback for environments without file system access
let memoryCache: CacheData = {
  prices: {},
  schools: {},
  parks: {},
  lastUpdated: new Date().toISOString()
}

export async function readCache(): Promise<CacheData> {
  // Try to read from localStorage on client or return memory cache on server
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('dfw-data-cache')
    if (stored) {
      return JSON.parse(stored)
    }
  }
  
  return memoryCache
}

export async function writeCache(data: CacheData): Promise<void> {
  // Update memory cache
  memoryCache = data
  
  // Try to persist to localStorage on client
  if (typeof window !== 'undefined') {
    localStorage.setItem('dfw-data-cache', JSON.stringify(data))
  }
}

export async function mergeZipData(
  category: 'prices' | 'schools' | 'parks',
  patches: ZipDataPatch[]
): Promise<number> {
  const cache = await readCache()
  
  let updatedCount = 0
  
  patches.forEach(patch => {
    if (!cache[category][patch.zip]) {
      cache[category][patch.zip] = {}
    }
    
    Object.assign(cache[category][patch.zip], patch)
    updatedCount++
  })
  
  cache.lastUpdated = new Date().toISOString()
  
  await writeCache(cache)
  
  return updatedCount
}

export async function getCachedData(): Promise<CacheData> {
  return readCache()
}
