"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, BarChart3, GraduationCap, Info, Menu, X, Sparkles, Vote, Fingerprint } from "lucide-react"
import { useState } from "react"
import Image from "next/image"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/results", label: "Results", icon: BarChart3 },
  { href: "/schools/clarity", label: "School Clarity Grid", icon: GraduationCap, premium: true },
  { href: "/civic", label: "Civic Profile", icon: Vote, premium: true },
  { href: "/zip-identity", label: "ZIP Identity", icon: Fingerprint, premium: true },
  { href: "/about", label: "About", icon: Info },
]

export function SiteNav() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Glass background */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/50" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative w-8 h-8">
              <Image
                src="/sofeev3.png"
                alt="Sofee"
                fill
                className="object-contain group-hover:scale-110 transition-transform"
              />
            </div>
            <span className="font-bold text-lg text-slate-800">Sofee</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                    isActive ? "text-primary bg-primary/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.premium && (
                    <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                      <Sparkles className="w-2.5 h-2.5" />
                      Pro
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                      isActive ? "text-primary bg-primary/10" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {item.premium && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-bold rounded-full uppercase tracking-wide ml-auto">
                        <Sparkles className="w-2.5 h-2.5" />
                        Pro
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
