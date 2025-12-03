import type React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SiteNav } from "@/components/site-nav"
import "./globals.css"

// Inter - per Sofee brand spec (clean, geometric, professional)
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Sofee - Your Honest Guide to the Dallas Suburbs",
  description: "Find your perfect Dallas suburb with Sofee, your honest guide to North Dallas neighborhoods. Data-driven recommendations for families relocating to DFW.",
  generator: "v0.app",
  metadataBase: new URL("https://sofee-home.vercel.app"),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    title: "Sofee - Your Honest Guide to the Dallas Suburbs",
    description: "Find your perfect Dallas suburb with data-driven recommendations for families relocating to DFW.",
    url: "https://sofee-home.vercel.app",
    siteName: "Sofee",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sofee - Dallas Suburbs Guide",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sofee - Your Honest Guide to the Dallas Suburbs",
    description: "Find your perfect Dallas suburb with data-driven recommendations for families relocating to DFW.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased gradient-bg min-h-screen`}
      >
        <SiteNav />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
