import Link from "next/link"
import { SiteNav } from "@/components/site-nav"
import { getAllArticles, getFeaturedArticle, SignalArticle } from "@/lib/signals"
import { ArrowRight, Calendar, Clock } from "lucide-react"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function FeaturedCard({ article }: { article: SignalArticle }) {
  return (
    <Link
      href={`/signals/${article.slug}`}
      className="group block bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-8 md:p-10 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-2 text-teal-600 text-sm font-medium mb-4">
        <span className="px-2 py-1 bg-teal-50 rounded-full text-xs font-semibold uppercase tracking-wide">
          Featured
        </span>
      </div>
      <h2
        className="text-2xl md:text-3xl font-bold text-slate-900 mb-4 group-hover:text-teal-700 transition-colors"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {article.title}
      </h2>
      <p className="text-slate-600 text-lg leading-relaxed mb-6">{article.excerpt}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            {formatDate(article.publishDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {article.readTime}
          </span>
        </div>
        <span className="flex items-center gap-2 text-teal-600 font-medium group-hover:gap-3 transition-all">
          Read more <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  )
}

function ArticleCard({ article }: { article: SignalArticle }) {
  return (
    <Link
      href={`/signals/${article.slug}`}
      className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all duration-300"
    >
      <h3
        className="text-lg md:text-xl font-bold text-slate-900 mb-3 group-hover:text-teal-700 transition-colors line-clamp-2"
        style={{ fontFamily: "Georgia, serif" }}
      >
        {article.title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-2">{article.excerpt}</p>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {formatDate(article.publishDate)}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          {article.readTime}
        </span>
      </div>
    </Link>
  )
}

export default function SignalsPage() {
  const featuredArticle = getFeaturedArticle()
  const allArticles = getAllArticles()
  const nonFeaturedArticles = allArticles.filter((a) => !a.featured)

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header Section */}
        <section className="w-full pt-16 pb-12 px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1
              className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Sofee Signals
            </h1>
            <p className="text-xl md:text-2xl text-teal-700 font-medium mb-6">
              Data-backed intelligence on where North Dallas is headed — so you can buy ahead of the
              curve.
            </p>
            <p className="text-slate-600 leading-relaxed max-w-2xl mx-auto">
              We dig through capital plans, zoning changes, private investments, and infrastructure
              projects across 11 North Dallas suburbs. Then we tell you what it means for home
              values. No fluff. No vibes. Just signal.
            </p>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="w-full px-4 md:px-6 pb-12">
            <div className="max-w-4xl mx-auto">
              <FeaturedCard article={featuredArticle} />
            </div>
          </section>
        )}

        {/* Article Grid */}
        <section className="w-full px-4 md:px-6 pb-20">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">All Signals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {nonFeaturedArticles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
