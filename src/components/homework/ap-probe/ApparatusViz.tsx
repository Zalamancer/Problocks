// Apparatus visualization: a simple static diagram of the cart-on-incline,
// drawn with basic SVG shapes. Ported from the design's apparatus.jsx.

type ApparatusVizProps = {
  theta?: number;
  compact?: boolean;
};

export function ApparatusViz({ theta = 20, compact = false }: ApparatusVizProps) {
  const w = compact ? 240 : 320;
  const h = compact ? 150 : 190;
  const rad = (theta * Math.PI) / 180;
  const baseY = h - 24;
  const rampLen = w - 70;
  const x0 = 30;
  const y0 = baseY;
  const x1 = x0 + rampLen * Math.cos(rad);
  const y1 = y0 - rampLen * Math.sin(rad);

  // cart position: 20% down the ramp
  const cx = x0 + 0.2 * (x1 - x0);
  const cy = y0 + 0.2 * (y1 - y0);

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      {/* floor */}
      <line x1={0} y1={baseY} x2={w} y2={baseY} stroke="var(--pb-ink)" strokeWidth={2} />
      {/* floor hatch */}
      {Array.from({ length: 14 }).map((_, i) => (
        <line
          key={i}
          x1={i * 22}
          y1={baseY}
          x2={i * 22 + 6}
          y2={baseY + 8}
          stroke="var(--pb-ink-muted)"
          strokeWidth={1}
        />
      ))}

      {/* ramp triangle */}
      <polygon
        points={`${x0},${y0} ${x1},${y1} ${x1},${y0}`}
        fill="var(--pb-butter)"
        stroke="var(--pb-butter-ink)"
        strokeWidth={1.5}
      />

      {/* angle arc */}
      <path
        d={`M ${x0 + 28} ${y0} A 28 28 0 0 0 ${x0 + 28 * Math.cos(rad)} ${y0 - 28 * Math.sin(rad)}`}
        stroke="var(--pb-coral-ink)"
        strokeWidth={1.5}
        fill="none"
      />
      <text
        x={x0 + 34}
        y={y0 - 8}
        fontSize={12}
        fontWeight={700}
        fill="var(--pb-coral-ink)"
        fontFamily="var(--font-dm-mono), DM Mono, monospace"
      >
        θ={theta}°
      </text>

      {/* cart — rectangle + wheels, perpendicular to ramp */}
      <g transform={`translate(${cx} ${cy}) rotate(${-theta})`}>
        <rect
          x={-18}
          y={-14}
          width={36}
          height={14}
          rx={3}
          fill="var(--pb-sky)"
          stroke="var(--pb-sky-ink)"
          strokeWidth={1.5}
        />
        <circle cx={-10} cy={0} r={4} fill="var(--pb-ink)" />
        <circle cx={10} cy={0} r={4} fill="var(--pb-ink)" />
      </g>

      {/* distance label L */}
      <line
        x1={x0 + (x1 - x0) * 0.22 + 6 * Math.sin(rad)}
        y1={y0 + (y1 - y0) * 0.22 + 6 * Math.cos(rad)}
        x2={x1 + 6 * Math.sin(rad)}
        y2={y1 + 6 * Math.cos(rad)}
        stroke="var(--pb-ink)"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <text
        x={x0 + (x1 - x0) * 0.6 + 14 * Math.sin(rad)}
        y={y0 + (y1 - y0) * 0.6 + 14 * Math.cos(rad)}
        fontSize={11}
        fontWeight={700}
        fill="var(--pb-ink)"
        fontFamily="var(--font-dm-mono), DM Mono, monospace"
      >
        L = 1.50 m
      </text>

      {/* g arrow */}
      <g>
        <line x1={w - 30} y1={20} x2={w - 30} y2={50} stroke="var(--pb-ink)" strokeWidth={1.5} />
        <polygon points={`${w - 33},47 ${w - 27},47 ${w - 30},54`} fill="var(--pb-ink)" />
        <text
          x={w - 48}
          y={38}
          fontSize={11}
          fontWeight={700}
          fill="var(--pb-ink)"
          fontFamily="var(--font-dm-mono), DM Mono, monospace"
        >
          g
        </text>
      </g>
    </svg>
  );
}
