export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="h-10 w-64 bg-muted animate-pulse rounded-lg mb-2" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded-lg" />
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-96 w-full bg-muted animate-pulse rounded-xl" />
      </div>
    </div>
  )
}
