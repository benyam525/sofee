import { PreferencesForm } from "@/components/preferences-form"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <nav className="fixed top-4 right-4 z-50">
        <Link href="/admin" className="pill-button text-muted-foreground hover:text-foreground">
          Admin
        </Link>
      </nav>

      <section
        className="w-full min-h-[48vh] lg:min-h-[52vh] flex items-center pt-[70px] lg:pt-[70px]"
        style={{
          background: "linear-gradient(180deg, #E8F1FC 0%, #F0F7FF 25%, #F7FAFF 55%, #FFFFFF 100%)",
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-2">
            <div className="relative flex-shrink-0 lg:mr-[42px] lg:-mt-[25px]">
              {/* Subtle radial highlight behind Sofee */}
              <div
                className="absolute inset-0 rounded-full scale-[1.4]"
                style={{
                  background: "radial-gradient(circle, rgba(59, 130, 246, 0.07) 0%, transparent 60%)",
                }}
              />

              <Image
                src="/sofee-logo.png"
                alt="Sofee - your Dallas suburbs guide"
                width={214}
                height={214}
                className="relative lg:w-[242px] lg:h-[242px]"
                style={{
                  filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.15)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1))",
                }}
                priority
              />
            </div>

            <div className="text-center lg:text-left flex-1 space-y-4">
              <h1 className="text-slate-900 leading-[1.15]">
                <span
                  className="block text-[22px] sm:text-[26px] lg:text-[30px] font-semibold text-slate-700 mb-2"
                  style={{ letterSpacing: "0.01em" }}
                >
                  Hi, I'm <span className="text-primary font-bold">Sofee</span>.
                </span>
                <span
                  className="block text-2xl sm:text-3xl lg:text-4xl xl:text-[44px] font-bold"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  Let's solve your <span className="italic">'Where the hell do we live?'</span> crisis together.
                </span>
              </h1>

              <p
                className="text-lg sm:text-xl lg:text-[22px] text-slate-600 max-w-xl font-normal"
                style={{ lineHeight: "1.6" }}
              >
                I crunch the data across 27 North Dallas ZIP codes so you can stop guessing and start deciding.
              </p>

              <div className="pt-1">
                <a
                  href="#preferences"
                  className="inline-flex items-center gap-2 px-10 py-4 text-white font-semibold text-lg rounded-full hover:opacity-95 transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #2D7DFF 0%, #1D5ADC 100%)",
                    boxShadow: "0 6px 20px rgba(45, 125, 255, 0.35), 0 2px 6px rgba(45, 125, 255, 0.2)",
                  }}
                >
                  Find My Best Suburbs
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="w-full h-4 -mt-4 relative z-10"
        style={{
          background: "linear-gradient(180deg, transparent 0%, #F7FAFF 50%, white 100%)",
        }}
      />

      <section id="preferences" className="w-full px-6 lg:px-12 pb-20 -mt-4">
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
