import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Technical Documentation | Sofee",
  description: "How Sofee works - scoring, data sources, and architecture",
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F5FAFF] to-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Sofee Technical Documentation</h1>
        <p className="text-slate-600 mb-8">
          How the scoring system works, where data comes from, and how everything fits together.
        </p>

        {/* Table of Contents */}
        <div className="bg-white/80 backdrop-blur rounded-xl border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Table of Contents</h2>
          <ul className="space-y-1 text-primary">
            <li>
              <a href="#overview" className="hover:underline">
                1. Overview
              </a>
            </li>
            <li>
              <a href="#scoring-system" className="hover:underline">
                2. Scoring System
              </a>
            </li>
            <li>
              <a href="#priority-weights" className="hover:underline">
                3. Priority Weights (Sliders)
              </a>
            </li>
            <li>
              <a href="#lifestyle-tags" className="hover:underline">
                4. Lifestyle & Community Tags
              </a>
            </li>
            <li>
              <a href="#special-preferences" className="hover:underline">
                5. Special Preferences
              </a>
            </li>
            <li>
              <a href="#data-sources" className="hover:underline">
                6. Data Sources
              </a>
            </li>
            <li>
              <a href="#example-calculation" className="hover:underline">
                7. Example Calculation
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:underline">
                8. FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Overview */}
        <section id="overview" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">1. Overview</h2>
          <p className="text-slate-700 mb-4">
            Sofee is a neighborhood recommendation engine for families relocating to the Dallas-Fort Worth area. It
            helps users find the best ZIP codes based on their priorities (schools, budget, commute, safety, lifestyle).
          </p>
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-2">How It Works</h3>
            <ol className="list-decimal list-inside space-y-1 text-slate-700">
              <li>User enters budget range and optional work address</li>
              <li>User adjusts priority sliders (0-3) for each criterion</li>
              <li>User optionally selects lifestyle tags and special preferences</li>
              <li>System scores all 27 ZIP codes against user preferences</li>
              <li>Results displayed as "Top Matches" and "Honorable Mentions"</li>
            </ol>
          </div>
        </section>

        {/* Scoring System */}
        <section id="scoring-system" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">2. Scoring System</h2>

          <p className="text-slate-700 mb-4">The final match score (0-100) is calculated in three steps:</p>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Step 1: Base Score Calculation</h3>
              <p className="text-slate-700 text-sm">
                Each priority criterion generates a 0-100 raw score. These are combined using a weighted average based
                on your slider values.
              </p>
              <code className="text-xs text-slate-600 block mt-2 bg-blue-100 p-2 rounded">
                baseScore = Σ(criterionScore × weight) / Σ(weights)
              </code>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Step 2: Lifestyle Tag Adjustments</h3>
              <p className="text-slate-700 text-sm">
                Selected lifestyle tags add bonuses (+2 to +5) for matching ZIPs and penalties (-5) for non-matching
                ZIPs. This creates a 10-point spread between ideal and poor matches.
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Step 3: Special Preference Bonuses</h3>
              <p className="text-slate-700 text-sm">
                Selected special preferences add flat bonuses (+3 to +5) for ZIPs that match the criteria.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm">
            <p className="text-slate-400 mb-2">// Final formula</p>
            <code>finalScore = baseScore + lifestyleTagAdjustments + specialPreferenceBonuses</code>
          </div>
        </section>

        {/* Priority Weights */}
        <section id="priority-weights" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            3. Priority Weights (Sliders)
          </h2>

          <p className="text-slate-700 mb-4">
            Each slider ranges from 0 ("Not a Factor") to 5 ("Critical"). Setting a weight to 0 completely removes that
            criterion from scoring.
          </p>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">School Quality</h3>
              <p className="text-slate-600 text-sm mb-2">How much you prioritize strong public schools</p>
              <p className="text-slate-500 text-xs">
                Data: Composite of GreatSchools ratings + TEA accountability (schoolQualityScore 0-100)
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Commute Burden</h3>
              <p className="text-slate-600 text-sm mb-2">How important minimizing commute time is to you</p>
              <p className="text-slate-500 text-xs">
                Data: Google Maps drive time from ZIP centroid to your work address. Score = 100 - (minutes × 1.5), min
                20
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Safety & Stability</h3>
              <p className="text-slate-600 text-sm mb-2">How much you value low crime and neighborhood stability</p>
              <p className="text-slate-500 text-xs">
                Data: safetySignal (1-5 band). Converted: 1→100, 2→85, 3→70, 4→50, 5→30
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Lifestyle, Convenience & Culture</h3>
              <p className="text-slate-600 text-sm mb-2">Access to restaurants, entertainment, and amenities</p>
              <p className="text-slate-500 text-xs">
                Data: lifestyleConvenienceCultureScore (composite of restaurants, entertainment, convenience)
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Family-Friendly Amenities</h3>
              <p className="text-slate-600 text-sm mb-2">Parks, libraries, youth sports, and activities for kids</p>
              <p className="text-slate-500 text-xs">
                Data: childDevelopmentOpportunityScore (composite of parks, youth programs, family resources)
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Tax Burden</h3>
              <p className="text-slate-600 text-sm mb-2">How much you want to minimize property taxes</p>
              <p className="text-slate-500 text-xs">
                Data: effectiveTaxRate applied to median home price. Lower tax = higher score
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Toll Road Convenience</h3>
              <p className="text-slate-600 text-sm mb-2">Quick access to major toll roads and highways</p>
              <p className="text-slate-500 text-xs">
                Data: tollRoadConvenienceScore (proximity to DNT, Sam Rayburn, 121, etc.)
              </p>
            </div>
          </div>
        </section>

        {/* Lifestyle Tags */}
        <section id="lifestyle-tags" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            4. Lifestyle & Community Tags
          </h2>

          <p className="text-slate-700 mb-4">
            Select up to 2 tags that describe your ideal neighborhood vibe. Each tag applies bonuses for matching ZIPs
            and penalties for non-matching ZIPs.
          </p>

          <div className="space-y-6">
            {/* Quiet & Predictable */}
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-slate-400">
              <h3 className="font-semibold text-slate-900">Quiet & Predictable</h3>
              <p className="text-slate-600 text-sm mb-2">
                Calm, stable neighborhoods with low activity and minimal nightlife. Think cul-de-sacs, established
                families, and peaceful evenings.
              </p>
              <p className="text-slate-500 text-xs mb-2">
                <strong>Best for:</strong> Families with young children, remote workers, retirees
              </p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <p className="text-green-600">+4 if safetySignal = 1 AND entertainment ≤ 10</p>
                <p className="text-blue-600">+2 if safetySignal ≤ 2 AND entertainment ≤ 15</p>
                <p className="text-red-600">-5 if entertainment ≥ 25 OR safetySignal ≥ 4</p>
              </div>
            </div>

            {/* Sports-Heavy Community */}
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-orange-400">
              <h3 className="font-semibold text-slate-900">Sports-Heavy Community</h3>
              <p className="text-slate-600 text-sm mb-2">
                Youth athletics culture with abundant sports facilities. Friday night football, travel teams, and active
                outdoor lifestyle.
              </p>
              <p className="text-slate-500 text-xs mb-2">
                <strong>Best for:</strong> Athletic families, kids in competitive sports
              </p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <p className="text-green-600">+5 if sports city (Frisco, Allen, etc.) AND parks ≥ 3.0/sqmi</p>
                <p className="text-blue-600">+3 if sports city OR parks ≥ 3.5/sqmi</p>
                <p className="text-red-600">-5 if parks &lt; 2.0/sqmi</p>
              </div>
            </div>

            {/* Diverse & Global Culture */}
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-purple-400">
              <h3 className="font-semibold text-slate-900">Diverse & Global Culture</h3>
              <p className="text-slate-600 text-sm mb-2">
                Multicultural neighborhoods with international dining, diverse populations, and global perspectives.
                Authentic ethnic cuisine and cultural events.
              </p>
              <p className="text-slate-500 text-xs mb-2">
                <strong>Best for:</strong> Multicultural families, food enthusiasts, globally-minded professionals
              </p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <p className="text-green-600">+5 if restaurantDiversityIndex ≥ 0.85</p>
                <p className="text-blue-600">+2 if restaurantDiversityIndex ≥ 0.75</p>
                <p className="text-red-600">-5 if restaurantDiversityIndex &lt; 0.65</p>
              </div>
            </div>

            {/* Upscale & Refined */}
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-amber-400">
              <h3 className="font-semibold text-slate-900">Upscale & Refined</h3>
              <p className="text-slate-600 text-sm mb-2">
                Premium neighborhoods with luxury amenities, high-end retail, and polished aesthetics. Country clubs,
                boutique shopping, fine dining.
              </p>
              <p className="text-slate-500 text-xs mb-2">
                <strong>Best for:</strong> Executives, professionals seeking prestige
              </p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <p className="text-green-600">+5 if medianPrice ≥ $550k AND convenience ≥ 80 AND hasTownCenter</p>
                <p className="text-blue-600">+3 if medianPrice ≥ $500k AND convenience ≥ 75</p>
                <p className="text-red-600">-5 if medianPrice &lt; $400k OR convenience &lt; 60</p>
              </div>
            </div>

            {/* Kid-First Suburbia */}
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-green-400">
              <h3 className="font-semibold text-slate-900">Kid-First Suburbia</h3>
              <p className="text-slate-600 text-sm mb-2">
                Family-oriented with abundant parks, playgrounds, good schools, and kid-focused amenities.
                Stroller-friendly sidewalks and family events.
              </p>
              <p className="text-slate-500 text-xs mb-2">
                <strong>Best for:</strong> Young families, parents with elementary-age children
              </p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <p className="text-green-600">+5 if parks ≥ 3.0/sqmi AND schools ≥ 80 AND childDev ≥ 75</p>
                <p className="text-blue-600">+3 if parks ≥ 2.5/sqmi AND schools ≥ 70</p>
                <p className="text-red-600">-5 if parks &lt; 2.0/sqmi OR schools &lt; 60</p>
              </div>
            </div>

            {/* Near a Real Town Square */}
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-blue-400">
              <h3 className="font-semibold text-slate-900">Near a Real Town Square</h3>
              <p className="text-slate-600 text-sm mb-2">
                Walkable downtown or town center with local shops, restaurants, and community gathering spaces. Farmers
                markets and local events.
              </p>
              <p className="text-slate-500 text-xs mb-2">
                <strong>Best for:</strong> Those who value walkability and community connection
              </p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <p className="text-green-600">+4 if hasTownCenter = true</p>
                <p className="text-red-600">-5 if hasTownCenter = false</p>
              </div>
            </div>

            {/* Late-Night Food & Scene */}
            <div className="bg-slate-50 rounded-lg p-4 border-l-4 border-pink-400">
              <h3 className="font-semibold text-slate-900">Late-Night Food & Scene</h3>
              <p className="text-slate-600 text-sm mb-2">
                Vibrant nightlife with abundant dining and entertainment options. Bars, live music, late-night eats, and
                social energy.
              </p>
              <p className="text-slate-500 text-xs mb-2">
                <strong>Best for:</strong> Young professionals, social butterflies, night owls
              </p>
              <div className="bg-white rounded p-2 text-xs font-mono">
                <p className="text-green-600">+5 if restaurants ≥ 70 AND entertainment ≥ 20</p>
                <p className="text-blue-600">+3 if restaurants ≥ 50 AND entertainment ≥ 12</p>
                <p className="text-red-600">-5 if restaurants &lt; 30 OR entertainment &lt; 8</p>
              </div>
            </div>
          </div>
        </section>

        {/* Special Preferences */}
        <section id="special-preferences" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            5. Special Preferences
          </h2>

          <p className="text-slate-700 mb-4">
            Toggle these on to add bonus points for ZIPs that match specific criteria. Special preferences are secondary
            toggles that add smaller bonuses (+3) compared to lifestyle tags (+5/-5).
          </p>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Prefer Real Main Street or Town Square?</h3>
              <p className="text-slate-600 text-sm mb-2">
                Adds +3 bonus for ZIPs with a walkable town center or main street district, and -3 penalty for ZIPs
                without one.
              </p>
              <p className="text-slate-500 text-xs">Data: hasTownCenter = true/false</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Prefer Newer Construction?</h3>
              <p className="text-slate-600 text-sm mb-2">
                Adds +3 bonus for ZIPs with predominantly newer housing stock (post-2000 builds).
              </p>
              <p className="text-slate-500 text-xs">Data: medianYearBuilt ≥ 2000 OR newConstructionRatio ≥ 0.3</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900">Prefer Established Neighborhoods?</h3>
              <p className="text-slate-600 text-sm mb-2">
                Adds +3 bonus for ZIPs with mature trees, established character, and older homes.
              </p>
              <p className="text-slate-500 text-xs">
                Data: medianYearBuilt &lt; 1995 OR establishedNeighborhoodScore ≥ 70
              </p>
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section id="data-sources" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">6. Data Sources</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-100">
                <tr>
                  <th className="text-left p-3 font-semibold">Data Field</th>
                  <th className="text-left p-3 font-semibold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-3">Median Home Price</td>
                  <td className="p-3">Zillow, Redfin, Realtor.com (averaged)</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">School Scores</td>
                  <td className="p-3">GreatSchools API + Texas Education Agency ratings</td>
                </tr>
                <tr>
                  <td className="p-3">Safety Signal</td>
                  <td className="p-3">FBI UCR data + local police statistics</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">Commute Times</td>
                  <td className="p-3">Google Maps Distance Matrix API</td>
                </tr>
                <tr>
                  <td className="p-3">Restaurants/Entertainment</td>
                  <td className="p-3">Yelp Fusion API + Google Places</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">Parks Data</td>
                  <td className="p-3">Trust for Public Land + city parks departments</td>
                </tr>
                <tr>
                  <td className="p-3">Tax Rates</td>
                  <td className="p-3">County appraisal district records</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="p-3">Restaurant Diversity Index</td>
                  <td className="p-3">Calculated from Yelp cuisine category distribution</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Example Calculation */}
        <section id="example-calculation" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
            7. Example Calculation
          </h2>

          <div className="bg-slate-900 text-slate-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`User Preferences:
