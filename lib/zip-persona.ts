/**
 * ZIP Persona Generator
 * Creates data-driven, 1-2 line descriptions of who a ZIP code is best suited for
 * based on actual metrics, not vibes.
 */

export interface ZipMetrics {
  zipCode: string
  city: string
  medianHomePrice: number
  schoolScore: number // 0-100
  safetySignal: number // 1 = Excellent, 2 = Very Good, 3 = Good, 4 = Fair
  commuteTime: number // minutes
  restaurantCount: number
  entertainmentCount: number
  diversityIndex: number // 0-1
  parksPerSqMi: number
  hasTownCenter: boolean
  convenienceScore: number // 0-100
  taxBurden: number
  percentNewConstruction: number
}

interface PersonaProfile {
  id: string
  label: string
  icon: string
  shortDesc: string
}

// Define persona archetypes
const PERSONAS: PersonaProfile[] = [
  { id: "young-family", label: "Young Families", icon: "👨‍👩‍👧", shortDesc: "growing families with young kids" },
  {
    id: "established-family",
    label: "Established Families",
    icon: "👨‍👩‍👧‍👦",
    shortDesc: "families with school-age children",
  },
  {
    id: "young-professional",
    label: "Young Professionals",
    icon: "💼",
    shortDesc: "career-focused singles and couples",
  },
  { id: "empty-nester", label: "Empty Nesters", icon: "🏡", shortDesc: "couples whose kids have moved out" },
  { id: "retiree", label: "Retirees", icon: "🌅", shortDesc: "those enjoying retirement" },
  {
    id: "budget-conscious",
    label: "Budget-Conscious Buyers",
    icon: "💰",
    shortDesc: "value-seekers maximizing their dollar",
  },
  { id: "luxury-seeker", label: "Luxury Seekers", icon: "✨", shortDesc: "those who want premium everything" },
  { id: "urban-suburbanite", label: "Urban Suburbanites", icon: "🏙️", shortDesc: "city lovers who want more space" },
  {
    id: "outdoor-enthusiast",
    label: "Outdoor Enthusiasts",
    icon: "🌳",
    shortDesc: "those who prioritize parks and nature",
  },
  { id: "foodie", label: "Foodies & Culture Seekers", icon: "🍽️", shortDesc: "those who value dining and diversity" },
]

interface PersonaMatch {
  persona: PersonaProfile
  score: number
  reasons: string[]
}

/**
 * Calculates how well a ZIP matches each persona based on data
 */
