import Link from "next/link"
import { getAllEpisodes, PodcastEpisode } from "@/lib/podcast"
import { Play, Clock, Calendar } from "lucide-react"

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function EpisodeCard({ episode }: { episode: PodcastEpisode }) {
  return (
    <Link
      href={`/podcast/${episode.slug}`}
      className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-teal-300 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start gap-4">
        {/* Play button */}
        <div className="flex-shrink-0 w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center group-hover:bg-teal-700 transition-colors">
          <Play className="w-6 h-6 text-white ml-1" fill="white" />
        </div>

        {/* Episode info */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-medium text-teal-600 mb-1"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            Episode {episode.episodeNumber}
          </p>
          <h3
            className="text-lg md:text-xl font-bold text-slate-900 mb-2 group-hover:text-teal-700 transition-colors"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {episode.title}
          </h3>
          <p
            className="text-slate-600 text-sm leading-relaxed mb-3 line-clamp-2"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            {episode.description}
          </p>
          <div
            className="flex items-center gap-4 text-xs text-slate-500"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(episode.publishDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {episode.duration}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function PodcastPage() {
  const episodes = getAllEpisodes()

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="w-full pt-16 pb-12 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Show badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-200 rounded-full text-teal-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-teal-500 rounded-full animate-pulse" />
            New Episodes Weekly
          </div>

          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Sofee's Suburb Wars
          </h1>
          <p
            className="text-xl md:text-2xl text-teal-700 font-medium mb-6"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            Where the hell should we live?
          </p>
          <p
            className="text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8"
            style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
          >
            Two AI hosts debate North Dallas suburbs using real data — capital plans, zoning shifts,
            school investments, and private development. It's city vs. city, and only one can win.
          </p>

          {/* Subscribe buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1DB954] text-white font-medium rounded-full hover:bg-[#1aa34a] transition-colors"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Spotify
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#9933FF] text-white font-medium rounded-full hover:bg-[#8829e6] transition-colors"
              style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.34 0A5.328 5.328 0 000 5.34v13.32A5.328 5.328 0 005.34 24h13.32A5.328 5.328 0 0024 18.66V5.34A5.328 5.328 0 0018.66 0H5.34zm6.525 3.6c3.6 0 5.925 2.55 5.925 5.475 0 1.125-.3 2.1-.75 2.775l.975 1.125c.225.225.15.6-.075.75l-1.35 1.05c-.3.225-.6.15-.825-.075l-.9-.975c-.75.375-1.65.6-2.7.6-3.6 0-5.85-2.55-5.85-5.475 0-2.925 2.25-5.25 5.55-5.25zm-.15 2.85c-1.575 0-2.55 1.125-2.55 2.475s.975 2.55 2.55 2.55c1.575 0 2.55-1.2 2.55-2.55s-.975-2.475-2.55-2.475zm-.075 8.925c1.65 0 3.15-.375 4.35-1.05l2.1 2.4c.225.225.225.6-.075.825l-1.5 1.2c-.225.15-.6.15-.825-.075l-1.95-2.25c-.675.15-1.35.225-2.1.225-3.6 0-5.925-2.55-5.925-5.55 0-.225 0-.45.075-.675.075-.225.3-.375.525-.375h2.175c.225 0 .45.15.525.375.075.225.075.45.075.675 0 1.35.975 2.475 2.55 2.475z" />
              </svg>
              Apple Podcasts
            </a>
          </div>
        </div>
      </section>

      {/* Episodes Section */}
      <section className="w-full px-4 md:px-6 pb-20">
        <div className="max-w-3xl mx-auto">
          <h2
            className="text-2xl font-bold text-slate-900 mb-8"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Episodes
          </h2>

          <div className="space-y-4">
            {episodes.map((episode) => (
              <EpisodeCard key={episode.slug} episode={episode} />
            ))}
          </div>

          {episodes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No episodes yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
