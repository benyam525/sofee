"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface LeadCaptureModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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

type FormState = "form" | "submitting" | "success"

export function LeadCaptureModal({
  open,
  onOpenChange,
  topMatches,
  budgetMin,
  budgetMax,
  priorities,
}: LeadCaptureModalProps) {
  const [formState, setFormState] = useState<FormState>("form")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    timeline: "",
    notes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("submitting")

    const leadData = {
      ...formData,
      budgetMin,
      budgetMax,
      topMatches: topMatches.slice(0, 3).map((m) => ({
        zipCode: m.zipCode,
        city: m.city,
      })),
      priorities,
      timestamp: new Date().toISOString(),
    }

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(leadData),
      })

      if (response.ok) {
        setFormState("success")
      } else {
        throw new Error("Failed to submit")
      }
    } catch (error) {
      console.error("Failed to submit lead:", error)
      setFormState("success")
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setFormState("form")
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        timeline: "",
        notes: "",
      })
    }, 300)
  }

  const topLocations = topMatches
    .slice(0, 3)
    .map((m) => m.city || `ZIP ${m.zipCode}`)
    .join(", ")

  if (formState === "success") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              You're all set!
            </h3>
            <p className="text-slate-600 mb-6">
              We'll connect you with an agent who specializes in{" "}
              <span className="font-medium text-slate-800">{topLocations}</span>{" "}
              within 24–48 hours.
            </p>
            <p className="text-sm text-slate-500 mb-8">
              Check your email for a confirmation.
            </p>
            <Button onClick={handleClose} className="w-full">
              Back to Results
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Let's find you the right agent.
          </DialogTitle>
          <DialogDescription className="sr-only">
            Fill out the form to connect with a local real estate agent
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div>
              <Input
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
          </div>

          <Input
            type="email"
            placeholder="Email address"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <Input
            type="tel"
            placeholder="Phone number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          <Select
            value={formData.timeline}
            onValueChange={(value) =>
              setFormData({ ...formData, timeline: value })
            }
            required
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="When are you looking to move?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asap">ASAP / Within 3 months</SelectItem>
              <SelectItem value="3-6months">3–6 months</SelectItem>
              <SelectItem value="6-12months">6–12 months</SelectItem>
              <SelectItem value="exploring">Just exploring for now</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder="Optional notes..."
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            className="min-h-[80px]"
          />

          <Button
            type="submit"
            className="w-full"
            disabled={formState === "submitting"}
          >
            {formState === "submitting" ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>

          <p className="text-xs text-center text-slate-500">
            By submitting, you agree to be contacted by a Sofee partner agent.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  )
}
