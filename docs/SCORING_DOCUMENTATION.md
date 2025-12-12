# Sofee Scoring System Documentation

This document explains how Sofee calculates match scores for each ZIP code based on your preferences.

---

## Overview

Your final match score (0-100) is calculated in three steps:

1. **Weighted Criteria Score** - Your priority weights applied to 7 core metrics
2. **Lifestyle Tag Modifiers** - Bonuses/penalties based on lifestyle preferences you select
3. **Special Preference Modifiers** - Small adjustments for specific neighborhood characteristics

**Formula:**
\`\`\`
Final Score = Weighted Criteria Score + Lifestyle Tag Modifiers + Special Preference Modifiers
\`\`\`

---

## Part 1: Priority Weights (Core Scoring)

You set a weight from 0-3 for each of these 7 criteria. Higher weight = more influence on your score.

| Criterion | What It Measures | Data Sources |
|-----------|------------------|--------------|
| **School Quality** | Public school performance in the district | SchoolDigger (STAAR scores), TEA accountability ratings |
| **Commute Burden** | Travel time from this ZIP to your workplace | Estimated commute times by ZIP |
| **Safety & Stability** | Crime rates and neighborhood stability | FBI UCR data, local police reports |
| **Lifestyle, Convenience & Culture** | Access to restaurants, entertainment, shopping | Yelp data, entertainment venue counts |
| **Family-Friendly Amenities** | Parks, libraries, youth sports, enrichment programs | City parks data |
| **Tax Burden** | Property tax rates including MUD districts | County tax assessor data |
| **Toll Road Convenience** | Quick access to major toll roads and highways | Proximity to DNT, PGBT, SH-121, etc. |

### How Weighted Scoring Works

Each criterion has a score from 0-100. Your final weighted score is calculated as:

\`\`\`
Weighted Score = (Weight₁ × Score₁ + Weight₂ × Score₂ + ... ) / (Weight₁ + Weight₂ + ...)
\`\`\`

**Example:**
- School Quality: Weight 4, Score 85 → Contribution: 340
- Safety: Weight 3, Score 90 → Contribution: 270
- Total Weights: 7
- Weighted Score: 610 / 7 = 87.1

**Weight Guide:**
| Weight | Meaning |
|--------|---------|
| 0 | Not a factor - doesn't affect your score |
| 1-2 | Nice to have, but not critical |
| 3 | Important consideration |
| 4-5 | Critical priority |

---

## Part 2: Lifestyle & Community Tags

Select up to 2 tags that match your vibe. Each tag applies **bonuses for strong matches** and **penalties for poor matches**, creating a 10-point spread.

### Tag Definitions & Scoring

#### 1. Quiet & Predictable
**What it means:** You want a calm, low-activity neighborhood. Minimal nightlife, predictable routines, safe streets.

**Best for:** Retirees, work-from-home professionals, families wanting peace and quiet.

| Condition | Modifier |
|-----------|----------|
| Safety Signal = Excellent (1) AND Entertainment ≤ 10 venues | **+5** |
| Safety Signal ≤ Very Good (2) AND Entertainment ≤ 15 venues | **+2** |
| Entertainment ≤ 20 venues | 0 |
| Entertainment > 20 venues (busy/noisy area) | **-5** |

---

#### 2. Sports-Heavy Community
**What it means:** You want easy access to youth sports leagues, athletic facilities, and a culture that celebrates athletics.

**Best for:** Families with kids in travel sports, fitness enthusiasts, Friday night football fans.

| Condition | Modifier |
|-----------|----------|
| Sports-focused city (Frisco/Allen/McKinney/Prosper) AND Parks ≥ 3.0/sq mi | **+5** |
| Sports city OR Parks ≥ 3.5/sq mi | **+2** |
| Parks ≥ 2.5/sq mi | 0 |
| Parks < 2.5/sq mi | **-5** |

---

#### 3. Diverse & Global Culture
**What it means:** You value ethnic diversity, international cuisine, and multicultural community feel.

**Best for:** Families wanting exposure to different cultures, foodies, globally-minded households.

| Condition | Modifier |
|-----------|----------|
| Restaurant Diversity Index ≥ 0.85 | **+5** |
| Restaurant Diversity Index ≥ 0.75 | **+2** |
| Restaurant Diversity Index ≥ 0.65 | 0 |
| Restaurant Diversity Index < 0.65 | **-5** |

*Note: Restaurant Diversity Index (0-1) measures the variety of international cuisines available in the area.*

---

#### 4. Upscale & Refined
**What it means:** You want a premium, polished feel - nice shops, high-end dining, well-maintained everything.

**Best for:** Professionals seeking status, those who prioritize aesthetics and quality.

| Condition | Modifier |
|-----------|----------|
| Median Home Price ≥ $550k AND Convenience Score ≥ 85 AND Has Town Center | **+5** |
| Median Home Price ≥ $450k AND Convenience Score ≥ 75 | **+2** |
| Median Home Price ≥ $400k AND Convenience Score ≥ 70 | 0 |
| Below thresholds | **-5** |

---

#### 5. Kid-First Suburbia
**What it means:** Everything is designed around children - great schools, tons of parks, family activities everywhere.

**Best for:** Families with young children, those prioritizing child development above all.

| Condition | Modifier |
|-----------|----------|
| Parks ≥ 3.0/sq mi AND School Score ≥ 85 AND Child Dev Score ≥ 80 | **+5** |
| Parks ≥ 2.5/sq mi AND School Score ≥ 75 AND Child Dev Score ≥ 70 | **+2** |
| Parks ≥ 2.0/sq mi AND School Score ≥ 70 | 0 |
| Below thresholds | **-5** |

---

#### 6. Near a Real Town Square
**What it means:** You want a walkable downtown area with shops, restaurants, and community gathering spaces.

**Best for:** Those who value walkability, community events, and that "small town in the big city" feel.

| Condition | Modifier |
|-----------|----------|
| Has walkable town center/main street | **+4** |
| No walkable town center | **-4** |

*Examples with town centers: Southlake Town Square, McKinney Downtown, Frisco Square, Carrollton Downtown*

---

#### 7. Late-Night Food & Scene
**What it means:** You want restaurants and entertainment options that stay open late.

**Best for:** Night owls, professionals with late schedules, social households.

| Condition | Modifier |
|-----------|----------|
| Restaurants ≥ 70 AND Entertainment ≥ 20 venues | **+5** |
| Restaurants ≥ 50 AND Entertainment ≥ 12 venues | **+2** |
| Restaurants ≥ 30 | 0 |
| Restaurants < 30 | **-5** |

---

## Part 3: Special Preferences

These are yes/no toggles for specific characteristics.

### Prefer Real Main Street or Town Square
**What it means:** Small bonus for ZIPs with walkable town centers.

| Condition | Modifier |
|-----------|----------|
| Preference ON and ZIP has town center | **+3** |
| Preference ON but user also selected "Quiet & Predictable" tag and ZIP has town center | **-2** (conflict) |

---

### Prefer Newer Construction
**What it means:** You want neighborhoods built in the last 10-15 years with modern homes.

*Note: Currently tracked for display but not directly scored. Coming soon.*

---

### Prefer Established Neighborhoods
**What it means:** You want mature trees, established communities, proven track records.

*Note: Currently tracked for display but not directly scored. Coming soon.*

---

## Understanding Your Results

### Match Score Ranges

| Score | Meaning |
|-------|---------|
| 80-100 | Excellent match - strongly aligns with your priorities |
| 70-79 | Good match - meets most of your criteria |
| 60-69 | Fair match - some trade-offs required |
| 50-59 | Weak match - significant compromises needed |
| Below 50 | Poor match - likely doesn't fit your needs |

### Budget Filtering

Before scoring, ZIPs are filtered by budget:
- **Primary results:** Median home price ≤ 110% of your max budget
- **Stretch options:** Median home price ≤ 120% of your max budget (shown separately)

### City Exclusions

Any cities you exclude are completely removed before scoring.

---

## Example Calculation

**User preferences:**
- Budget: $400k - $500k
- School Quality: Weight 3
- Safety: Weight 3
- Lifestyle: Weight 3
- Commute: Weight 0
- Tags: "Diverse & Global Culture"
- Workplace: 75201

**ZIP 75007 (Carrollton) scoring:**

1. **Weighted Score:**
   - School (78) × 3 = 234
   - Safety (70) × 3 = 210
   - Lifestyle (80) × 3 = 240
   - Other criteria...
   - Normalized: ~65/100

2. **Lifestyle Tag Modifier:**
   - Diversity Index: 0.88 (≥ 0.85) → **+5**

3. **Final Score:** 65 + 5 = **70/100**

---

## Data Sources

| Data Type | Source | Update Frequency |
|-----------|--------|------------------|
| School Ratings | SchoolDigger (STAAR scores), TEA accountability | Annually |
| Crime/Safety | FBI UCR, Local PD | Manual review |
| Home Prices | Zillow | On-demand refresh |
| Commute Times | Estimated by ZIP | Manual review |
| Restaurant Data | Yelp | Manual review |
| Tax Rates | County Assessors | Manual review |
| Parks/Recreation | City Parks Depts | On-demand refresh |

### How School Scores Are Computed

The `schoolSignal` (0-100) is the average STAAR proficiency across all public schools in the ZIP:

```
schoolSignal = (avgMathProficiency + avgReadingProficiency) / 2 × 100
```

This is the most direct measure of educational outcomes — the percentage of students performing at or above grade level.

---

## Questions?

If something doesn't make sense or you think a ZIP should rank differently, use the "Explore a ZIP" feature to compare detailed metrics side-by-side.
