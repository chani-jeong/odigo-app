import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css';
import './styles/tokens.css'
import './i18n'
import App from './App.jsx'

Sentry.init({
  dsn: 'https://d4da2f320bc9f062622e227370de69fe@o4512033991163905.ingest.us.sentry.io/4512034003091456',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
})

function ErrorFallback() {
  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
        background: 'var(--bg-main, #FDFBF7)',
        color: 'var(--text-primary, #1A1A1A)',
        fontFamily: 'var(--font-sans, sans-serif)',
      }}
    >
      <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-secondary, #6B7280)' }}>
        Something went wrong. Please refresh the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          width: '160px',
          height: '48px',
          borderRadius: '24px',
          background: 'var(--brand-primary, #59CBB7)',
          color: '#fff',
          fontSize: '15px',
          fontWeight: '600',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        새로고침
      </button>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
