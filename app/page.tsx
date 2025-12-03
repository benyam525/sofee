import { PreferencesForm } from "@/components/preferences-form"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="w-full min-h-[80vh] flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #E7F2FB 0%, #FFFFFF 65%)",
        }}
      >
        <div
          className="w-full flex flex-col items-center text-center"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "80px 24px 120px",
          }}
        >
          {/* Logo Lockup */}
          <div
            className="relative inline-flex items-center"
            style={{ gap: "10px", marginBottom: "28px" }}
          >
            {/* Radial glow behind lockup */}
            <div
              className="absolute z-[-1]"
              style={{
                inset: "-28px -40px",
                background: "radial-gradient(circle, rgba(145, 189, 235, 0.18) 0%, transparent 60%)",
              }}
            />
            <Image
              src="/sofee-logo.png"
              alt="Sofee"
              width={56}
              height={56}
              className="rounded-full"
              style={{
                boxShadow: "0 18px 40px rgba(62, 123, 196, 0.25)",
              }}
              priority
            />
            <span
              style={{
                fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
                fontSize: "26px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: "#0B2037",
              }}
            >
              Sofee
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: "clamp(30px, 5vw, 40px)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              color: "#0B2037",
              marginBottom: "16px",
            }}
          >
            Know exactly where you belong.
          </h1>

          {/* Subcopy */}
          <p
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: "clamp(16px, 2.5vw, 18px)",
              lineHeight: 1.6,
              fontWeight: 400,
              color: "#4A6075",
              maxWidth: "540px",
              margin: "0 auto 32px",
            }}
          >
            Powered by data from 27 North Dallas ZIPs, Sofee turns guesswork into clarity.
          </p>

          {/* CTA Button */}
          <a
            href="#preferences"
            className="inline-flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5"
            style={{
              padding: "14px 32px",
              borderRadius: "999px",
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: "16px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #3579D6 0%, #5593F0 100%)",
              color: "#FFFFFF",
              boxShadow: "0 14px 30px rgba(53, 121, 214, 0.35)",
            }}
          >
            Find My Best Suburbs
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </section>

      <div
        className="w-full h-4 -mt-4 relative z-10"
        style={{
          background: "linear-gradient(180deg, transparent 0%, #F7FAFF 50%, white 100%)",
        }}
      />

      <section id="preferences" className="w-full px-4 md:px-6 lg:px-12 pb-16 md:pb-20 -mt-4">
        <div className="max-w-6xl mx-auto">
          <PreferencesForm />
        </div>
      </section>

      <footer className="w-full py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="glass-card-thin rounded-2xl py-4 px-6 text-center">
            <p className="text-sm text-muted-foreground">Made with care for families relocating to DFW</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
