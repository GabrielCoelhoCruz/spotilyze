import { ImageResponse } from 'next/og'

export const alt = 'Spotilyze — Your personal Spotify listening dashboard'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #121212 50%, #0d1f14 100%)',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: '#1DB954',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 18V6l12-3v12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="6" cy="18" r="3" fill="white" />
              <circle cx="18" cy="15" r="3" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>Spotilyze</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h1
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: '-0.04em',
              margin: 0,
            }}
          >
            Every play,
            <br />
            <span style={{ color: '#1DB954' }}>mapped.</span>
          </h1>
          <p style={{ fontSize: 28, color: '#a3a3a3', margin: 0, maxWidth: 720 }}>
            Your personal Spotify listening history, visualized. Self-host in one command.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {['Dashboard', 'Wrapped', 'Export'].map((label) => (
            <div
              key={label}
              style={{
                padding: '10px 20px',
                borderRadius: 999,
                border: '1px solid #333',
                fontSize: 18,
                color: '#d4d4d4',
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
