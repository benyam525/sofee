export interface SignalArticle {
  slug: string
  title: string
  excerpt: string
  publishDate: string
  readTime: string
  content: string
  featured: boolean
}

export const SIGNAL_ARTICLES: SignalArticle[] = [
  {
    slug: "north-dallas-investment-rankings",
    title: "North Dallas Capital Investment Rankings: 2025",
    excerpt: "A data-driven ranking of which North Dallas suburbs are attracting the most capital — and what that means for future home values.",
    publishDate: "2025-01-15",
    readTime: "8 min read",
    content: `[CONTENT GOES HERE]`,
    featured: true,
  },
  {
    slug: "top-3-cities-to-buy",
    title: "The 3 Cities Most Likely to Appreciate in the Next 5 Years",
    excerpt: "Based on infrastructure investments, demographic shifts, and economic indicators, these three suburbs stand out.",
    publishDate: "2025-01-10",
    readTime: "6 min read",
    content: `[CONTENT GOES HERE]`,
    featured: false,
  },
  {
    slug: "most-overlooked-suburb",
    title: "The Most Overlooked Suburb in North Dallas",
    excerpt: "Everyone's fighting over the same hot zip codes. Here's the one they're missing — and why.",
    publishDate: "2025-01-05",
    readTime: "5 min read",
    content: `[CONTENT GOES HERE]`,
    featured: false,
  },
  {
    slug: "heb-effect",
    title: "Where H-E-B Goes, Home Values Follow",
    excerpt: "The Texas grocery giant doesn't just sell groceries — it signals where growth is headed. Here's the pattern.",
    publishDate: "2024-12-28",
    readTime: "4 min read",
    content: `[CONTENT GOES HERE]`,
    featured: false,
  },
]

export function getArticleBySlug(slug: string): SignalArticle | undefined {
  return SIGNAL_ARTICLES.find((article) => article.slug === slug)
}

export function getFeaturedArticle(): SignalArticle | undefined {
  return SIGNAL_ARTICLES.find((article) => article.featured)
}

export function getAllArticles(): SignalArticle[] {
  return SIGNAL_ARTICLES.sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  )
}
