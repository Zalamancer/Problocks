import { ImageResponse } from 'next/og';

// Dynamically-generated OG image for link unfurls on Slack, Twitter,
// iMessage, Discord, etc. Next serves this at /opengraph-image; the
// metadata object in layout.tsx automatically wires it into the <head>.
// Rendered at build time and cached at the edge.

export const runtime = 'edge';
export const alt = 'Playdemy — AI-powered game creation for classrooms';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

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
          padding: 72,
          background: '#fff7e6',
          color: '#1d1a14',
          fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: '#1d1a14',
              color: '#fff7e6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 44,
              fontWeight: 800,
            }}
          >
            P
          </div>
          <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.02em' }}>Playdemy</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 82,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              maxWidth: 950,
            }}
          >
            Describe a game. Build it together. Play it in class.
          </div>
          <div style={{ fontSize: 28, color: '#6a6458', maxWidth: 820, lineHeight: 1.3 }}>
            An AI-powered game studio for classrooms.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {['#fbbf24', '#86efac', '#fca5a5', '#93c5fd', '#c4b5fd', '#f9a8d4'].map((c) => (
            <div
              key={c}
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: c,
                border: '2px solid #1d1a14',
              }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
