import { Suspense } from "react"
import { ResultsContent } from "@/components/results-content"

export default function ResultsPage() {
  return (
    <main className="min-h-screen gradient-bg">
      <div className="mx-auto max-w-6xl px-6 lg:px-12 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-20">
              <div className="glass-card-strong rounded-2xl px-8 py-6">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span className="text-muted-foreground font-medium">Finding your perfect neighborhoods...</span>
                </div>
              </div>
            </div>
          }
        >
          <ResultsContent />
        </Suspense>
      </div>
    </main>
  )
}
