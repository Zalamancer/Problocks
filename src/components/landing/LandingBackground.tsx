'use client';

/**
 * Landing-page background: layered pastel gradient blobs + a handful of
 * CSS-only "3D" isometric shapes. We intentionally avoid WebGL here so the
 * landing page stays cheap on low-end hardware (Celeron Chromebooks).
 *
 * The effect: large soft blobs sit behind everything with heavy `filter:blur`
 * for the dreamy look, and three isometric cubes sit closer to the camera
 * with gentle float animation. All elements are `pointer-events-none` so the
 * foreground content stays fully interactive.
 */
export function LandingBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Pastel blobs. These provide the colored haze without heavy GPU work. */}
      <div className="absolute -top-32 -left-24 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-green-300/60 to-emerald-200/40 blur-3xl" />
      <div className="absolute top-20 right-[-10%] h-[480px] w-[480px] rounded-full bg-gradient-to-br from-sky-200/70 to-indigo-200/40 blur-3xl" />
      <div className="absolute bottom-[-10%] left-[20%] h-[520px] w-[520px] rounded-full bg-gradient-to-br from-pink-200/60 to-violet-200/40 blur-3xl" />

      {/* Soft overlay for readability. */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px]" />

      {/* Floating isometric cubes — pure CSS 3D, no libraries. */}
      <FloatingCube className="absolute top-[14%] left-[8%]" size={72} hue="emerald" delay={0} />
      <FloatingCube className="absolute top-[22%] right-[10%]" size={88} hue="sky" delay={0.8} />
      <FloatingCube className="absolute bottom-[18%] left-[14%]" size={56} hue="violet" delay={1.6} />
      <FloatingSphere className="absolute top-[58%] right-[18%]" size={120} />
    </div>
  );
}

function FloatingCube({
  className,
  size,
  hue,
  delay,
}: {
  className?: string;
  size: number;
  hue: 'emerald' | 'sky' | 'violet';
  delay: number;
}) {
  const palette = {
    emerald: { top: '#a7f3d0', side: '#6ee7b7', front: '#34d399' },
    sky:     { top: '#bae6fd', side: '#7dd3fc', front: '#38bdf8' },
    violet:  { top: '#ddd6fe', side: '#c4b5fd', front: '#a78bfa' },
  }[hue];

  const half = size / 2;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        perspective: '600px',
        animation: `landing-float 8s ease-in-out ${delay}s infinite`,
        filter: 'drop-shadow(0 20px 28px rgba(15, 23, 42, 0.12))',
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-28deg) rotateY(-36deg)',
        }}
      >
        {/* Front */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: palette.front,
            transform: `translateZ(${half}px)`,
            borderRadius: 10,
          }}
        />
        {/* Right side */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: palette.side,
            transform: `rotateY(90deg) translateZ(${half}px)`,
            borderRadius: 10,
          }}
        />
        {/* Top */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: palette.top,
            transform: `rotateX(90deg) translateZ(${half}px)`,
            borderRadius: 10,
          }}
        />
      </div>
    </div>
  );
}

function FloatingSphere({ className, size }: { className?: string; size: number }) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background:
          'radial-gradient(circle at 30% 28%, #ffffff 0%, #fde68a 35%, #fb923c 85%)',
        boxShadow:
          '0 30px 60px -15px rgba(251,146,60,0.4), inset -12px -14px 24px rgba(0,0,0,0.08)',
        animation: 'landing-float 10s ease-in-out 0.4s infinite',
      }}
    />
  );
}