- Budget: $400k - $500k
- School Quality: 3
- Safety: 3  
- Lifestyle: 3
- Commute: 0 (not a factor)
- Lifestyle Tag: "Diverse & Global Culture"

ZIP 75007 (Carrollton):
- schoolQualityScore: 78 → weighted: 78 × 3 = 234
- safetyScore: 70 (signal 3) → weighted: 70 × 3 = 210
- lifestyleScore: 80 → weighted: 80 × 3 = 240
- commuteScore: ignored (weight = 0)

Base Score = (234 + 210 + 240) / (3 + 3 + 3) = 76.0

Lifestyle Tag Adjustment:
- restaurantDiversityIndex: 0.88 (≥ 0.85) → +5

Final Score = 76.0 + 5 = 81.0`}</pre>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">8. FAQ</h2>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">What does setting a weight to 0 do?</h3>
              <p className="text-slate-700">
                It completely removes that criterion from the score calculation. The ZIP won't be penalized or rewarded
                for that factor.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Why did a ZIP over my budget appear?</h3>
              <p className="text-slate-700">
                The system allows ZIPs up to 10% over your max budget to show "stretch" options worth considering. These
                are marked with "Over Budget" labels.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">How do lifestyle tags differ from priority weights?</h3>
              <p className="text-slate-700">
                Priority weights affect the base score calculation for ALL ZIPs. Lifestyle tags add targeted
                bonuses/penalties based on specific neighborhood characteristics. Tags are more surgical - they boost
                ideal matches and penalize poor matches.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Can I select multiple lifestyle tags?</h3>
              <p className="text-slate-700">
                Yes, up to 2. Each tag's bonuses and penalties stack, so choosing complementary tags (e.g., "Kid-First"
                + "Quiet & Predictable") can reinforce your preferences.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">
                What's the difference between "Top Matches" and "Honorable Mentions"?
              </h3>
              <p className="text-slate-700">
                Top Matches are the highest-scoring ZIPs that fit your budget. Honorable Mentions are the next tier -
                still strong matches but with slightly lower scores or minor trade-offs.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-8 mt-12 text-center text-slate-500 text-sm">
          <p>Last updated: November 2025</p>
        </div>
      </div>
    </div>
  )
}
