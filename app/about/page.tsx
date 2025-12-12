import Image from "next/image"
import { Heart, Target, Database, Users, Mail, ExternalLink } from "lucide-react"

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50 to-white" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4">
            <Image src="/sofee-logo.png" alt="Sofee" width={280} height={187} className="mx-auto" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            We're not here to sell you a suburb.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Just honest, data-backed guidance so your family lands exactly where you belong.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-rose-500" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Why Sofee Exists</h2>
              <p className="text-slate-600 leading-relaxed">
                Moving to DFW is chaos. Dozens of suburbs. Conflicting opinions. Facebook groups full of "well, my realtor said…" and your cousin's hot take on Frisco vs. McKinney.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                We built Sofee because families deserve better than guesswork. No sponsored listings. No hidden agendas. Just clarity.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">How It Works</h2>
              <p className="text-slate-600 leading-relaxed">
                Sofee pulls real data — median home prices, school ratings, commute times, safety stats, tax burdens, and local amenities — and weighs it against what your family actually cares about.
              </p>
              <p className="text-slate-600 leading-relaxed mt-3">
                You tell us your budget, your priorities, your dealbreakers. We tell you where you belong.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Database className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Where Our Data Comes From</h2>
            <p className="text-slate-600 max-w-xl mx-auto">
              We aggregate data from trusted public sources to give you accurate, up-to-date information.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: "SchoolDigger", desc: "School rankings, test scores & demographics", color: "bg-purple-50 text-purple-700" },
              { name: "TEA (Texas)", desc: "STAAR scores & accountability ratings", color: "bg-green-50 text-green-700" },
              { name: "TX Secretary of State", desc: "Voting patterns & election data", color: "bg-blue-50 text-blue-700" },
              { name: "Zillow", desc: "Median home prices", color: "bg-sky-50 text-sky-700" },
              { name: "Yelp", desc: "Restaurant & entertainment counts", color: "bg-red-50 text-red-700" },
              { name: "FBI UCR", desc: "Crime & safety statistics", color: "bg-orange-50 text-orange-700" },
            ].map((source) => (
              <div key={source.name} className="bg-white rounded-xl p-4 border border-slate-100">
                <span className={`inline-block px-2 py-1 rounded-md text-xs font-semibold ${source.color} mb-2`}>
                  {source.name}
                </span>
                <p className="text-sm text-slate-600">{source.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary/5 to-sky-50 rounded-2xl p-8 sm:p-12 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Currently Covering</h2>
            <p className="text-5xl font-bold text-primary mb-2">35</p>
            <p className="text-slate-600 mb-6">North Dallas ZIP codes across 15+ school districts</p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {[
                "Frisco",
                "Plano",
                "Allen",
                "McKinney",
                "Prosper",
                "Celina",
                "Coppell",
                "Southlake",
                "Colleyville",
                "Flower Mound",
                "Richardson",
                "Carrollton",
                "Irving",
                "Lewisville",
                "Grand Prairie",
                "Farmers Branch",
              ].map((city) => (
                <span key={city} className="px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200">
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Questions or Feedback?</h2>
          <p className="text-slate-600 mb-6">
            We'd love to hear from you — especially if you've used Sofee to find your new home!
          </p>
          <a
            href="mailto:hello@asksofee.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-full font-medium hover:bg-primary/90 transition-colors"
          >
            <Mail className="w-4 h-4" />
            hello@asksofee.com
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-slate-200">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2025 Sofee. Made with care in Dallas, TX.</p>
          <div className="flex items-center gap-4">
            <a href="/docs" className="hover:text-slate-700 flex items-center gap-1">
              Documentation <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
