import Link from "next/link"
import { notFound } from "next/navigation"
import { getEpisodeBySlug, getAllEpisodes } from "@/lib/podcast"
import { ArrowLeft, Calendar, Clock, ChevronRight } from "lucide-react"
import ReactMarkdown from "react-markdown"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Generate static params for all episodes
export function generateStaticParams() {
  const episodes = getAllEpisodes()
  return episodes.map((episode) => ({
    slug: episode.slug,
  }))
}

// Generate metadata for each episode
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const episode = getEpisodeBySlug(slug)
  if (!episode) {
    return { title: "Episode Not Found | Sofee's Suburb Wars" }
  }
  return {
    title: `${episode.title} | Sofee's Suburb Wars`,
    description: episode.description,
  }
}

function RelatedEpisodes({ currentSlug }: { currentSlug: string }) {
  const allEpisodes = getAllEpisodes()
  const currentIndex = allEpisodes.findIndex((e) => e.slug === currentSlug)
  const nextEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null
  const prevEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null

  if (!nextEpisode && !prevEpisode) return null

  return (
    <section className="border-t border-slate-200 pt-10 mt-10">
      <h3
        className="text-lg font-semibold text-slate-900 mb-6"
        style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
      >
        More Episodes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {prevEpisode && (
          <Link
            href={`/podcast/${prevEpisode.slug}`}
            className="group block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <p className="text-xs text-slate-500 mb-1">Previous Episode</p>
            <p
              className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Ep. {prevEpisode.episodeNumber}: {prevEpisode.title}
            </p>
          </Link>
        )}
        {nextEpisode && (
          <Link
            href={`/podcast/${nextEpisode.slug}`}
            className="group block p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <p className="text-xs text-slate-500 mb-1">Next Episode</p>
            <p
              className="text-sm font-semibold text-slate-900 group-hover:text-teal-700 transition-colors"
              style={{ fontFamily: "Georgia, serif" }}
            >
              Ep. {nextEpisode.episodeNumber}: {nextEpisode.title}
            </p>
          </Link>
        )}
      </div>
    </section>
  )
}

export default async function EpisodePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const episode = getEpisodeBySlug(slug)

  if (!episode) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-white">
      <article className="w-full pt-12 pb-20 px-4 md:px-6">
        <div className="max-w-[680px] mx-auto">
          {/* Back link */}
          <Link
            href="/podcast"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 transition-colors mb-8"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to All Episodes
          </Link>

          {/* Episode header */}
          <header className="mb-8">
            {/* Episode badge */}
            <p
              className="text-sm font-semibold text-teal-600 mb-3"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              Episode {episode.episodeNumber}
            </p>

            {/* Title */}
            <h1
              className="text-[32px] md:text-[38px] lg:text-[42px] font-bold text-slate-900 leading-[1.15] mb-6"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {episode.title}
            </h1>

            {/* Description */}
            <p
              className="text-lg md:text-xl text-slate-600 leading-relaxed mb-6"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              {episode.description}
            </p>

            {/* Meta */}
            <div
              className="flex items-center gap-4 text-sm text-slate-500"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(episode.publishDate)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {episode.duration}
              </span>
            </div>
          </header>

          {/* Audio Player */}
          <div className="mb-10 p-4 bg-slate-50 rounded-xl">
            <audio
              controls
              className="w-full"
              style={{ height: "40px" }}
            >
              <source src={episode.audioUrl} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>

          {/* Show Notes */}
          <div className="episode-show-notes">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2
                    className="text-[24px] md:text-[28px] font-bold text-slate-900 mt-12 mb-4 leading-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3
                    className="text-[20px] md:text-[22px] font-semibold text-slate-900 mt-8 mb-3 leading-tight"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p
                    className="text-[17px] md:text-[18px] text-slate-700 mb-6 leading-[1.8]"
                    style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    {children}
                  </p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold text-slate-900">{children}</strong>
                ),
                ul: ({ children }) => (
                  <ul className="my-6 ml-0 space-y-3">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="my-6 ml-0 space-y-3 list-none">{children}</ol>
                ),
                li: ({ children }) => (
                  <li
                    className="text-[17px] md:text-[18px] text-slate-700 leading-[1.7] pl-6 relative"
                    style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
                  >
                    <span className="absolute left-0 text-slate-400 select-none">•</span>
                    {children}
                  </li>
                ),
                hr: () => (
                  <hr className="my-10 border-0 border-t border-slate-200" />
                ),
                em: ({ children }) => (
                  <em className="text-slate-500 italic">{children}</em>
                ),
                a: ({ href, children }) => (
                  <Link
                    href={href || "#"}
                    className="text-teal-600 hover:text-teal-700 underline underline-offset-2"
                  >
                    {children}
                  </Link>
                ),
              }}
            >
              {episode.showNotes}
            </ReactMarkdown>
          </div>

          {/* Back to All Episodes link */}
          <div className="mt-12 pt-8 border-t border-slate-200">
            <Link
              href="/podcast"
              className="inline-flex items-center gap-2 text-teal-600 font-medium hover:text-teal-700 transition-colors"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Episodes
            </Link>
          </div>

          {/* Related Episodes */}
          <RelatedEpisodes currentSlug={episode.slug} />
        </div>
      </article>
    </main>
  )
}
