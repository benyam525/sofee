import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "How Sofee Works | Documentation",
  description: "Complete guide to how Sofee scores neighborhoods, generates insights, and helps you find your ideal DFW suburb",
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5FAFF] to-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <Link href="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Sofee
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">How Sofee Works</h1>
        <p className="text-slate-600 mb-8">
          A complete guide to scoring, insights, and finding your ideal Dallas-Fort Worth neighborhood.
        </p>

        {/* Table of Contents */}
        <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200 p-5 md:p-6 mb-10">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Contents</h2>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-1">
            <ul className="space-y-1 text-primary text-sm">
              <li><a href="#overview" className="hover:underline">1. Overview</a></li>
              <li><a href="#scoring" className="hover:underline">2. How Scoring Works</a></li>
              <li><a href="#criteria" className="hover:underline">3. Priority Criteria (Sliders)</a></li>
              <li><a href="#budget" className="hover:underline">4. Budget Filtering</a></li>
            </ul>
            <ul className="space-y-1 text-primary text-sm">
              <li><a href="#lifestyle" className="hover:underline">5. Lifestyle Tags</a></li>
              <li><a href="#insights" className="hover:underline">6. Sofee's Insights</a></li>
              <li><a href="#data" className="hover:underline">7. Data Sources</a></li>
              <li><a href="#faq" className="hover:underline">8. FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Section 1: Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">1. Overview</h2>
          <p className="text-slate-700 mb-4">
            Sofee is a neighborhood recommendation engine for families relocating to Dallas-Fort Worth.
            Unlike generic "best places to live" lists, Sofee scores neighborhoods based on <strong>your specific priorities</strong>.
          </p>

          <div className="bg-slate-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-slate-900 mb-2">The Process</h3>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 text-sm">
              <li><strong>Set your budget</strong> — Min and max home price range</li>
              <li><strong>Adjust priority sliders</strong> — Rate importance of schools, safety, commute, etc. (0-5 scale)</li>
              <li><strong>Select lifestyle tags</strong> — Optional vibe preferences (up to 2)</li>
              <li><strong>Toggle special preferences</strong> — Town center, newer homes, established neighborhoods</li>
              <li><strong>Get personalized results</strong> — ZIP codes ranked by your unique criteria</li>
            </ol>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <h3 className="font-semibold text-emerald-900 mb-2">What Makes Sofee Different</h3>
            <ul className="space-y-1 text-emerald-800 text-sm">
              <li>• Scores are personalized — two families get different rankings based on their priorities</li>
              <li>• Honest insights — we tell you trade-offs, not just positives</li>
              <li>• Data-driven — every score comes from real data, not vibes</li>
              <li>• DFW-specific — built specifically for Dallas suburbs, not generic</li>
            </ul>
          </div>
        </section>

        {/* Section 2: Scoring */}
        <section id="scoring" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">2. How Scoring Works</h2>

          <p className="text-slate-700 mb-4">
            Every ZIP code receives a <strong>Match Score from 0-100</strong>. This score combines objective data with your personal priorities.
          </p>

          <div className="space-y-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Step 1: Baseline Score (60% of final)</h3>
              <p className="text-blue-800 text-sm mb-2">
                An objective score based on fixed weights — this ensures high-quality neighborhoods always rank well regardless of your settings.
              </p>
              <div className="bg-blue-100 rounded p-3 text-xs font-mono text-blue-900">
                <p>Schools: 18% | Safety: 18% | Family Ecosystem: 12%</p>
                <p>Quality of Life: 14% | Diversity: 10% | Affordability: 10%</p>
                <p>Amenities: 10% | Commute: 8%</p>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-900 mb-2">Step 2: Priority-Weighted Score (40% of final)</h3>
              <p className="text-purple-800 text-sm mb-2">
                Your slider settings create multipliers that boost or reduce each criterion's impact:
              </p>
              <div className="bg-purple-100 rounded p-3 text-xs font-mono text-purple-900">
                <p>Slider 0 = 0.5x multiplier (reduced impact)</p>
                <p>Slider 1 = 1.0x multiplier (baseline)</p>
                <p>Slider 2 = 1.5x multiplier (elevated)</p>
                <p>Slider 3 = 2.0x multiplier (critical priority)</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">Step 3: Modifier Adjustments (+/- points)</h3>
              <p className="text-amber-800 text-sm mb-2">
                Lifestyle tags and special preferences add or subtract points based on ZIP characteristics:
              </p>
              <div className="bg-amber-100 rounded p-3 text-xs font-mono text-amber-900">
                <p>Lifestyle tags: +5 (strong match) to -5 (poor match)</p>
                <p>Special preferences: +5 (match) to -5 (no match)</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
            <p className="text-slate-400 mb-2">// Final Score Formula</p>
            <code className="text-emerald-400">
              finalScore = (baselineScore × 0.6) + (priorityWeightedScore × 0.4) + modifiers
            </code>
          </div>
        </section>

        {/* Section 3: Criteria */}
        <section id="criteria" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">3. Priority Criteria (Sliders)</h2>

          <p className="text-slate-700 mb-4">
            Each slider ranges from <strong>0</strong> ("Reduced Factor") to <strong>5</strong> ("Critical").
            Setting a slider to 0 doesn't remove the criterion — it reduces its weight to 0.5x instead of ignoring it entirely.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-500">
              <h3 className="font-semibold text-slate-900">School Quality</h3>
              <p className="text-slate-600 text-sm mb-2">How important are strong public schools?</p>
              <div className="text-slate-500 text-xs space-y-1">
                <p><strong>Data source:</strong> TEA accountability ratings + GreatSchools composite</p>
                <p><strong>Score:</strong> schoolSignal (0-100) from state test scores, graduation rates, and ratings</p>
                <p><strong>High scorers:</strong> Frisco, Southlake, Coppell, Allen, Plano</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-green-500">
              <h3 className="font-semibold text-slate-900">Safety & Stability</h3>
              <p className="text-slate-600 text-sm mb-2">How much do you value low crime and neighborhood stability?</p>
              <div className="text-slate-500 text-xs space-y-1">
                <p><strong>Data source:</strong> FBI UCR data + local police statistics</p>
                <p><strong>Score:</strong> safetySignal (1-5 band) converted to 0-100 scale</p>
                <p className="font-mono bg-slate-200 px-2 py-1 rounded inline-block">Band 1 = 100 | Band 2 = 80 | Band 3 = 60 | Band 4 = 40 | Band 5 = 20</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-orange-500">
              <h3 className="font-semibold text-slate-900">Commute Burden</h3>
              <p className="text-slate-600 text-sm mb-2">How important is minimizing drive time to work?</p>
              <div className="text-slate-500 text-xs space-y-1">
                <p><strong>Data source:</strong> Google Maps Distance Matrix API (peak traffic)</p>
                <p><strong>Score:</strong> 100 - (commuteMinutes / 60 × 100), minimum 20</p>
                <p><strong>Note:</strong> Enter your work ZIP for personalized commute scores</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-purple-500">
              <h3 className="font-semibold text-slate-900">Lifestyle, Convenience & Culture</h3>
              <p className="text-slate-600 text-sm mb-2">Access to restaurants, entertainment, and daily conveniences</p>
              <div className="text-slate-500 text-xs space-y-1">
                <p><strong>Data source:</strong> Yelp + Google Places data</p>
                <p><strong>Score:</strong> Composite of 4 sub-scores:</p>
                <p className="font-mono bg-slate-200 px-2 py-1 rounded inline-block">
                  Restaurant Density (30%) + Cuisine Diversity (25%) + Entertainment (25%) + Convenience (20%)
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-pink-500">
              <h3 className="font-semibold text-slate-900">Family-Friendly Amenities</h3>
              <p className="text-slate-600 text-sm mb-2">Parks, libraries, youth programs, and kid-friendly activities</p>
              <div className="text-slate-500 text-xs space-y-1">
                <p><strong>Data source:</strong> Trust for Public Land + city parks departments</p>
                <p><strong>Score:</strong> Average of (schoolQualityScore + parksScore) / 2</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-emerald-500">
              <h3 className="font-semibold text-slate-900">Tax Burden</h3>
              <p className="text-slate-600 text-sm mb-2">How much you want to minimize property taxes</p>
              <div className="text-slate-500 text-xs space-y-1">
                <p><strong>Data source:</strong> County appraisal district records</p>
                <p><strong>Note:</strong> Texas has no state income tax, but property taxes vary significantly by city/county</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-slate-500">
              <h3 className="font-semibold text-slate-900">Toll Road Convenience</h3>
              <p className="text-slate-600 text-sm mb-2">Quick access to major toll roads (DNT, 121, Sam Rayburn, etc.)</p>
              <div className="text-slate-500 text-xs space-y-1">
                <p><strong>Note:</strong> DFW has extensive toll road network. Important for some commutes.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Budget */}
        <section id="budget" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">4. Budget Filtering</h2>

          <p className="text-slate-700 mb-4">
            Budget is used as a <strong>filter</strong>, not a scoring factor. ZIPs are compared against your max budget to determine which appear in results.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">How Budget Filtering Works</h3>
              <div className="text-slate-700 text-sm space-y-2">
                <p><strong>Primary results:</strong> ZIPs where median home price ≤ your max budget × 1.1 (10% buffer)</p>
                <p><strong>Stretch results:</strong> If fewer than 3 ZIPs fit, we expand to max budget × 1.2 (20% buffer)</p>
                <p><strong>Labels:</strong> ZIPs over your max are marked "Over Budget" with the exact amount</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">Why We Show "Over Budget" Options</h3>
              <p className="text-amber-800 text-sm">
                A ZIP that's $20k over your budget might be worth considering if it scores significantly better on your priorities.
                We surface these as "stretch" options so you can make informed trade-off decisions.
              </p>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <h3 className="font-semibold text-emerald-900 mb-2">Affordability Display</h3>
              <p className="text-emerald-800 text-sm">
                Each result shows <strong>"Under Budget By"</strong> or <strong>"Over Budget By"</strong> with the dollar amount,
                making it easy to see how each ZIP compares to your target.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: Lifestyle Tags */}
        <section id="lifestyle" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">5. Lifestyle Tags</h2>

          <p className="text-slate-700 mb-4">
            Select up to <strong>2 tags</strong> that describe your ideal neighborhood vibe.
            Tags apply <strong>bonuses (+5)</strong> for matching ZIPs and <strong>penalties (-5)</strong> for poor matches.
          </p>

          <div className="grid gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-slate-400">
              <h3 className="font-semibold text-slate-900">Quiet & Predictable</h3>
              <p className="text-slate-600 text-sm mb-2">Calm neighborhoods, low activity, minimal nightlife</p>
              <div className="text-xs font-mono bg-white rounded p-2 space-y-1">
                <p className="text-green-600">+5 if safetySignal = 1 AND entertainment ≤ 10</p>
                <p className="text-blue-600">+2 if safetySignal ≤ 2 AND entertainment ≤ 15</p>
                <p className="text-red-600">-5 if entertainment ≥ 20+</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-orange-400">
              <h3 className="font-semibold text-slate-900">Sports-Heavy Community</h3>
              <p className="text-slate-600 text-sm mb-2">Youth athletics culture, sports facilities, active lifestyle</p>
              <div className="text-xs font-mono bg-white rounded p-2 space-y-1">
                <p className="text-green-600">+5 if sports city (Frisco, Allen, etc.) AND parks ≥ 3.0/sqmi</p>
                <p className="text-blue-600">+2 if sports city OR parks ≥ 3.5/sqmi</p>
                <p className="text-red-600">-5 if parks &lt; 2.5/sqmi</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-purple-400">
              <h3 className="font-semibold text-slate-900">Diverse & Global Culture</h3>
              <p className="text-slate-600 text-sm mb-2">Multicultural, international dining, global perspectives</p>
              <div className="text-xs font-mono bg-white rounded p-2 space-y-1">
                <p className="text-green-600">+5 if restaurantDiversityIndex ≥ 0.85</p>
                <p className="text-blue-600">+2 if restaurantDiversityIndex ≥ 0.75</p>
                <p className="text-red-600">-5 if restaurantDiversityIndex &lt; 0.65</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-amber-400">
              <h3 className="font-semibold text-slate-900">Upscale & Refined</h3>
              <p className="text-slate-600 text-sm mb-2">Premium amenities, luxury retail, polished aesthetics</p>
              <div className="text-xs font-mono bg-white rounded p-2 space-y-1">
                <p className="text-green-600">+5 if medianPrice ≥ $550k AND convenience ≥ 85 AND hasTownCenter</p>
                <p className="text-blue-600">+2 if medianPrice ≥ $450k AND convenience ≥ 75</p>
                <p className="text-red-600">-5 if medianPrice &lt; $400k OR convenience &lt; 70</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-green-400">
              <h3 className="font-semibold text-slate-900">Kid-First Suburbia</h3>
              <p className="text-slate-600 text-sm mb-2">Parks, playgrounds, family events, stroller-friendly</p>
              <div className="text-xs font-mono bg-white rounded p-2 space-y-1">
                <p className="text-green-600">+5 if parks ≥ 3.0/sqmi AND schools ≥ 80 AND childDev ≥ 75</p>
                <p className="text-blue-600">+3 if parks ≥ 2.5/sqmi AND schools ≥ 70</p>
                <p className="text-red-600">-5 if parks &lt; 2.0/sqmi OR schools &lt; 60</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-400">
              <h3 className="font-semibold text-slate-900">Near a Real Town Square</h3>
              <p className="text-slate-600 text-sm mb-2">Walkable downtown, local shops, community gathering</p>
              <div className="text-xs font-mono bg-white rounded p-2 space-y-1">
                <p className="text-green-600">+5 if hasTownCenter = true</p>
                <p className="text-red-600">-5 if hasTownCenter = false</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-pink-400">
              <h3 className="font-semibold text-slate-900">Late-Night Food & Scene</h3>
              <p className="text-slate-600 text-sm mb-2">Vibrant nightlife, dining, bars, social energy</p>
              <div className="text-xs font-mono bg-white rounded p-2 space-y-1">
                <p className="text-green-600">+5 if restaurants ≥ 70 AND entertainment ≥ 20</p>
                <p className="text-blue-600">+2 if restaurants ≥ 50 AND entertainment ≥ 12</p>
                <p className="text-red-600">-5 if restaurants &lt; 30 OR entertainment &lt; 8</p>
              </div>
            </div>
          </div>

          {/* Special Preferences */}
          <h3 className="text-xl font-bold text-slate-900 mt-8 mb-4">Special Preferences (Toggles)</h3>
          <p className="text-slate-700 mb-4 text-sm">
            These are secondary toggles that add smaller bonuses based on housing characteristics.
          </p>

          <div className="space-y-3">
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900">Prefer Town Center?</h4>
              <p className="text-slate-600 text-sm">+3 if hasTownCenter = true, -3 if false</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900">Prefer Newer Construction?</h4>
              <p className="text-slate-600 text-sm">+5 if ≥60% new construction, +2 if ≥40%, -5 if &lt;25%</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-4">
              <h4 className="font-semibold text-slate-900">Prefer Established Neighborhoods?</h4>
              <p className="text-slate-600 text-sm">+5 if ≤15% new construction, +2 if ≤25%, -5 if &gt;40%</p>
            </div>
          </div>
        </section>

        {/* Section 6: Insights */}
        <section id="insights" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">6. Sofee's Insights</h2>

          <p className="text-slate-700 mb-4">
            After generating your results, Sofee analyzes them to provide <strong>actionable insights</strong> —
            things you might not notice just looking at the rankings.
          </p>

          <div className="space-y-4">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💰</span>
                <h3 className="font-semibold text-emerald-900">Value Alternative</h3>
              </div>
              <p className="text-emerald-800 text-sm mb-2">
                Surfaces a ZIP that scores close to your #1 pick but costs significantly less.
              </p>
              <div className="bg-emerald-100 rounded p-3 text-xs">
                <p className="font-semibold mb-1">Triggers when:</p>
                <p>• A ZIP scores within 15 points of your #1 pick</p>
                <p>• AND median home price is $50k+ lower</p>
              </div>
              <p className="text-emerald-700 text-xs mt-2 italic">
                Example: "Irving (75039) scores just 6 points behind your #1 pick — and the median home is $80k less than Richardson (75080)."
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🔓</span>
                <h3 className="font-semibold text-blue-900">Just Out of Reach</h3>
              </div>
              <p className="text-blue-800 text-sm mb-2">
                Shows a high-scoring ZIP that's slightly over your budget — worth considering if you can stretch.
              </p>
              <div className="bg-blue-100 rounded p-3 text-xs">
                <p className="font-semibold mb-1">Triggers when:</p>
                <p>• A ZIP exceeds your budget ceiling (budget × 1.1)</p>
                <p>• BUT scores higher than your top match</p>
                <p>• AND budget increase needed is ≤ $75k or ≤ 12% of budget</p>
                <p>• AND budget increase is at least $15k (meaningful difference)</p>
              </div>
              <p className="text-blue-700 text-xs mt-2 italic">
                Example: "Frisco (75034) scores 92/100 and is known for top-tier schools. It's not in your Top Matches because median price exceeds your budget — but a $35k bump would unlock it."
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⚖️</span>
                <h3 className="font-semibold text-purple-900">Trade-off Alert</h3>
              </div>
              <p className="text-purple-800 text-sm mb-2">
                Highlights a weakness in your #1 pick where another ZIP excels.
              </p>
              <div className="bg-purple-100 rounded p-3 text-xs">
                <p className="font-semibold mb-1">Triggers when:</p>
                <p>• Your #1 pick scores below 60 on a criterion you weighted ≥ 2</p>
                <p>• AND another top-5 ZIP scores 20+ points higher on that criterion</p>
              </div>
              <p className="text-purple-700 text-xs mt-2 italic">
                Example: "Your #1 pick Richardson (75080) scores lower on commute. Carrollton (75007) ranks 25 points higher there, with only 4 points less overall."
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-100 rounded-lg p-4">
            <p className="text-slate-700 text-sm">
              <strong>Note:</strong> Sofee shows a maximum of 2 insights per search to avoid overwhelming you.
              If conditions for multiple insights are met, we prioritize the most actionable ones.
            </p>
          </div>
        </section>

        {/* Section 7: Data Sources */}
        <section id="data" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">7. Data Sources</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 font-semibold">Data Field</th>
                  <th className="text-left p-3 font-semibold">Source</th>
                  <th className="text-left p-3 font-semibold">Update Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">Median Home Price</td>
                  <td className="p-3">Zillow, Redfin, Realtor.com (averaged)</td>
                  <td className="p-3">Monthly</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">School Scores</td>
                  <td className="p-3">Texas Education Agency + GreatSchools API</td>
                  <td className="p-3">Annually</td>
                </tr>
                <tr>
                  <td className="p-3">Safety Signal</td>
                  <td className="p-3">FBI UCR data + local police statistics</td>
                  <td className="p-3">Annually</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">Commute Times</td>
                  <td className="p-3">Google Maps Distance Matrix API</td>
                  <td className="p-3">Real-time</td>
                </tr>
                <tr>
                  <td className="p-3">Restaurant Data</td>
                  <td className="p-3">Yelp Fusion API + Google Places</td>
                  <td className="p-3">Quarterly</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">Entertainment Venues</td>
                  <td className="p-3">Yelp + Google Places</td>
                  <td className="p-3">Quarterly</td>
                </tr>
                <tr>
                  <td className="p-3">Parks Data</td>
                  <td className="p-3">Trust for Public Land + city parks depts</td>
                  <td className="p-3">Annually</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">Tax Rates</td>
                  <td className="p-3">County appraisal district records</td>
                  <td className="p-3">Annually</td>
                </tr>
                <tr>
                  <td className="p-3">Diversity Index</td>
                  <td className="p-3">Calculated from Yelp cuisine categories</td>
                  <td className="p-3">Quarterly</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Data Quality Indicators</h3>
            <p className="text-slate-700 text-sm mb-2">
              Each result shows a data quality badge:
            </p>
            <ul className="text-sm space-y-1">
              <li><span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">High Quality</span> — All data updated within 12 months</li>
              <li><span className="inline-block px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">Medium Quality</span> — Most data recent, some older than 12 months</li>
              <li><span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">Low Quality</span> — Data may be limited or outdated</li>
            </ul>
          </div>
        </section>

        {/* Section 8: FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">8. FAQ</h2>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Why did my #1 pick change when I adjusted one slider?</h3>
              <p className="text-slate-700 text-sm">
                The scoring system is weighted, so changing one priority affects the balance. A ZIP that was #1 for schools
                might drop if you increase commute priority and it has a longer drive time.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">What does "Why This Ranked" show?</h3>
              <p className="text-slate-700 text-sm">
                This expandable section shows how the ZIP ranks among all 27 ZIPs for each criterion you weighted 3 or higher.
                For example, "2nd of 27 for Schools" means only one other ZIP scored higher on school quality.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Why does Richardson always rank high?</h3>
              <p className="text-slate-700 text-sm">
                Richardson (75080, 75081) consistently scores well because it has strong schools, excellent diversity,
                central location, and reasonable prices. It's genuinely a balanced neighborhood that fits many profiles.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Can I see ZIPs outside my budget?</h3>
              <p className="text-slate-700 text-sm">
                Yes — ZIPs up to 20% over your max budget can appear as "stretch" options. The "Just Out of Reach"
                insight specifically highlights high-scoring ZIPs that are slightly over budget.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">What's the difference between Top Matches and Honorable Mentions?</h3>
              <p className="text-slate-700 text-sm">
                <strong>Top Matches</strong> are the 4 highest-scoring ZIPs within your budget.
                <strong>Honorable Mentions</strong> are the next tier — still good matches but with slightly lower scores or minor trade-offs.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">How do I exclude certain cities?</h3>
              <p className="text-slate-700 text-sm">
                In the preferences form, there's an "Exclude Cities" section. Check any cities you definitely don't want,
                and their ZIPs won't appear in your results.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">What is "Who is this ZIP for?"</h3>
              <p className="text-slate-700 text-sm">
                This is Sofee's honest take on who would thrive in each ZIP — based on data, not marketing.
                Click "See honest take" to view the full ZIP Identity Profile with detailed insights.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">How accurate is this?</h3>
              <p className="text-slate-700 text-sm">
                Sofee is a decision-support tool, not a guarantee. Data is sourced from reputable providers and updated regularly,
                but real estate markets change quickly. Always verify current prices and visit neighborhoods in person before making decisions.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-8 mt-12 text-center text-slate-500 text-sm">
          <p>Last updated: December 2025</p>
          <p className="mt-2">
            Questions? <a href="mailto:hello@sofee.app" className="text-primary hover:underline">hello@sofee.app</a>
          </p>
        </div>
      </div>
    </div>
  )
}
