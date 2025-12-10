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

type FormState = "form" | "submitting" | "success" | "error"

export function LeadCaptureModal({
  open,
  onOpenChange,
  topMatches,
  budgetMin,
  budgetMax,
  workplaceZip,
  priorities,
  preferences,
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
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email"
    if (!formData.phone.trim()) newErrors.phone = "Phone is required"
    if (!formData.timeline) newErrors.timeline = "Please select a timeline"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setFormState("submitting")

    const isHotLead = formData.timeline === "asap" || formData.timeline === "3-6months"

    const leadData = {
      ...formData,
      budgetMin,
      budgetMax,
      workplaceZip,
      topMatches: topMatches.slice(0, 3).map((m) => ({
        zipCode: m.zipCode,
        city: m.city,
        score: m.score,
      })),
      priorities,
      preferences,
      timestamp: new Date().toISOString(),
      leadType: isHotLead ? "hot" : "nurture",
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
      setFormState("error")
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
      setErrors({})
    }, 300)
  }

  if (formState === "error") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-4">
              Something went wrong
            </h3>
            <p className="text-slate-600 mb-6">
              Please try again or email us at{" "}
              <a href="mailto:hello@asksofee.com" className="text-primary underline">
                hello@asksofee.com
              </a>
            </p>
            <Button onClick={() => setFormState("form")} variant="outline" className="mr-2">
              Try Again
            </Button>
            <Button onClick={handleClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (formState === "success") {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center py-6">
            <h3 className="text-2xl font-semibold text-slate-900 mb-4">
              You're all set!
            </h3>
            <p className="text-slate-600 mb-4">
              We're introducing you to <span className="font-semibold text-slate-800">Nancy Messiha</span> — a top-rated North Dallas agent who specializes in helping relocating families.
            </p>
            <p className="text-slate-600 mb-8">
              She'll reach out within 24 hours.
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
            Let's connect you with the right person.
          </DialogTitle>
          <DialogDescription className="sr-only">
            Fill out the form to connect with our local real estate expert
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Input
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => {
                  setFormData({ ...formData, firstName: e.target.value })
                  if (errors.firstName) setErrors({ ...errors, firstName: "" })
                }}
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div>
              <Input
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => {
                  setFormData({ ...formData, lastName: e.target.value })
                  if (errors.lastName) setErrors({ ...errors, lastName: "" })
                }}
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value })
                if (errors.email) setErrors({ ...errors, email: "" })
              }}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <Input
              type="tel"
              placeholder="Phone number"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value })
                if (errors.phone) setErrors({ ...errors, phone: "" })
              }}
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <Select
              value={formData.timeline}
              onValueChange={(value) => {
                setFormData({ ...formData, timeline: value })
                if (errors.timeline) setErrors({ ...errors, timeline: "" })
              }}
            >
              <SelectTrigger className={`w-full ${errors.timeline ? "border-red-500" : ""}`}>
                <SelectValue placeholder="When are you looking to move?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">ASAP / Within 3 months</SelectItem>
                <SelectItem value="3-6months">3–6 months</SelectItem>
                <SelectItem value="6-12months">6–12 months</SelectItem>
                <SelectItem value="exploring">Just exploring for now</SelectItem>
              </SelectContent>
            </Select>
            {errors.timeline && (
              <p className="text-xs text-red-500 mt-1">{errors.timeline}</p>
            )}
          </div>

          <Textarea
            placeholder="Anything else we should know? (Optional)"
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
