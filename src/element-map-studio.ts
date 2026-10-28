import type { FamiliarElement, Frame } from './types.js';
import type { Box } from './assist-ai.js';
import { gridRef } from './grid.js';

/** The element-map grid: finer than the A1..H12 planner grid and drawn only in Element-map mode. */
export const MAP_COLS = 24;
export const MAP_ROWS = 16;

/** Most mapped elements kept. */
export const MAP_LIMIT = 80;

/** Smallest box side (fraction of the screen) a drag must span to become an element. */
export const MIN_BOX = 0.005;

/** An element the user mapped by drawing its boundary on the live frame. Normalized 0..1. */
export interface MappedElement {
  id: string;
  name: string;
  box: Box;
  /** When it was mapped (ms since epoch). */
  mappedAt: number;
  /** The frame it was drawn on — the template its boundary is verified against. */
  frame?: Frame;
  /** Times this element was observed or updated across screenshots. */
  frequency?: number;
  /** Historical coordinates when the position shifted. */
  oldPositions?: Array<{ x: number; y: number; time: number }>;
  /** Mobility pattern: static, moved by user/AI, or continuously animated. */
  mobility?: 'static' | 'user-moved' | 'in-motion';
}

type Point = { x: number; y: number };

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const key = (name: string) => name.trim().toLowerCase();

/** The box spanned by two drag corners, clamped to the screen; null when it is too small. */
export function dragBox(a: Point, b: Point): Box | null {
  const x0 = clamp01(Math.min(a.x, b.x));
  const y0 = clamp01(Math.min(a.y, b.y));
  const w = clamp01(Math.max(a.x, b.x)) - x0;
  const h = clamp01(Math.max(a.y, b.y)) - y0;
  return w >= MIN_BOX && h >= MIN_BOX ? { x: x0, y: y0, w, h } : null;
}

/** The centre point of a box. */
export const boxCenter = (b: Box): Point => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });

/** The map cell containing a point, as "R<row>C<col>" (1-based, R1C1 top-left). */
export function mapCell(p: Point): string {
  const idx = (v: number, n: number) => Math.min(n - 1, Math.max(0, Math.floor(v * n))) + 1;
  return `R${idx(p.y, MAP_ROWS)}C${idx(p.x, MAP_COLS)}`;
}

/** The map cells a box spans, as "R<a>C<b>..R<c>C<d>" (top-left cell to bottom-right cell). */
export function mapCells(b: Box): string {
  const eps = 1e-9;
  return `${mapCell(b)}..${mapCell({ x: b.x + b.w - eps, y: b.y + b.h - eps })}`;
}

/**
 * Adds or updates a mapped element; tracks previous positions, updates frequency,
 * and detects position changes over time.
 */
export function mapElement(list: MappedElement[], el: MappedElement): MappedElement[] {
  if (!el.name.trim()) return list;
  const existing = list.find((e) => key(e.name) === key(el.name));
  const oldPositions = existing?.oldPositions ?? [];
  let frequency = (existing?.frequency ?? 0) + 1;
  let mobility: 'static' | 'user-moved' | 'in-motion' = existing?.mobility ?? 'static';

  if (existing) {
    const prevCenter = boxCenter(existing.box);
    const newCenter = boxCenter(el.box);
    const dist = Math.hypot(newCenter.x - prevCenter.x, newCenter.y - prevCenter.y);
    if (dist > 0.01) {
      oldPositions.push({ x: prevCenter.x, y: prevCenter.y, time: existing.mappedAt });
      mobility = dist > 0.05 ? 'in-motion' : 'user-moved';
    }
  }

  const named: MappedElement = {
    ...el,
    name: el.name.trim(),
    frequency,
    oldPositions: oldPositions.slice(-10),
    mobility,
  };

  return [named, ...list.filter((e) => key(e.name) !== key(named.name))].slice(0, MAP_LIMIT);
}

/** Drops the mapped element with `id`. */
export const unmapElement = (list: MappedElement[], id: string) => list.filter((e) => e.id !== id);

/** A mapped element as a familiar-elements memory entry (its centre, seen now). */
export const toFamiliar = (el: MappedElement, now: number, patch?: string): FamiliarElement => ({
  id: el.id,
  name: el.name,
  x: boxCenter(el.box).x,
  y: boxCenter(el.box).y,
  patch,
  lastSeen: now,
});

const pct = (v: number) => `${(v * 100).toFixed(1)}%`;

/** One prompt line for a mapped element: name, boundary box, frequency and mobility. */
export function mappedLine(el: MappedElement): string {
  const b = el.box;
  const freq = el.frequency ? ` seen ${el.frequency}x` : '';
  const mob = el.mobility && el.mobility !== 'static' ? ` [${el.mobility}]` : '';
  const olds = el.oldPositions?.length ? ` (previously at ${el.oldPositions.map((p) => `(${pct(p.x)},${pct(p.y)})`).join('➔')})` : '';
  return `[Mapped element] "${el.name}"${freq}${mob} boundary x=${pct(b.x)}..${pct(b.x + b.w)}, y=${pct(b.y)}..${pct(b.y + b.h)} (center ${gridRef(boxCenter(b))})${olds}`;
}

/** The planning / grounding context lines for every user-mapped element, newest first. */
export const mapContext = (list: MappedElement[]) => list.map(mappedLine);

/** The mapped element whose boundary contains `p`, or null. */
export function mappedAt(list: MappedElement[], p: Point): MappedElement | null {
  return list.find((e) => p.x >= e.box.x && p.x <= e.box.x + e.box.w && p.y >= e.box.y && p.y <= e.box.y + e.box.h) ?? null;
}
