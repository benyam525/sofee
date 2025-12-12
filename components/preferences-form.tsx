"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { CRITERIA, type UserWeights, type LifestyleTag, type UserSpecialPrefs, type CriterionKey } from "@/lib/criteria"

const PREFERENCES_STORAGE_KEY = "sofee-preferences"

interface StoredPreferences {
  budgetRange: [number, number]
  weights: UserWeights
  fromZip: string
  workplaceZip: string
  lifestyleTags: LifestyleTag[]
  specialPrefs: UserSpecialPrefs
  excludedCities: string[]
  nonNegotiables: CriterionKey[]
}

export function PreferencesForm() {
  const router = useRouter()

  const [isHydrated, setIsHydrated] = useState(false)

  const [budgetRange, setBudgetRange] = useState<[number, number]>([350000, 600000])

  const [weights, setWeights] = useState<UserWeights>(() => {
    const initialWeights = {} as UserWeights
    CRITERIA.forEach((c) => {
      initialWeights[c.key] = c.defaultWeight
    })
    return initialWeights
  })

  const [fromZip, setFromZip] = useState<string>("")
  const [workplaceZip, setWorkplaceZip] = useState<string>("")
  const [lifestyleTags, setLifestyleTags] = useState<LifestyleTag[]>([])
  const [specialPrefs, setSpecialPrefs] = useState<UserSpecialPrefs>({
    preferTownCenter: false,
    preferNewerHomes: false,
    preferEstablishedNeighborhoods: false,
  })
  const [excludedCities, setExcludedCities] = useState<string[]>([])
  const [nonNegotiables, setNonNegotiables] = useState<CriterionKey[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_STORAGE_KEY)
      if (stored) {
        const prefs: StoredPreferences = JSON.parse(stored)
        setBudgetRange(prefs.budgetRange)
        setWeights(prefs.weights)
        setFromZip(prefs.fromZip)
        setWorkplaceZip(prefs.workplaceZip)
        setLifestyleTags(prefs.lifestyleTags)
        setSpecialPrefs(prefs.specialPrefs)
        setExcludedCities(prefs.excludedCities)
        setNonNegotiables(prefs.nonNegotiables || [])
      }
    } catch (e) {
      // Ignore localStorage errors
    }
    setIsHydrated(true)
  }, [])

  const formatBudget = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`
    }
    return `$${(value / 1000).toFixed(0)}k`
  }

  const budgetMarkers = [
    { value: 300000, label: "$300k" },
    { value: 500000, label: "$500k" },
    { value: 750000, label: "$750k" },
    { value: 1000000, label: "$1M" },
    { value: 1500000, label: "Stretch" },
  ]

  const lifestyleOptions: { id: LifestyleTag; label: string }[] = [
    { id: "quietPredictable", label: "Quiet & predictable" },
    { id: "sportsHeavy", label: "Sports-heavy community" },
    { id: "diverseGlobal", label: "Diverse & global culture" },
    { id: "upscaleRefined", label: "Upscale & refined" },
    { id: "kidFirst", label: "Kid-first suburbia" },
    { id: "townCenter", label: "Near a real town square" },
    { id: "lateNightFood", label: "Late-night food & scene" },
  ]

  const allCities = [
    "Frisco",
    "Allen",
    "McKinney",
    "Plano",
    "Plano West",
    "Prosper",
    "Celina",
    "Southlake",
    "Colleyville",
    "Carrollton",
    "Coppell",
    "Grand Prairie",
    "Richardson",
    "Irving",
    "Farmers Branch",
    "Lewisville",
  ]

  const handleLifestyleToggle = (optionId: LifestyleTag) => {
    setLifestyleTags((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId)
      } else {
        if (prev.length >= 2) {
          return prev
        }
        return [...prev, optionId]
      }
    })
  }

  const handleCityToggle = (city: string) => {
    setExcludedCities((prev) => {
      if (prev.includes(city)) {
        return prev.filter((c) => c !== city)
      } else {
        return [...prev, city]
      }
    })
  }

  const handleNonNegotiableToggle = (key: CriterionKey) => {
    setNonNegotiables((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key)
      } else {
        if (prev.length >= 3) {
          return prev // Max 3 non-negotiables
        }
        return [...prev, key]
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const prefsToStore: StoredPreferences = {
      budgetRange,
      weights,
      fromZip,
      workplaceZip,
      lifestyleTags,
      specialPrefs,
      excludedCities,
      nonNegotiables,
    }
    try {
      localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefsToStore))
    } catch (e) {
      // Ignore localStorage errors
    }

    const params = new URLSearchParams({
      budget: budgetRange[1].toString(),
      budgetMin: budgetRange[0].toString(),
      budgetMax: budgetRange[1].toString(),
      fromZip: fromZip || "",
      workplaceZip: workplaceZip || "",
      lifestyleTags: lifestyleTags.join(","),
      preferTownCenter: specialPrefs.preferTownCenter.toString(),
      preferNewerHomes: specialPrefs.preferNewerHomes.toString(),
      preferEstablishedNeighborhoods: specialPrefs.preferEstablishedNeighborhoods.toString(),
      excludedCities: excludedCities.join(","),
      nonNegotiables: nonNegotiables.join(","),
    })

    Object.entries(weights).forEach(([key, value]) => {
      params.append(key, value.toString())
    })

    router.push(`/results?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-8">
      <div className="glass-card-strong rounded-2xl md:rounded-[2rem] p-5 md:p-10">
        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="h-8 md:h-10 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-full" />
          <div>
            <h3 className="text-xl md:text-2xl font-semibold text-foreground">What's Your Budget?</h3>
            <p className="text-sm md:text-base text-muted-foreground mt-1">Set your comfortable range — we'll find what fits</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 md:gap-8 mb-8 md:mb-10">
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Min</span>
            <div className="text-2xl md:text-4xl font-bold text-foreground mt-1">{formatBudget(budgetRange[0])}</div>
          </div>
          <div className="w-8 md:w-12 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div className="text-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Max</span>
            <div className="text-2xl md:text-4xl font-bold text-primary mt-1">{formatBudget(budgetRange[1])}</div>
          </div>
        </div>

        <div className="px-2">
          <Slider
            value={budgetRange}
            onValueChange={(vals) => setBudgetRange(vals as [number, number])}
            min={250000}
            max={1500000}
            step={25000}
            className="w-full"
          />

          <div className="flex justify-between mt-4 md:mt-6 px-1">
            {budgetMarkers.map((marker) => (
              <div key={marker.value} className="flex flex-col items-center">
                <div className="h-2 w-px bg-border" />
                <span
                  className={`text-[10px] md:text-xs mt-1.5 md:mt-2 font-medium ${
                    marker.label === "Stretch" ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {marker.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6 glow-focus max-w-md">
        <Label htmlFor="workplaceZip" className="text-sm font-semibold text-foreground">
          Workplace ZIP <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          id="workplaceZip"
          type="text"
          placeholder="75001"
          value={workplaceZip}
          onChange={(e) => setWorkplaceZip(e.target.value)}
          className="mt-3 bg-white/50 border-white/30 focus:bg-white/70 transition-all duration-300 rounded-xl h-12 text-lg"
          maxLength={5}
        />
        <p className="text-xs text-muted-foreground mt-2">Leave blank for central DFW default</p>
      </div>

      <div className="grid gap-5 md:gap-6 lg:grid-cols-2">
        <div className="glass-card-strong rounded-2xl md:rounded-[2rem] p-5 md:p-8 space-y-5 md:space-y-6">
          <div className="flex items-center gap-3 md:gap-4 border-b border-border/40 pb-4 md:pb-5">
            <div className="h-8 md:h-10 w-1.5 bg-gradient-to-b from-primary to-chart-3 rounded-full" />
            <h3 className="text-lg md:text-xl font-semibold text-foreground">Priorities & Trade-offs</h3>
          </div>

          <div className="space-y-3 md:space-y-4">
            {CRITERIA.map((c) => (
              <div key={c.key} className="glass-card rounded-xl md:rounded-2xl p-4 md:p-5 space-y-3 md:space-y-4 transition-elastic hover:scale-[1.01]">
                <div className="flex items-center justify-between gap-2">
                  <Label className="text-sm font-semibold text-foreground leading-tight">{c.label}</Label>
                  <span className="text-sm font-bold text-primary bg-primary/10 px-2.5 md:px-3 py-1 rounded-full shrink-0">
                    {weights[c.key]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.description}</p>
                <Slider
                  value={[weights[c.key]]}
                  onValueChange={(vals) => setWeights((prev) => ({ ...prev, [c.key]: vals[0] }))}
                  min={c.minWeight}
                  max={c.maxWeight}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                  <span>Not a factor</span>
                  <span>Critical</span>
                </div>
              </div>
            ))}
          </div>

          {/* Non-Negotiables Section */}
          <div className="glass-card rounded-xl md:rounded-2xl p-4 md:p-5 bg-gradient-to-br from-amber-50/80 to-orange-50/60 border border-amber-200/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-1 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">Non-Negotiables</h4>
                <p className="text-[10px] text-amber-700/80">Select up to 3 dealbreakers that must be strong</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 md:gap-2">
              {CRITERIA.map((c) => {
                const isSelected = nonNegotiables.includes(c.key)
                const isDisabled = nonNegotiables.length >= 3 && !isSelected
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => !isDisabled && handleNonNegotiableToggle(c.key)}
                    className={`
                      px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg text-[10px] md:text-xs font-medium
                      transition-all duration-150 ease-out
                      ${isSelected
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-300"
                        : "bg-white/90 border border-amber-200 text-amber-800 hover:bg-amber-50 hover:border-amber-300"}
                      ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}
                    `}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5 md:space-y-6">
          <div className="glass-card-strong rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 border-b border-border/40 pb-4 md:pb-5 mb-5 md:mb-6">
              <div className="h-8 md:h-10 w-1.5 bg-gradient-to-b from-chart-2 to-chart-4 rounded-full" />
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Lifestyle & Community</h3>
                <p className="text-xs text-muted-foreground mt-1">Select up to 2 that match your vibe</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {lifestyleOptions.map((option) => {
                const isSelected = lifestyleTags.includes(option.id)
                const isDisabled = lifestyleTags.length >= 2 && !isSelected
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => !isDisabled && handleLifestyleToggle(option.id)}
                    className={`
                      px-3 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm font-medium
                      transition-colors duration-150 ease-out
                      ${isSelected
                        ? "bg-gradient-to-r from-primary to-chart-3 text-white shadow-md"
                        : "bg-white/80 border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"}
                      ${isDisabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"}
                    `}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 border-b border-border/40 pb-4 md:pb-5 mb-5 md:mb-6">
              <div className="h-8 md:h-10 w-1.5 bg-gradient-to-b from-rose-400/60 to-rose-300/40 rounded-full" />
              <div>
                <h3 className="text-lg md:text-xl font-semibold text-foreground">Exclude Cities</h3>
                <p className="text-xs text-muted-foreground mt-1">Select any you definitely don't want</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1.5 md:gap-2">
              {allCities.map((city) => (
                <label
                  key={city}
                  className={`
                    flex items-center gap-2 md:gap-2.5 px-3 md:px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl cursor-pointer transition-all duration-200 text-xs md:text-sm
                    ${
                      excludedCities.includes(city)
                        ? "bg-rose-50 border border-rose-200/60 text-rose-700"
                        : "glass-card-thin hover:bg-white/60"
                    }
                  `}
                >
                  <Checkbox
                    id={`exclude-${city}`}
                    checked={excludedCities.includes(city)}
                    onCheckedChange={() => handleCityToggle(city)}
                    className="data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500 h-4 w-4"
                  />
                  <span className="font-medium truncate">{city}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="glass-card-strong rounded-2xl md:rounded-[2rem] p-5 md:p-8">
            <div className="flex items-center gap-3 md:gap-4 border-b border-border/40 pb-4 md:pb-5 mb-5 md:mb-6">
              <div className="h-8 md:h-10 w-1.5 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full" />
              <h3 className="text-lg md:text-xl font-semibold text-foreground">Special Preferences</h3>
            </div>
            <div className="space-y-2.5 md:space-y-3">
              {[
                {
                  id: "preferTownCenter",
                  label: "Prefer real main street or town square?",
                  key: "preferTownCenter" as const,
                },
                { id: "preferNewerHomes", label: "Prefer newer construction?", key: "preferNewerHomes" as const },
                {
                  id: "preferEstablishedNeighborhoods",
                  label: "Prefer established neighborhoods?",
                  key: "preferEstablishedNeighborhoods" as const,
                },
              ].map((pref) => (
                <div key={pref.id} className="glass-card-thin rounded-lg md:rounded-xl p-3 md:p-4 flex items-center justify-between gap-3 md:gap-4">
                  <Label htmlFor={pref.id} className="text-xs md:text-sm font-medium leading-snug cursor-pointer">
                    {pref.label}
                  </Label>
                  <Switch
                    id={pref.id}
                    checked={specialPrefs[pref.key]}
                    onCheckedChange={(checked) => setSpecialPrefs((prev) => ({ ...prev, [pref.key]: checked }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card-thin rounded-2xl p-5 glow-focus">
            <Label htmlFor="fromZip" className="text-sm font-medium text-foreground">
              ZIP Code Moving From <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="fromZip"
              type="text"
              placeholder="94102"
              value={fromZip}
              onChange={(e) => setFromZip(e.target.value)}
              className="mt-3 bg-white/40 border-white/30 focus:bg-white/60 transition-all duration-300 rounded-xl h-11"
              maxLength={5}
            />
          </div>
        </div>
      </div>

      <div className="pt-4 flex justify-center px-4 md:px-0">
        <Button
          type="submit"
          size="lg"
          className="w-full md:w-auto px-8 md:px-20 h-14 md:h-16 text-base md:text-lg font-semibold rounded-full hover:opacity-90 transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: "linear-gradient(135deg, #6EA1D4 0%, #5A8BC0 100%)",
            boxShadow: "0 8px 24px rgba(110, 161, 212, 0.35), 0 4px 8px rgba(110, 161, 212, 0.2)",
          }}
        >
          Find My Neighborhoods
        </Button>
      </div>
    </form>
  )
}
