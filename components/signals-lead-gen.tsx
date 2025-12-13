"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function SignalsLeadGen() {
  return (
    <div
      className="my-12 p-6 md:p-8 bg-gradient-to-br from-teal-50 to-slate-50 border border-teal-200 rounded-2xl"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="max-w-xl">
        <p className="text-sm font-semibold text-teal-700 uppercase tracking-wide mb-2">
          Want help applying this?
        </p>
        <h3
          className="text-xl md:text-2xl font-bold text-slate-900 mb-3"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Sofee matches your priorities to the right suburb
        </h3>
        <p className="text-slate-600 mb-5 leading-relaxed">
          Tell us what matters — commute, schools, budget, lifestyle — and we'll show you which North Dallas cities actually fit. No spam, no sales pitch. Just signal.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-medium rounded-full hover:bg-teal-700 transition-colors"
        >
          Try Sofee free
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
