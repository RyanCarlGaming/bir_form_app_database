// Pure SVG charts — no external library

// ── DonutChart ────────────────────────────────────────────────────────────────

export interface DonutSegment { value: number; color: string; label: string; }

interface DonutChartProps { segments: DonutSegment[]; }

export function DonutChart({ segments }: DonutChartProps) {
  const SIZE = 180, R = 70, CX = SIZE / 2, CY = SIZE / 2;
  const circ = 2 * Math.PI * R;
  const total = segments.reduce((s, d) => s + d.value, 0);

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = total > 0 ? (seg.value / total) * circ : 0;
    const rot  = (offset / circ) * 360 - 90;
    offset += dash;
    return { ...seg, dash, gap: circ - dash, rot };
  });

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      {total === 0 ? (
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="var(--color-border)" strokeWidth={22} />
      ) : (
        arcs.map((a, i) => (
          <circle
            key={i} cx={CX} cy={CY} r={R} fill="none"
            stroke={a.color} strokeWidth={22}
            strokeDasharray={`${a.dash} ${a.gap}`}
            transform={`rotate(${a.rot} ${CX} ${CY})`}
          />
        ))
      )}
      <text x={CX} y={CY - 6}  textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="JetBrains Mono, monospace" fill="currentColor">{total}</text>
      <text x={CX} y={CY + 14} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">Total</text>
    </svg>
  );
}

// ── BarChart ──────────────────────────────────────────────────────────────────

export interface BarChartBar { label: string; value: number; }

interface BarChartProps { bars: BarChartBar[]; height?: number; }

export function BarChart({ bars, height = 230 }: BarChartProps) {
  const padT = 24, padB = 32;
  const chartH = height - padT - padB;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const BAR_W = 36, STEP = 60, PAD_L = 12;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${bars.length * STEP + PAD_L} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {bars.map((bar, i) => {
        const barH = Math.max((bar.value / max) * chartH, 1);
        const x = PAD_L + i * STEP;
        const y = padT + chartH - barH;

        return (
          <g key={i}>
            <rect x={x} y={y} width={BAR_W} height={barH} rx="3" fill="var(--color-navy)" />
            <text x={x + BAR_W / 2} y={y - 5}        textAnchor="middle" fontSize="11" fontWeight="600" fill="currentColor">{bar.value}</text>
            <text x={x + BAR_W / 2} y={height - 8}   textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.5">{bar.label}</text>
          </g>
        );
      })}
    </svg>
  );
}
