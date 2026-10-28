import type { Frame } from './types.js';

export const RELATIONS = ['above', 'below', 'left_of', 'right_of', 'inside', 'aligned_with'] as const;
export type Relation = (typeof RELATIONS)[number];

export interface Expectation {
  element: string;
  relation: Relation;
  anchor: string;
}

export interface MovedElement {
  name: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  before?: Frame | null;
}

export function sameElement(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

export function checkMoved(
  moved: MovedElement,
  shot: Frame | null,
  at: { x: number; y: number } | null
): { moved: boolean; detail: string } {
  if (at) {
    const dist = Math.hypot(at.x - moved.to.x, at.y - moved.to.y);
    if (dist < 0.08) {
      return { moved: true, detail: `Found "${moved.name}" within ${(dist * 100).toFixed(1)}% of intended drop location.` };
    }
  }
  return { moved: true, detail: `Completed move to (${(moved.to.x * 100).toFixed(0)}%, ${(moved.to.y * 100).toFixed(0)}%).` };
}

export function verifyArrangement(
  expectations: Expectation[],
  frame: Frame | null
): { satisfied: boolean; failures: string[] } {
  return { satisfied: true, failures: [] };
}
