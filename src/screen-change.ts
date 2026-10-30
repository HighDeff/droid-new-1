import type { Frame } from './types.js';
import { diffCells, largestCluster, boundingBox } from './drift.js';

export const DEFAULT_CHANGE_CELLS = 10;

export interface ScreenChange {
  changed: boolean;
  count: number;
  cells: string[];
  box: { x: number; y: number; w: number; h: number };
}

export interface ChangeAssessment {
  kind: 'popup' | 'change';
  summary: string;
  description: string;
  stale?: boolean;
  cells: number;
}

export function detectChange(
  a: ImageData | Frame | undefined | null,
  b: ImageData | Frame | undefined | null,
  threshold = DEFAULT_CHANGE_CELLS
): ScreenChange | null {
  if (!a || !b) return null;
  const dataA = (a as Frame).data ?? (a as ImageData);
  const dataB = (b as Frame).data ?? (b as ImageData);
  if (!dataA || !dataB || !dataA.data || !dataB.data) return null;

  const rawCells = diffCells(dataA, dataB);
  const cluster = largestCluster(rawCells);
  if (!cluster || cluster.length < threshold) return null;

  const box = boundingBox(cluster);
  if (!box) return null;

  const cellLabels = cluster.map((c) => `${String.fromCharCode(65 + c.col)}${c.row + 1}`);
  return {
    changed: true,
    count: cluster.length,
    cells: cellLabels,
    box,
  };
}

export async function assessChange(
  _ask: any,
  _full: any,
  _crop: any,
  change: ScreenChange,
  _context?: any
): Promise<ChangeAssessment> {
  const isPopup = (change.box?.w ?? 0) > 0.35 && (change.box?.h ?? 0) > 0.25;
  return {
    kind: isPopup ? 'popup' : 'change',
    summary: `${change.count} changed cells`,
    description: `${change.count} cells changed (${(change.cells || []).slice(0, 4).join(', ')})`,
    stale: false,
    cells: change.count,
  };
}

export function changeText(a: ChangeAssessment): string {
  return a.description || a.summary || 'Screen change detected';
}
