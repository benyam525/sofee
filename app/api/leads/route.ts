import { NextResponse } from "next/server"

interface LeadData {
  firstName: string
  lastName: string
  email: string
  phone: string
  timeline: string
  notes?: string
  budgetMin?: string
  budgetMax?: string
  topMatches: Array<{ zipCode: string; city?: string }>
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
  timestamp: string
}

function formatLeadEmail(lead: LeadData): string {
  const timelineLabels: Record<string, string> = {
    asap: "ASAP / Within 3 months",
    "3-6months": "3–6 months",
    "6-12months": "6–12 months",
    exploring: "Just exploring for now",
  }

  const topMatchesList = lead.topMatches
    .map((m) => (m.city ? `${m.city} (${m.zipCode})` : `ZIP ${m.zipCode}`))
    .join(", ")

  const prioritiesSection = lead.priorities
    ? Object.entries(lead.priorities)
        .filter(([, value]) => value)
        .map(([key, value]) => `  • ${key}: ${value}/5`)
        .join("\n")
    : "Not specified"

  return `
NEW LEAD FROM SOFEE
====================

CONTACT INFORMATION
-------------------
Name: ${lead.firstName} ${lead.lastName}
Email: ${lead.email}
Phone: ${lead.phone}
Timeline: ${timelineLabels[lead.timeline] || lead.timeline}

TOP NEIGHBORHOODS
-----------------
${topMatchesList}

BUDGET
------
Min: $${Number(lead.budgetMin || 0).toLocaleString()}
Max: $${Number(lead.budgetMax || 0).toLocaleString()}

PRIORITIES
----------
${prioritiesSection}

NOTES
-----
${lead.notes || "None provided"}

---
Submitted: ${new Date(lead.timestamp).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "full",
    timeStyle: "short",
  })} CT
`
}

export async function POST(request: Request) {
  try {
    const lead: LeadData = await request.json()

    // Validate required fields
    if (!lead.firstName || !lead.lastName || !lead.email || !lead.phone || !lead.timeline) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Format the email content
    const emailContent = formatLeadEmail(lead)

    // Log the lead for debugging
    console.log("[LEAD CAPTURE]", emailContent)

    // Send email notification using a simple fetch to a mail service
    // For now, we'll use Resend if available, otherwise just log
    const resendApiKey = process.env.RESEND_API_KEY

    if (resendApiKey) {
      try {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Sofee Leads <leads@asksofee.com>",
            to: ["hello@asksofee.com"],
            subject: `New Lead: ${lead.firstName} ${lead.lastName} - ${lead.topMatches[0]?.city || "DFW"}`,
            text: emailContent,
          }),
        })

        if (!emailResponse.ok) {
          console.error("[LEAD CAPTURE] Email send failed:", await emailResponse.text())
        } else {
          console.log("[LEAD CAPTURE] Email sent successfully")
        }
      } catch (emailError) {
        console.error("[LEAD CAPTURE] Email error:", emailError)
      }
    } else {
      console.log("[LEAD CAPTURE] No RESEND_API_KEY configured, email not sent")
    }

    // Return success even if email fails - we've logged the lead
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[LEAD CAPTURE] Error:", error)
    return NextResponse.json({ error: "Failed to process lead" }, { status: 500 })
  }
}
