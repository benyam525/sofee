'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card-strong rounded-2xl p-8 text-center max-w-md">
        <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="pill-button pill-button-active px-6 py-2 rounded-full font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
