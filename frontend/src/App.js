import React, { useState } from 'react';
import TripForm from './components/TripForm';
import ResultCard from './components/ResultCard';

function App() {
  const [result, setResult] = useState(null);
  const handleReset = () => setResult(null);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}>

      {/* ── Ambient background glow ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.12) 0%, transparent 70%)'
      }} />

      {/* ── Navbar ── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(12,12,16,0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
      }}>
        <div style={{
          maxWidth: 680, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: 60,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}></span>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              Worth the Drive
            </span>
          </div>
          <span style={{
            fontSize: 11, fontWeight: 500, letterSpacing: '0.08em',
            color: 'var(--accent-light)',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.2)',
            padding: '3px 10px', borderRadius: 20,
            textTransform: 'uppercase',
          }}>
      
          </span>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main style={{
        maxWidth: 680, margin: '0 auto',
        padding: '48px 20px 80px',
        position: 'relative', zIndex: 1,
      }}>

        {/* Hero — only shows when no result */}
        {!result && (
          <div className="fade-up" style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{
              fontSize: 11, fontWeight: 600, letterSpacing: '0.14em',
              color: 'var(--accent-light)', textTransform: 'uppercase',
              marginBottom: 14,
            }}>
              Real data · Real prices
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.4rem, 6vw, 3.6rem)',
              fontWeight: 400,
              color: 'var(--text-primary)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 16,
            }}>
              Is it worth<br />
              <span style={{
                background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontStyle: 'italic',
              }}>
                the drive?
              </span>
            </h1>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: 16, lineHeight: 1.6, maxWidth: 420, margin: '0 auto',
            }}>
              Calculate your trip before starting your car!
              This project is powered by live US government data.
            </p>
          </div>
        )}

        {/* Form or Result */}
        <div className="fade-up fade-up-delay-1">
          {!result ? (
            <TripForm onResult={setResult} />
          ) : (
            <ResultCard result={result} onReset={handleReset} />
          )}
        </div>

      </main>

      {/* ── Footer ── */}
      <footer style={{
        textAlign: 'center', padding: '24px 20px',
        borderTop: '1px solid var(--border)',
        position: 'relative', zIndex: 1,
      }}>
        <p style={{ color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.8 }}>
          Powered by NHTSA · EIA Energy · OpenStreetMap
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 2 }}>
          Gas prices update weekly · MPG data from US government
        </p>
      </footer>

    </div>
  );
}

export default App;