function scorePersonaMatch(metrics: ZipMetrics, persona: PersonaProfile): PersonaMatch {
  let score = 0
  const reasons: string[] = []

  switch (persona.id) {
    case "young-family":
      // Values: good schools, safety, parks, moderate price, family amenities
      if (metrics.schoolScore >= 75) {
        score += 25
        reasons.push("strong schools")
      }
      if (metrics.safetySignal <= 2) {
        score += 25
        reasons.push("safe neighborhood")
      }
      if (metrics.parksPerSqMi >= 2.5) {
        score += 20
        reasons.push("plenty of parks")
      }
      if (metrics.medianHomePrice <= 550000) {
        score += 15
        reasons.push("affordable entry point")
      }
      if (metrics.percentNewConstruction >= 40) {
        score += 15
        reasons.push("newer homes")
      }
      break

    case "established-family":
      // Values: top schools, excellent safety, established neighborhoods
      if (metrics.schoolScore >= 85) {
        score += 35
        reasons.push("top-tier schools")
      }
      if (metrics.safetySignal === 1) {
        score += 30
        reasons.push("excellent safety")
      }
      if (metrics.percentNewConstruction < 50) {
        score += 15
        reasons.push("established community")
      }
      if (metrics.parksPerSqMi >= 2.0) {
        score += 10
        reasons.push("family recreation")
      }
      if (metrics.convenienceScore >= 80) {
        score += 10
        reasons.push("convenient amenities")
      }
      break

    case "young-professional":
      // Values: nightlife, dining, shorter commute, urban feel, diversity
      if (metrics.restaurantCount >= 60) {
        score += 25
        reasons.push("vibrant dining scene")
      }
      if (metrics.entertainmentCount >= 15) {
        score += 20
        reasons.push("nightlife options")
      }
      if (metrics.commuteTime <= 25) {
        score += 20
        reasons.push("short commute")
      }
      if (metrics.diversityIndex >= 0.8) {
        score += 20
        reasons.push("diverse community")
      }
      if (metrics.hasTownCenter) {
        score += 15
        reasons.push("walkable town center")
      }
      break

    case "empty-nester":
      // Values: convenience, dining, walkability, lower maintenance, safety
      if (metrics.hasTownCenter) {
        score += 25
        reasons.push("walkable lifestyle")
      }
      if (metrics.restaurantCount >= 50) {
        score += 20
        reasons.push("dining variety")
      }
      if (metrics.safetySignal <= 2) {
        score += 20
        reasons.push("safe area")
      }
      if (metrics.convenienceScore >= 85) {
        score += 20
        reasons.push("convenient location")
      }
      if (metrics.percentNewConstruction >= 30) {
        score += 15
        reasons.push("low-maintenance homes")
      }
      break

    case "retiree":
      // Values: safety, low tax, quiet, healthcare access (convenience proxy)
      if (metrics.safetySignal === 1) {
        score += 30
        reasons.push("excellent safety")
      }
      if (metrics.taxBurden <= 12000) {
        score += 25
        reasons.push("lower taxes")
      }
      if (metrics.entertainmentCount <= 12) {
        score += 15
        reasons.push("quieter atmosphere")
      }
      if (metrics.convenienceScore >= 75) {
        score += 15
        reasons.push("accessible amenities")
      }
      if (metrics.parksPerSqMi >= 2.0) {
        score += 15
        reasons.push("outdoor spaces")
      }
      break

    case "budget-conscious":
      // Values: affordability above all, decent schools, safety
      if (metrics.medianHomePrice <= 450000) {
        score += 35
        reasons.push("affordable homes")
      }
      if (metrics.taxBurden <= 11000) {
        score += 25
        reasons.push("lower tax burden")
      }
      if (metrics.schoolScore >= 70) {
        score += 20
        reasons.push("solid schools")
      }
      if (metrics.safetySignal <= 3) {
        score += 20
        reasons.push("reasonable safety")
      }
      break

    case "luxury-seeker":
      // Values: premium everything - top schools, safety, amenities, dining
      if (metrics.medianHomePrice >= 600000) {
        score += 20
        reasons.push("premium homes")
      }
      if (metrics.schoolScore >= 90) {
        score += 25
        reasons.push("elite schools")
      }
      if (metrics.safetySignal === 1) {
        score += 20
        reasons.push("top safety")
      }
      if (metrics.convenienceScore >= 90) {
        score += 20
        reasons.push("premium amenities")
      }
      if (metrics.restaurantCount >= 70) {
        score += 15
        reasons.push("upscale dining")
      }
      break

    case "urban-suburbanite":
      // Values: diversity, dining, entertainment, town center, shorter commute
      if (metrics.diversityIndex >= 0.8) {
        score += 25
        reasons.push("cultural diversity")
      }
      if (metrics.restaurantCount >= 60) {
        score += 20
        reasons.push("restaurant variety")
      }
      if (metrics.hasTownCenter) {
        score += 20
        reasons.push("urban-style town center")
      }
      if (metrics.commuteTime <= 30) {
        score += 20
        reasons.push("city-accessible")
      }
      if (metrics.entertainmentCount >= 12) {
        score += 15
        reasons.push("entertainment options")
      }
      break

    case "outdoor-enthusiast":
      // Values: parks, trails, green space, family-friendly outdoor culture
      if (metrics.parksPerSqMi >= 3.0) {
        score += 35
        reasons.push("abundant parks")
      }
      if (metrics.parksPerSqMi >= 2.5) {
        score += 15
        reasons.push("good green space")
      }
      if (metrics.safetySignal <= 2) {
        score += 20
        reasons.push("safe outdoor activities")
      }
      if (metrics.schoolScore >= 75) {
        score += 15
        reasons.push("active school sports")
      }
      if (metrics.entertainmentCount <= 15) {
        score += 15
        reasons.push("nature-focused lifestyle")
      }
      break

    case "foodie":
      // Values: restaurant diversity, dining count, cultural diversity
      if (metrics.diversityIndex >= 0.85) {
        score += 30
        reasons.push("highly diverse cuisines")
      }
      if (metrics.restaurantCount >= 70) {
        score += 30
        reasons.push("extensive dining options")
      }
      if (metrics.hasTownCenter) {
        score += 20
        reasons.push("walkable dining district")
      }
      if (metrics.entertainmentCount >= 15) {
        score += 20
        reasons.push("cultural venues")
      }
      break
  }

  return { persona, score, reasons }
}

/**
 * Generates a data-driven persona snapshot for a ZIP code
 * Returns 1-2 sentences describing who this ZIP is best for
 */
export function generateZipPersona(metrics: ZipMetrics): {
  headline: string
  personas: PersonaMatch[]
} {
  // Score all personas
  const matches = PERSONAS.map((persona) => scorePersonaMatch(metrics, persona)).sort((a, b) => b.score - a.score)

  // Get top 2 matches with score >= 50
  const topMatches = matches.filter((m) => m.score >= 50).slice(0, 2)

  if (topMatches.length === 0) {
    // Fallback - use top match regardless of score
    topMatches.push(matches[0])
  }

  // Generate headline based on top matches
  let headline: string

  if (topMatches.length === 1) {
    const match = topMatches[0]
    const topReasons = match.reasons.slice(0, 2).join(" and ")
    headline = `Best suited for ${match.persona.shortDesc} who value ${topReasons}.`
  } else {
    const primary = topMatches[0]
    const secondary = topMatches[1]
    headline = `Ideal for ${primary.persona.shortDesc} and ${secondary.persona.shortDesc} — offers ${primary.reasons[0]} with ${secondary.reasons[0]}.`
  }

  return {
    headline,
    personas: topMatches,
  }
}

/**
 * Generates a persona matrix showing fit scores across all personas
 * For use in a pro feature visualization
 */
export function generatePersonaMatrix(metrics: ZipMetrics): {
  zipCode: string
  city: string
  scores: Array<{
    persona: string
    label: string
    icon: string
    score: number
    fit: "excellent" | "good" | "moderate" | "low"
    topReasons: string[]
  }>
} {
  const matches = PERSONAS.map((persona) => scorePersonaMatch(metrics, persona))

  return {
    zipCode: metrics.zipCode,
    city: metrics.city,
    scores: matches.map((m) => ({
      persona: m.persona.id,
      label: m.persona.label,
      icon: m.persona.icon,
      score: m.score,
      fit: m.score >= 75 ? "excellent" : m.score >= 50 ? "good" : m.score >= 30 ? "moderate" : "low",
      topReasons: m.reasons.slice(0, 2),
    })),
  }
}
