'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '1rem',
            padding: '2rem',
            textAlign: 'center',
            maxWidth: '400px',
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Something went wrong
            </h2>
            <p style={{ color: '#666', marginBottom: '1.5rem' }}>
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '0.5rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
