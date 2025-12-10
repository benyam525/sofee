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
  workplaceZip?: string
  topMatches: Array<{ zipCode: string; city?: string; score?: number }>
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
  timestamp: string
  leadType: "hot" | "nurture"
}

const timelineLabels: Record<string, string> = {
  asap: "ASAP / Within 3 months",
  "3-6months": "3–6 months",
  "6-12months": "6–12 months",
  exploring: "Just exploring for now",
}

function formatLeadEmail(lead: LeadData): string {
  const topMatchesList = lead.topMatches
    .map((m, i) => {
      const location = m.city ? `${m.zipCode} (${m.city})` : m.zipCode
      const score = m.score ? ` — ${Math.round(m.score)}/100` : ""
      return `${i + 1}. ${location}${score}`
    })
    .join("\n")

  const formatYesNo = (value?: string) => {
    if (!value) return "No"
    return value === "true" ? "Yes" : "No"
  }

  return `NEW LEAD FROM SOFEE

Name: ${lead.firstName} ${lead.lastName}
Email: ${lead.email}
Phone: ${lead.phone}
Timeline: ${timelineLabels[lead.timeline] || lead.timeline}
Notes: ${lead.notes || "None"}

---

SEARCH CRITERIA

Budget: $${Number(lead.budgetMin || 0).toLocaleString()} – $${Number(lead.budgetMax || 0).toLocaleString()}
Workplace ZIP: ${lead.workplaceZip || "Not provided"}

Top Matches:
${topMatchesList}

Priorities (scale of 1-5):
- School Quality: ${lead.priorities?.schoolQuality || "3"}
- Commute Burden: ${lead.priorities?.commuteBurden || "3"}
- Safety & Stability: ${lead.priorities?.safetyStability || "3"}
- Lifestyle/Convenience: ${lead.priorities?.lifestyleConvenienceCulture || "3"}
- Family-Friendly Amenities: ${lead.priorities?.childDevelopmentOpportunity || "3"}
- Tax Burden: ${lead.priorities?.taxBurden || "3"}
- Toll Road Convenience: ${lead.priorities?.tollRoadConvenience || "3"}

Lifestyle Tags: ${lead.preferences?.lifestyleTags || "None"}
Excluded Cities: ${lead.preferences?.excludedCities || "None"}

Preferences:
- Town Center: ${formatYesNo(lead.preferences?.preferTownCenter)}
- Newer Homes: ${formatYesNo(lead.preferences?.preferNewerHomes)}
- Established Neighborhoods: ${formatYesNo(lead.preferences?.preferEstablishedNeighborhoods)}

---

Submitted: ${new Date(lead.timestamp).toLocaleString("en-US", {
    timeZone: "America/Chicago",
    dateStyle: "full",
    timeStyle: "short",
  })} CT`
}

function getEmailSubject(lead: LeadData): string {
  const timelineText = timelineLabels[lead.timeline] || lead.timeline
  if (lead.leadType === "hot") {
    return `🔥 New Sofee Lead: ${lead.firstName} ${lead.lastName} — ${timelineText}`
  }
  return `🌱 Nurture Lead: ${lead.firstName} ${lead.lastName} — ${timelineText}`
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
    const emailSubject = getEmailSubject(lead)

    // Log the lead for debugging
    console.log("[LEAD CAPTURE]", emailSubject)
    console.log(emailContent)

    // Send email notification using Resend if available
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
            subject: emailSubject,
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
