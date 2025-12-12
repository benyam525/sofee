import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteNav } from "@/components/site-nav"
import { getArticleBySlug, getAllArticles, SignalArticle } from "@/lib/signals"
import { ArrowLeft, Calendar, Clock } from "lucide-react"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Generate static params for all articles
export function generateStaticParams() {
  const articles = getAllArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

// Generate metadata for each article
export function generateMetadata({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)
  if (!article) {
    return { title: "Article Not Found | Sofee Signals" }
  }
  return {
    title: `${article.title} | Sofee Signals`,
    description: article.excerpt,
  }
}

function RelatedArticles({ currentSlug }: { currentSlug: string }) {
  const allArticles = getAllArticles()
  const related = allArticles.filter((a) => a.slug !== currentSlug).slice(0, 2)

  if (related.length === 0) return null

  return (
    <section className="border-t border-slate-200 pt-12 mt-12">
      <h3 className="text-lg font-semibold text-slate-900 mb-6">More from Sofee Signals</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/signals/${article.slug}`}
            className="group block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <h4
              className="font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {article.title}
            </h4>
            <p className="text-sm text-slate-600 line-clamp-2">{article.excerpt}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function SignalArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <>
      <SiteNav />
      <main className="min-h-screen bg-white">
        <article className="w-full pt-12 pb-20 px-4 md:px-6">
          <div className="max-w-[680px] mx-auto">
            {/* Back link */}
            <Link
              href="/signals"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Signals
            </Link>

            {/* Article header */}
            <header className="mb-10">
              <h1
                className="text-3xl md:text-4xl lg:text-[42px] font-bold text-slate-900 leading-tight mb-6"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {article.title}
              </h1>
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
            </header>

            {/* Article content */}
            <div
              className="prose prose-slate prose-lg max-w-none"
              style={{
                fontSize: "18px",
                lineHeight: 1.75,
              }}
            >
              <p className="text-slate-600 text-xl leading-relaxed mb-8">{article.excerpt}</p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
                <p className="text-slate-500 italic">{article.content}</p>
              </div>
            </div>

            {/* Back to Signals link */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <Link
                href="/signals"
                className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all Signals
              </Link>
            </div>

            {/* Related articles */}
            <RelatedArticles currentSlug={article.slug} />
          </div>
        </article>
      </main>
    </>
  )
}
