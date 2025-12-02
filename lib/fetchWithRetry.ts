export interface FetchOptions {
  method?: string
  body?: string
  headers?: Record<string, string>
  timeoutMs?: number
  maxRetries?: number
  retryDelayMs?: number
  specialRetryFor429?: boolean // For Overpass API
}

export async function fetchWithRetry(
  url: string, 
  options: FetchOptions = {}
): Promise<Response> {
  const {
    method = 'GET',
    body,
    headers = {},
    timeoutMs = 10000, // 10s default timeout
    maxRetries = 2,
    retryDelayMs = 2000, // 2s base delay
    specialRetryFor429 = false
  } = options

  let lastError: Error | null = null
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Create AbortController for timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
      
      const response = await fetch(url, {
        method,
        body,
        headers,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      // Special handling for 429 (rate limit)
      if (response.status === 429 && specialRetryFor429 && attempt < maxRetries) {
        console.log(`[v0] Overpass 429 rate limit hit, waiting 30s before retry...`)
        await delay(30000) // Wait 30s for Overpass
        continue
      }
      
      // Return response if successful or non-retryable error
      if (response.ok || response.status < 500) {
        return response
      }
      
      // 5xx errors are retryable
      throw new Error(`Server error: ${response.status} ${response.statusText}`)
      
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on last attempt
      if (attempt === maxRetries) {
        break
      }
      
      // Exponential backoff: 2s, 4s, 8s...
      const delayTime = retryDelayMs * Math.pow(2, attempt)
      console.log(`[v0] Fetch attempt ${attempt + 1} failed, retrying in ${delayTime}ms...`, error)
      await delay(delayTime)
    }
  }
  
  // All retries exhausted
  throw new Error(`Fetch failed after ${maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`)
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
