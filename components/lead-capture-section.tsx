"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LeadCaptureModal } from "@/components/lead-capture-modal"
import { UserPlus } from "lucide-react"

interface LeadCaptureSectionProps {
  topMatches: Array<{ zipCode: string; city?: string }>
  budgetMin?: string
  budgetMax?: string
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
}

export function LeadCaptureSection({
  topMatches,
  budgetMin,
  budgetMax,
  priorities,
}: LeadCaptureSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div className="mt-8 md:mt-12">
        <div className="bg-gradient-to-br from-sky-50 to-white rounded-2xl p-6 md:p-8 border border-sky-100 shadow-sm">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
              Ready to take the next step?
            </h3>
            <p className="text-slate-600 mb-6">
              We'll connect you with a local agent who already knows your budget,
              priorities, and top neighborhoods — no starting from scratch.
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Connect Me With an Agent
            </Button>
            <p className="text-xs text-slate-500 mt-4">
              No cold calls. No spam. Just a helpful intro.
            </p>
          </div>
        </div>
      </div>

      <LeadCaptureModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        topMatches={topMatches}
        budgetMin={budgetMin}
        budgetMax={budgetMax}
        priorities={priorities}
      />
    </>
  )
}
