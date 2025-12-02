import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ZIP Identity Profiles™ | Sofee",
  description: "Honest, data-driven insights about who each ZIP code is really for.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function ZipIdentityLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
