export interface PodcastEpisode {
  slug: string
  episodeNumber: number
  title: string
  description: string
  duration: string
  publishDate: string
  audioUrl: string
  showNotes: string
}

export const SPOTIFY_SHOW_URL = "https://open.spotify.com/show/4M9fP1ntWmlP8MuQnkSQdX"

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    slug: "lewisville-vs-carrollton",
    episodeNumber: 4,
    title: "Lewisville vs. Carrollton: DFW Suburban Strategy Showdown",
    description: "Two of North Dallas's most underestimated cities go head-to-head—one betting on reinvention and lake-life vibes, the other winning quietly with transit, diversity, and unbeatable location. It's comeback energy versus central-city leverage, and the gap between hype and reality gets exposed fast.",
    duration: "17 min",
    publishDate: "2025-01-12",
    audioUrl: "/audio/Lewisville_vs_Carrollton_DFW_Suburban_Strategy_Showdown.mp3",
    showNotes: `## Episode Overview

Lewisville vs. Carrollton — two cities that rarely make the "best suburbs" lists but might be the smartest plays in North Dallas right now.

---

## The Contenders

### Lewisville
- Lake Lewisville lifestyle and recreation
- Vista Ridge mall transformation
- Transit-oriented development
- Aggressive reinvention strategy
- Lower entry prices

### Carrollton
- DART rail access to downtown Dallas
- Exceptional cultural diversity
- Central location advantages
- Stable, established neighborhoods
- Strong school options

---

## Key Points Debated

1. **Location leverage** — Which city's geography pays off more?
2. **Transit access** — How much does rail connectivity matter?
3. **Reinvention vs. stability** — Different strategies, different risks
4. **Value proposition** — Where does your dollar go further?
5. **5-year outlook** — Which underdog has more upside?

---

## Related Signals

- [Lewisville might be the most misunderstood suburb in DFW](/signals/lewisville-misunderstood-suburb)

---

*Have a suburb matchup you want us to debate? Let us know!*`,
  },
  {
    slug: "frisco-vs-mckinney",
    episodeNumber: 3,
    title: "Frisco vs. McKinney: Economic Showdown",
    description: "Frisco vs. McKinney is a no-holds-barred debate between proven polish and long-game potential—one city flexing finished infrastructure, the other betting big on what's coming next. If you're choosing between certainty today and upside tomorrow, this episode puts the data (and the trash talk) on the table.",
    duration: "15 min",
    publishDate: "2025-01-10",
    audioUrl: "/audio/Frisco_Versus_McKinney_Economic_Showdown.mp3",
    showNotes: `## Episode Overview

The ultimate North Dallas heavyweight matchup: Frisco's proven track record versus McKinney's massive growth potential.

---

## The Contenders

### Frisco
- Dallas Cowboys World Headquarters
- $5 Billion Mile commercial corridor
- Finished infrastructure
- Premium school district
- Top-tier amenities already built

### McKinney
- $2.2B capital improvement plan
- Airport expansion and jobs corridor
- US-380 bypass opening new areas
- Historic downtown character
- More room for appreciation

---

## Key Points Debated

1. **Proven vs. potential** — Is Frisco's premium justified?
2. **Infrastructure timing** — Built now vs. coming soon
3. **School districts** — How do they really compare?
4. **Entry price analysis** — Value per square foot breakdown
5. **10-year outlook** — Which city wins long-term?

---

## Related Signals

- [North Dallas Capital Investment Rankings](/signals/north-dallas-investment-rankings)
- [McKinney buyers need to update their mental map](/signals/mckinney-update-mental-map)

---

*Have a suburb matchup you want us to debate? Let us know!*`,
  },
  {
    slug: "frisco-vs-prosper",
    episodeNumber: 2,
    title: "Frisco vs. Prosper: Real Estate Battle",
    description: "Frisco vs. Prosper is the North Dallas civil war nobody admits they're in — proven power versus protected potential, density versus discipline, new money versus newer money. One city already won the growth game, the other is betting it can win by refusing to play it the same way.",
    duration: "12 min",
    publishDate: "2025-01-08",
    audioUrl: "/audio/Frisco_Versus_Prosper_Real_Estate_Battle.mp3",
    showNotes: `## Episode Overview

The North Dallas civil war: Frisco's explosive growth model versus Prosper's intentional scarcity strategy.

---

## The Contenders

### Frisco
- Proven growth powerhouse
- Massive commercial tax base
- Full amenity buildout
- Higher density development
- Premium but justified pricing

### Prosper
- Intentional growth limits
- Scarcity-driven value protection
- Lower density by design
- Strong school focus
- Newer money, newer homes

---

## Key Points Debated

1. **Growth philosophy** — Expansion vs. exclusivity
2. **Density tradeoffs** — What do you gain and lose?
3. **Tax base stability** — Commercial vs. residential reliance
4. **School comparison** — Both are strong, but different
5. **Which model wins?** — Depends on what you're optimizing for

---

## Related Signals

- [Prosper is intentionally slowing things down](/signals/prosper-slowing-down-intentionally)

---

*Have a suburb matchup you want us to debate? Let us know!*`,
  },
  {
    slug: "richardson-vs-plano",
    episodeNumber: 1,
    title: "Richardson Reinvention vs. Plano Stability",
    description: "Two fully built North Dallas heavyweights go head-to-head over who actually evolved instead of just aging well. Richardson argues reinvention, transit, and real-world diversity; Plano fires back with corporate gravity, polish, and stability—leaving listeners to decide which city truly understands 2025 families.",
    duration: "8 min",
    publishDate: "2025-01-05",
    audioUrl: "/audio/Richardson_Reinvention_Versus_Plano_Stability.mp3",
    showNotes: `## Episode Overview

The inaugural episode of Sofee's Suburb Wars pits two mature North Dallas giants against each other: Richardson's reinvention story versus Plano's stability play.

---

## The Contenders

### Richardson
- Silver Line transit expansion
- UTD and innovation corridor
- Real demographic diversity
- Aggressive reinvestment strategy
- Lower entry prices, higher upside?

### Plano
- $650M+ reinvestment bond
- Legacy West and corporate HQs
- Established excellence
- Protection mode activated
- Premium pricing, stable floor

---

## Key Points Debated

1. **Reinvention vs. protection** — Different strategies for mature suburbs
2. **Transit impact** — How much does Silver Line change things?
3. **Corporate gravity** — Plano's trump card
4. **Diversity factor** — Richardson's real-world advantage
5. **Who's better for 2025 families?** — It depends on what you value

---

## Related Signals

- [Frisco is overrated — Richardson is where the upside is](/signals/frisco-overrated-richardson-upside)
- [Plano isn't dying — it's a mature suburb](/signals/plano-not-dying-mature-suburb)

---

*Have a suburb matchup you want us to debate? Let us know!*`,
  },
]

export function getEpisodeBySlug(slug: string): PodcastEpisode | undefined {
  return PODCAST_EPISODES.find((episode) => episode.slug === slug)
}

export function getAllEpisodes(): PodcastEpisode[] {
  return PODCAST_EPISODES.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
}

export function getLatestEpisode(): PodcastEpisode | undefined {
  const sorted = getAllEpisodes()
  return sorted[0]
}
