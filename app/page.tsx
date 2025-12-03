import { PreferencesForm } from "@/components/preferences-form"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <section
        className="w-full min-h-[48vh] lg:min-h-[52vh] flex items-center pt-[70px] lg:pt-[70px]"
        style={{
          /* Gradient using Sofee Blue (#6EA1D4) undertones */
          background: "linear-gradient(180deg, #E5EEF7 0%, #EDF3FA 25%, #F5F8FC 55%, #FFFFFF 100%)",
        }}
      >
        <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-12 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-2">
            <div className="relative flex-shrink-0 lg:mr-[42px] lg:-mt-[25px]">
              {/* Subtle radial highlight behind Sofee - using brand blue #6EA1D4 */}
              <div
                className="absolute inset-0 rounded-full scale-[1.4]"
                style={{
                  background: "radial-gradient(circle, rgba(110, 161, 212, 0.12) 0%, transparent 60%)",
                }}
              />

              <Image
                src="/sofeev3.png"
                alt="Sofee - your Dallas suburbs guide"
                width={214}
                height={214}
                className="relative lg:w-[242px] lg:h-[242px]"
                style={{
                  filter: "drop-shadow(0 8px 20px rgba(0, 0, 0, 0.12)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.08))",
                }}
                priority
              />
            </div>

            <div className="text-center lg:text-left flex-1 space-y-4">
              <h1 className="text-slate-900 leading-[1.15]">
                <span
                  className="block text-2xl sm:text-3xl lg:text-4xl xl:text-[44px] font-bold mb-2"
                  style={{ letterSpacing: "-0.015em" }}
                >
                  <span className="text-primary">Sofee.</span> Clarity for your next move.
                </span>
              </h1>

              <p
                className="text-lg sm:text-xl lg:text-[22px] text-slate-600 max-w-xl font-normal"
                style={{ lineHeight: "1.6" }}
              >
                Powered by data from 27 North Dallas ZIPs. Built to turn overwhelm into direction.
              </p>

              <div className="pt-1">
                <a
                  href="#preferences"
                  className="inline-flex items-center justify-center gap-2 px-6 md:px-10 py-3.5 md:py-4 text-white font-semibold text-base md:text-lg rounded-full hover:opacity-95 transition-all duration-200 w-full sm:w-auto"
                  style={{
                    background: "linear-gradient(135deg, #6EA1D4 0%, #5A8BC0 100%)",
                    boxShadow: "0 6px 20px rgba(110, 161, 212, 0.35), 0 2px 6px rgba(110, 161, 212, 0.2)",
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
