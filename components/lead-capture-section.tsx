"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LeadCaptureModal } from "@/components/lead-capture-modal"

interface LeadCaptureSectionProps {
  topMatches: Array<{ zipCode: string; city?: string; score?: number }>
  budgetMin?: string
  budgetMax?: string
  workplaceZip?: string
  priorities?: {
    schoolQuality?: string
    commuteBurden?: string
    safetyStability?: string
    affordability?: string
    lifestyleConvenienceCulture?: string
    childDevelopmentOpportunity?: string
    taxBurden?: string
    tollRoadConvenience?: string
  }
  preferences?: {
    lifestyleTags?: string
    excludedCities?: string
    preferTownCenter?: string
    preferNewerHomes?: string
    preferEstablishedNeighborhoods?: string
  }
}

export function LeadCaptureSection({
  topMatches,
  budgetMin,
  budgetMax,
  workplaceZip,
  priorities,
  preferences,
}: LeadCaptureSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="bg-gradient-to-br from-sky-50/80 to-white rounded-2xl p-6 md:p-8 border border-sky-100/50 shadow-sm">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
            Want a warm intro to our local expert?
          </h3>
          <p className="text-slate-600 mb-6 leading-relaxed">
            We don't work with a list of random agents. Sofee partners with one vetted,
            top-rated North Dallas agent — someone we'd recommend to our own family.
            She already knows your budget, priorities, and top ZIPs.
          </p>
          <Button
            onClick={() => setModalOpen(true)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8"
          >
            Get Introduced
          </Button>
          <p className="text-xs text-slate-500 mt-4">
            One agent. One intro. No spam.
          </p>
        </div>
      </div>

      <LeadCaptureModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        topMatches={topMatches}
        budgetMin={budgetMin}
        budgetMax={budgetMax}
        workplaceZip={workplaceZip}
        priorities={priorities}
        preferences={preferences}
      />
    </>
  )
}
