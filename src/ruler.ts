export interface RulerPoint {
  x: number;
  y: number;
}

export interface RulerSegment {
  from: RulerPoint;
  to: RulerPoint;
  px: number;
  pct: number;
  dxPx: number;
  dyPx: number;
}

export interface Measurement {
  points: RulerPoint[];
  segments: RulerSegment[];
  totalPx: number;
  totalPct: number;
  srcW: number;
  srcH: number;
}

export function createMeasurement(points: RulerPoint[] = [], screenW = 960, screenH = 540): Measurement {
  const safePoints = points || [];
  const segments: RulerSegment[] = [];
  let totalPx = 0;

  for (let i = 1; i < safePoints.length; i++) {
    const from = safePoints[i - 1];
    const to = safePoints[i];
    const dxPx = Math.round((to.x - from.x) * screenW);
    const dyPx = Math.round((to.y - from.y) * screenH);
    const px = Math.round(Math.hypot(dxPx, dyPx));
    const pct = Math.round(Math.hypot(to.x - from.x, to.y - from.y) * 100);
    totalPx += px;

    segments.push({
      from,
      to,
      px,
      pct,
      dxPx,
      dyPx,
    });
  }

  const screenDiag = Math.hypot(screenW, screenH);
  const totalPct = Math.round((totalPx / Math.max(1, screenDiag)) * 100);

  return {
    points: safePoints,
    segments,
    totalPx,
    totalPct,
    srcW: screenW,
    srcH: screenH,
  };
}

export function segmentLine(s: RulerSegment, index?: number): string {
  const prefix = typeof index === 'number' ? `#${index + 1}: ` : '';
  return `${prefix}${s.px}px (${s.pct}%) · dx ${s.dxPx}px, dy ${s.dyPx}px`;
}
