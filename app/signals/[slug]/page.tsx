import Link from "next/link"
import { notFound } from "next/navigation"
import { getArticleBySlug, getAllArticles } from "@/lib/signals"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import ReactMarkdown from "react-markdown"

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
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
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
      <h3
        className="text-lg font-semibold text-slate-900 mb-6"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        More from Sofee Signals
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {related.map((article) => (
          <Link
            key={article.slug}
            href={`/signals/${article.slug}`}
            className="group block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <h4
              className="text-base font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {article.title}
            </h4>
            <p
              className="text-sm text-slate-600 line-clamp-2"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {article.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function SignalArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <article className="w-full pt-12 pb-20 px-4 md:px-6">
        <div className="max-w-[680px] mx-auto">
          {/* Back link */}
          <Link
            href="/signals"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-8"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Signals
          </Link>

          {/* Article header */}
          <header className="mb-12">
            {/* Title - Georgia, 42px */}
            <h1
              className="text-[32px] md:text-[38px] lg:text-[42px] font-bold text-slate-900 leading-[1.15] mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {article.title}
            </h1>

            {/* Excerpt - System font, 20px */}
            <p
              className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {article.excerpt}
            </p>

            {/* Meta */}
            <div
              className="flex items-center gap-4 text-sm text-slate-500"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
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
          <div className="article-content">
            <ReactMarkdown
              components={{
                // H2 - Section headers: Georgia, 28px, bold
                h2: ({ children }) => (
                  <h2
                    className="text-[24px] md:text-[28px] font-bold text-slate-900 mt-14 mb-4 leading-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {children}
                  </h2>
                ),

                // H3 - Subsection headers: Georgia, 22px, semibold
                h3: ({ children }) => (
                  <h3
                    className="text-[20px] md:text-[22px] font-semibold text-slate-900 mt-10 mb-3 leading-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {children}
                  </h3>
                ),

                // Body paragraphs: System font, 18px, line-height 1.8
                p: ({ children }) => (
                  <p
                    className="text-[17px] md:text-[18px] text-slate-700 mb-6 leading-[1.8]"
                    style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    {children}
                  </p>
                ),

                // Bold text: semibold, slate-900
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">{children}</strong>
                ),

                // Unordered lists
                ul: ({ children }) => (
                  <ul className="my-6 ml-0 space-y-3">{children}</ul>
                ),

                // Ordered lists
                ol: ({ children }) => (
                  <ol className="my-6 ml-0 space-y-3 list-none counter-reset-item">{children}</ol>
                ),

                // List items: 18px, slate-700, with bullet/number
                li: ({ children, ...props }) => {
                  // Check if parent is ol by looking at ordered prop
                  const isOrdered = (props as { node?: { parent?: { tagName?: string } } }).node?.parent?.tagName === 'ol'
                  return (
                    <li
                      className="text-[17px] md:text-[18px] text-slate-700 leading-[1.7] pl-6 relative before:absolute before:left-0 before:text-slate-400"
                      style={{
                        fontFamily: "system-ui, -apple-system, sans-serif",
                      }}
                    >
                      <span className="absolute left-0 text-slate-400 select-none">
                        {isOrdered ? "" : "•"}
                      </span>
                      {children}
                    </li>
                  )
                },

                // Horizontal rules: clean divider
                hr: () => (
                  <hr className="my-12 border-0 border-t border-slate-200" />
                ),

                // Emphasis/italics: for tier descriptions like "*These cities are...*"
                em: ({ children }) => (
                  <em
                    className="text-slate-500 italic"
                    style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    {children}
                  </em>
                ),
              }}
            >
              {article.content}
            </ReactMarkdown>
          </div>

          {/* Back to Signals link */}
          <div className="mt-14 pt-8 border-t border-slate-200">
            <Link
              href="/signals"
              className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
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
  )
}
