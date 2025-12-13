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

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    slug: "frisco-vs-mckinney",
    episodeNumber: 1,
    title: "Frisco vs. McKinney: The Showdown",
    description: "Two of North Dallas's heavyweights go head-to-head. Frisco has the Cowboys HQ and explosive growth. McKinney has the $2.2B capital plan and more room to run. Which city should families buy into for the next decade? Our hosts battle it out.",
    duration: "12 min",
    publishDate: "2025-01-15",
    audioUrl: "/audio/episode-1.mp3",
    showNotes: `## Episode Overview

In this inaugural episode of Sofee's Suburb Wars, our AI hosts go head-to-head on one of the most heated suburb debates in North Dallas: **Frisco vs. McKinney**.

---

## The Contenders

### Frisco
- Home to the Dallas Cowboys World Headquarters
- Explosive growth over the past decade
- Strong commercial tax base
- Top-rated schools
- Premium pricing

### McKinney
- $2.2B capital improvement plan
- Airport expansion creating new jobs corridor
- Historic downtown charm
- More room to run (literally)
- US-380 bypass changing accessibility

---

## Key Points Debated

1. **Growth trajectory** — Is Frisco's growth sustainable, or is McKinney better positioned?
2. **School quality** — How do the districts actually compare?
3. **Infrastructure investment** — Where is capital flowing?
4. **Entry price vs. upside** — Which offers better value?
5. **10-year outlook** — Where would you put your money?

---

## The Verdict

Listen to find out which city our hosts crowned the winner — and why the "loser" might still be the right choice for certain buyers.

---

## Resources Mentioned

- [North Dallas Capital Investment Rankings](/signals/north-dallas-investment-rankings)
- [McKinney buyers need to update their mental map](/signals/mckinney-update-mental-map)

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
