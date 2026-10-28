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
}

export function createMeasurement(points: RulerPoint[], screenW = 960, screenH = 540): Measurement {
  const segments: RulerSegment[] = [];
  let totalPx = 0;

  for (let i = 1; i < points.length; i++) {
    const from = points[i - 1];
    const to = points[i];
    const dxPx = Math.round((to.x - from.x) * screenW);
    const dyPx = Math.round((to.y - from.y) * screenH);
    const px = Math.round(Math.hypot(dxPx, dyPx));
    const pct = Math.round((Math.hypot(to.x - from.x, to.y - from.y)) * 100);
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
    points,
    segments,
    totalPx,
    totalPct,
  };
}

export function segmentLine(s: RulerSegment): string {
  return `${s.px}px (${s.pct}%) · dx ${s.dxPx}px, dy ${s.dyPx}px`;
}
