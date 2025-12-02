# Sofee - Technical Documentation

> Last Updated: December 2024

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Sources](#data-sources)
4. [Scoring System](#scoring-system)
5. [User Preferences & Weights](#user-preferences--weights)
6. [API Endpoints](#api-endpoints)
7. [Frontend Components](#frontend-components)
8. [File Structure](#file-structure)

---

## Overview

**Sofee** is a neighborhood recommendation tool that helps families find the best ZIP codes in the Dallas-Fort Worth area based on their priorities.

### What It Does
- Covers **27 ZIP codes** in North Dallas suburbs
- Scores each ZIP on 7 weighted criteria
- Ranks neighborhoods based on user-defined priorities
- Provides detailed breakdowns including school data, safety, lifestyle amenities

### Core User Flow
1. User enters budget range (min/max)
2. User optionally enters workplace ZIP and max commute time
3. User sets priority weights (0-4) for each criterion
4. System calculates weighted scores and returns ranked results
5. User can explore individual ZIPs and compare up to 2 side-by-side

---

## Architecture

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  ┌─────────────────┐    ┌─────────────────────────────────┐ │
│  │  app/page.tsx   │    │  components/preferences-form.tsx │ │
│  │  (Home/Input)   │    │  (Budget, Weights, Inputs)       │ │
│  └────────┬────────┘    └─────────────────────────────────┘ │
│           │                                                  │
│  ┌────────▼────────┐    ┌─────────────────────────────────┐ │
│  │ app/results/    │    │  components/results-content.tsx  │ │
│  │  page.tsx       │◄───│  (Results Display, Rankings)     │ │
│  └────────┬────────┘    └─────────────────────────────────┘ │
└───────────┼─────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                         API LAYER                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  app/api/neighborhoods/route.ts                          ││
│  │  - Receives user preferences                             ││
│  │  - Loads dfwData.json                                    ││
│  │  - Calculates all scores                                 ││
│  │  - Returns ranked results                                ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  app/api/zip-lookup/route.ts                             ││
│  │  - Individual ZIP lookups for Explorer feature           ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                       DATA LAYER                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  data/dfwData.json                                       ││
│  │  - Primary data source for all 27 ZIP codes              ││
│  │  - Contains: prices, schools, safety, restaurants, etc.  ││
│  └─────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────┐│
│  │  public/data/zip_school_summaries.json                   ││
│  │  - Detailed school breakdowns per ZIP                    ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
\`\`\`

---

## Data Sources

### Primary Data File: `data/dfwData.json`

Each ZIP code entry contains:

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| `zip` | string | 5-digit ZIP code | - |
| `city` | string | City name (e.g., "Frisco") | - |
| `isd` | string | School district name | TEA/Manual |
| `medianHomePrice` | number | Median home price ($) | Zillow |
| `medianSalePrice` | number | Recent median sale price ($) | Zillow |
| `rentMedian` | number | Median rent ($) | Zillow |
| `priceUpdatedAt` | string | "YYYY-MM" of last price update | - |
| `schoolSignal` | number | 0-100 school quality score | GreatSchools/SchoolDigger |
| `schoolUpdatedAt` | string | "YYYY-MM" of last school update | - |
| `safetySignal` | number | 1-5 safety band (1=safest) | FBI Crime Statistics |
| `safetyUpdatedAt` | string | "YYYY-MM" of last safety update | - |
| `parksCountPerSqMi` | number | Parks per square mile | City Parks Depts |
| `parksUpdatedAt` | string | "YYYY-MM" of last parks update | - |
| `commuteTime` | number | Average commute time (minutes) | Census/Estimates |
| `restaurantUniqueCount` | number | Sit-down restaurants (NOT fast food) | Yelp/Manual |
| `restaurantDiversityIndex` | number | 0-1 diversity of cuisine types | Calculated |
| `entertainmentCount` | number | Entertainment venues | Yelp/Manual |
| `convenienceClusterScore` | number | 0-100 convenience score | Calculated |
| `hasTownCenter` | boolean | Has walkable town center? | Manual |
| `taxBurden` | number | Annual property tax estimate ($) | County Records |
| `percentNewConstruction` | number | % homes built after 2010 | Census |
| `localExplanation` | string | Human-written neighborhood vibe | Manual |
| `sources` | array | Data sources used | - |

### School Summaries: `public/data/zip_school_summaries.json`

Detailed school data per ZIP:

\`\`\`json
{
  "75035": {
    "isd": "Frisco ISD",
    "totalSchools": 12,
    "elementaryCount": 7,
    "middleCount": 3,
    "highCount": 2,
    "avgMathProficiency": 82,
    "avgReadingProficiency": 85,
    "percentARated": 75
  }
}
\`\`\`

---

## Scoring System

### Overview

The scoring system converts raw data into 0-100 scores, then applies user weights to produce a final ranking.

### Step 1: Raw Score Calculation

Each criterion is scored 0-100:

#### School Quality Score
\`\`\`javascript
// Directly from dfwData.json
schoolQualityScore = neighborhood.schoolSignal // Already 0-100
\`\`\`

#### Safety Score
\`\`\`javascript
// Converts safety band (1-5) to 0-100
switch (safetySignal) {
  case 1: return 100  // Safest
  case 2: return 80
  case 3: return 60
  case 4: return 40
  case 5: return 20   // Least safe
}
\`\`\`

#### Affordability Score
\`\`\`javascript
// Quantile-based: cheaper = higher score
// Compares this ZIP's price to ALL prices in dataset
affordabilityScore = toQuantileScore(medianPrice, allPrices, inverse=true)
\`\`\`

#### Commute Burden Score
\`\`\`javascript
// Lower commute = higher score
// 0 min = 100, 60 min = 0
commuteBurdenScore = Math.round(100 - (commuteTime / 60) * 100)
\`\`\`

#### Parks Score
\`\`\`javascript
// Quantile-based: more parks = higher score
parksScore = toQuantileScore(parksPerSqMi, allParks, inverse=false)
\`\`\`

#### Lifestyle/Convenience/Culture Score
\`\`\`javascript
// Weighted blend of 4 sub-scores:
const wDensity = 0.30      // Restaurant count
const wDiversity = 0.25    // Cuisine variety
const wEntertainment = 0.25 // Entertainment venues
const wConvenience = 0.20   // Convenience cluster

lifestyleScore = 
  wDensity * restaurantDensityScore +
  wDiversity * restaurantDiversityScore +
  wEntertainment * entertainmentScore +
  wConvenience * convenienceScore
\`\`\`

#### Child Development Score
\`\`\`javascript
// Average of schools + parks
childDevelopmentScore = (schoolScore + parksScore) / 2
\`\`\`

### Step 2: Weighted Scoring

User sets weights 0-4 for each criterion:

\`\`\`javascript
// For each criterion:
contribution = weight * rawScore

// Total normalized score:
normalizedScore = sumOfContributions / sumOfWeights
\`\`\`

**Example:**
- Schools: weight=4, score=90 → contribution = 360
- Safety: weight=3, score=80 → contribution = 240
- Commute: weight=2, score=70 → contribution = 140
- Total weights: 4+3+2 = 9
- Normalized: (360+240+140) / 9 = **82.2**

### Step 3: Modifiers (Bonuses/Penalties)

Small adjustments based on special preferences:

| Modifier | Condition | Effect |
|----------|-----------|--------|
| Town Center Bonus | User prefers town center + ZIP has one | +3 points |
| Quiet Penalty | User prefers quiet + ZIP has town center | -2 points |
| Late Night/Diverse Bonus | User wants diverse food + ZIP scores 70+ lifestyle | +3 points |
| Sports Heavy Bonus | User wants sports + ZIP is Frisco/Allen/McKinney | +2 points |

### Step 4: Final Score

\`\`\`javascript
finalScore = Math.max(0, Math.min(100, normalizedScore + modifiers))
\`\`\`

### Step 5: Ranking

ZIPs are sorted by finalScore descending:
- **Top 5** = "Your Top Matches"
- **Next 5** = "Honorable Mentions"
- Rest are filtered out

---

## User Preferences & Weights

### The 7 Criteria (User Can Weight 0-4)

| Criterion | Label | What It Measures | Default Weight |
|-----------|-------|------------------|----------------|
| `schoolQuality` | School Quality | Public school performance | 3 |
| `commuteBurden` | Commute Burden | Time to get to work | 3 |
| `safetyStability` | Safety & Stability | Crime rates, neighborhood stability | 3 |
| `lifestyleConvenienceCulture` | Lifestyle & Culture | Restaurants, entertainment, convenience | 3 |
| `childDevelopmentOpportunity` | Child Development | Parks, libraries, youth activities | 3 |
| `taxBurden` | Tax Burden | Property taxes + MUD rates | 3 |
| `tollRoadConvenience` | Toll Road Access | Highway/tollway accessibility | 3 |

### Weight Meanings
- **0** = "I don't care about this at all"
- **1** = "Nice to have"
- **2** = "Somewhat important"
- **3** = "Important" (default)
- **4** = "Critical / top priority"

### Budget Preferences
- **Min Budget**: Filters out ZIPs cheaper than this (assumes user wants a certain quality)
- **Max Budget**: Filters out ZIPs more expensive than this

### Commute Preferences
- **Workplace ZIP**: Used to estimate drive times (currently uses pre-calculated averages)
- **Max Commute**: Filters out ZIPs with longer commutes

---

## API Endpoints

### POST `/api/neighborhoods`

Main endpoint that returns ranked neighborhood results.

**Request Body:**
\`\`\`json
{
  "budget": 600000,
  "minBudget": 400000,
  "maxBudget": 800000,
  "workplaceZip": "75201",
  "maxCommute": 35,
  "weights": {
    "schoolQuality": 5,
    "commuteBurden": 3,
    "safetyStability": 4,
    "lifestyleConvenienceCulture": 3,
    "childDevelopmentOpportunity": 3,
    "taxBurden": 2,
    "tollRoadConvenience": 2
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "preferences": { ... },
  "topResults": [
    {
      "zipCode": "75035",
      "city": "Frisco",
      "isd": "Frisco ISD",
      "score": 87.5,
      "schools": 9.5,
      "crime": 10,
      "affordability": 6.2,
      "parks": 8.1,
      "reason": "Strong schools, excellent safety...",
      "medianHomePrice": 620000,
      "commuteTime": 35,
      "futureGrowthScore": 8.2,
      "affordabilityGap": 20000,
      "dataQuality": "High",
      "criterionRanks": {
        "schoolQuality": { "rank": 2, "total": 27, "score": 95 },
        "safetyStability": { "rank": 1, "total": 27, "score": 100 }
      }
    }
  ],
  "honorableMentions": [ ... ],
  "totalCount": 27
}
\`\`\`

### GET `/api/zip-lookup?zip=75035`

Returns detailed data for a single ZIP code.

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "zip": "75035",
    "city": "Frisco",
    "isd": "Frisco ISD",
    "medianHomePrice": 620000,
    "schoolSignal": 95,
    "safetySignal": 1,
    "commuteTime": 35,
    "restaurantUniqueCount": 45,
    "entertainmentCount": 12,
    "localExplanation": "75035 is suburban ambition in zip-code form...",
    "hasTownCenter": false
  }
}
\`\`\`

---

## Frontend Components

### Home Page (`app/page.tsx`)

- Hero section with Sofee mascot
- Embedded `<PreferencesForm />` component
- Collects all user inputs and navigates to results

### Preferences Form (`components/preferences-form.tsx`)

Sections:
1. **Budget** - Dual-handle slider ($250K - $1.5M)
2. **Location** - Workplace ZIP + Max Commute
3. **Priority Sliders** - 7 criteria, each 0-4

### Results Page (`app/results/page.tsx` + `components/results-content.tsx`)

Displays:
1. **Loading State** - Sofee "thinking" animation
2. **Top 5 Matches** - Detailed cards with scores
3. **Honorable Mentions** - Condensed cards
4. **ZIP Explorer** - Search any ZIP, compare 2 side-by-side
5. **Ranking Modal** - Click any rank to see all ZIPs ranked for that criterion

---

## File Structure

\`\`\`
family-fit-finder/
├── app/
│   ├── api/
│   │   ├── neighborhoods/route.ts   # Main scoring API
│   │   ├── zip-lookup/route.ts      # Single ZIP lookup
│   │   └── refresh/                  # Data refresh endpoints
│   ├── results/page.tsx              # Results page
│   ├── compare/page.tsx              # Compare page
│   ├── admin/page.tsx                # Admin panel
│   ├── page.tsx                      # Home page
│   ├── layout.tsx                    # Root layout
│   └── globals.css                   # Global styles
├── components/
│   ├── preferences-form.tsx          # Input form
│   ├── results-content.tsx           # Results display
│   └── ui/                           # shadcn components
├── data/
│   ├── dfwData.json                  # Primary data source
│   └── schools_raw_tea.csv           # Raw school data
├── lib/
│   ├── scoring.ts                    # Score calculation
│   ├── scoring/lifestyle.ts          # Lifestyle sub-scores
│   ├── criteria.ts                   # Criteria definitions
│   └── ...                           # Other utilities
├── public/
│   ├── data/
│   │   ├── zip_school_summaries.json # School details
│   │   └── dfwNeighborhoods.json     # Public neighborhood data
│   ├── sofee-logo.png                # Mascot
│   └── sofee-thinking.png            # Loading mascot
└── types/
    ├── zip.ts                        # ZIP type definitions
    └── schools.ts                    # School type definitions
\`\`\`

---

## Common Questions

### Q: Why does a ZIP show "Average" safety in Explorer but "10/10" in results?
**A:** The results page converts `safetySignal` (1-5) to a 0-10 scale. Safety band 1 = 10/10. The Explorer shows the categorical label. Both are from the same `safetySignal` field.

### Q: Where do restaurant/entertainment counts come from?
**A:** From `restaurantUniqueCount` and `entertainmentCount` in dfwData.json. These are sit-down restaurants (NOT fast food) and entertainment venues (bowling, movies, arcades, etc.).

### Q: How is Future Growth Score calculated?
**A:** Weighted blend of: Schools (2.5x) + Parks (1.5x) + Home Price (2x) + Commute (1x) + City bonuses (Prosper/Celina +15, Southlake/Colleyville +10, Plano/McKinney/Allen +5).

### Q: What does the "+17" in comparison mean?
**A:** When comparing two ZIPs, "+17" means this ZIP scores 17 points higher than the comparison ZIP for that criterion.

---

## Data Quality Indicators

Each result includes a `dataQuality` field:

| Rating | Meaning |
|--------|---------|
| **High** | All 4 key signals present and updated within 12 months |
| **Medium** | 2+ signals present and updated within 18 months |
| **Low** | Limited or outdated data |

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ENABLE_LIVE_DATA` | Toggle live data fetching |
| `REVALIDATE_MINUTES` | Cache revalidation time |
| `PRICES_URL` | External prices data URL |
| `SCHOOLS_URL` | External schools data URL |
| `ADMIN_TOKEN` | Admin panel access token |

---

## Future Improvements

- [ ] Real-time commute calculation via Google Maps API
- [ ] User accounts to save preferences
- [ ] More ZIPs (expand beyond North Dallas)
- [ ] Historical price trend data
- [ ] School feeder pattern visualization
