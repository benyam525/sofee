import { PreferencesForm } from "@/components/preferences-form"
import { Typewriter } from "@/components/typewriter"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section
        className="w-full min-h-[80vh] flex flex-col items-center justify-center"
        style={{
          background: "linear-gradient(180deg, #E7F2FB 0%, #FFFFFF 70%)",
        }}
      >
        <div
          className="w-full flex flex-col items-center text-center"
          style={{
            maxWidth: "720px",
            margin: "0 auto",
            padding: "60px 24px 100px",
          }}
        >
          {/* Logo */}
          <div className="mb-4 md:mb-8">
            <Image
              src="/sofee-logo.png"
              alt="Sofee"
              width={322}
              height={215}
              className="w-[240px] h-auto md:w-[322px]"
              priority
            />
          </div>

          {/* One-liner */}
          <p
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: "13px",
              fontWeight: 500,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              color: "#6B7C8F",
              marginBottom: "16px",
            }}
          >
            The smarter way to find your suburb in North Dallas
          </p>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              fontSize: "clamp(32px, 6vw, 48px)",
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              fontWeight: 700,
              color: "#0B2037",
              marginBottom: "20px",
              minHeight: "2.2em",
            }}
          >
            <Typewriter
              text="Choosing a suburb is an ink blot — just like the one next to my name."
              hesitationWords={["an", "ink", "blot"]}
              typingSpeed={45}
            />
          </h1>

          {/* Subcopy */}
          <p
            style={{
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: "clamp(17px, 2.5vw, 20px)",
              lineHeight: 1.6,
              fontWeight: 400,
              color: "#4A6075",
              maxWidth: "540px",
              margin: "0 auto 36px",
            }}
          >
            It's messy, irregular, stressful, and noisy — the digital equivalent of too many damn tabs open.
            <br /><br />
            I'm Sofee, and my job is simple: take the chaos and give you one clear, confident answer to the question every family gets stuck on: <em>Where the hell should we live?</em>
          </p>

          {/* CTA Button */}
          <a
            href="#preferences"
            className="inline-flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5 hover:opacity-95"
            style={{
              padding: "16px 36px",
              borderRadius: "999px",
              fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
              fontSize: "17px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #6EA1D4 0%, #5A8BC0 100%)",
              color: "#FFFFFF",
              boxShadow: "0 8px 24px rgba(110, 161, 212, 0.35)",
            }}
          >
            Show Me Where I Belong
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
