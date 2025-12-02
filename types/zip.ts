export interface ZipRawData {
  zip: string
  city: string
  isd: string // Added ISD field to identify school district
  medianHomePrice: number
  medianSalePrice?: number
  rentMedian: number
  priceUpdatedAt?: string
  schoolSignal: number
  schoolUpdatedAt?: string
  safetySignal: number
  safetyUpdatedAt?: string
  parksCountPerSqMi: number
  parksUpdatedAt?: string
  commuteTime: number
  climate: string
  sources?: string[]
  localExplanation?: string
  walkScore?: number

  // Lifestyle subcomponents
  restaurantUniqueCount: number // count of non-chain / unique restaurants
  restaurantDiversityIndex: number // 0–1, higher = more diverse cuisines
  entertainmentCount: number // kids + adult entertainment places
  convenienceClusterScore: number // 0–100, subjective convenience cluster metric

  // Town center / urban pocket flag
  hasTownCenter: boolean // e.g., downtown square, walkable district, Legacy-style area

  taxBurden: number // estimated annual property tax in dollars
  percentNewConstruction: number // 0–100, percentage of homes built post-2010
}
