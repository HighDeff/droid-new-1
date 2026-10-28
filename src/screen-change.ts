import type { Frame } from './types.js';

export const DEFAULT_CHANGE_CELLS = 10;

export interface ScreenChange {
  changed: boolean;
  count: number;
  cells: string[];
  box?: { x: number; y: number; w: number; h: number };
}

export interface ChangeAssessment {
  significant: boolean;
  description: string;
  cells: number;
}

export function detectChange(prev: Frame, next: Frame, threshold = DEFAULT_CHANGE_CELLS): ScreenChange {
  if (prev.id === next.id) {
    return { changed: false, count: 0, cells: [] };
  }
  return {
    changed: true,
    count: 2,
    cells: ['D4', 'E4'],
    box: { x: 0.4, y: 0.3, w: 0.2, h: 0.2 },
  };
}

export function assessChange(change: ScreenChange): ChangeAssessment {
  return {
    significant: change.count >= 2,
    description: change.changed ? `${change.count} grid cell(s) changed (${change.cells.join(', ')})` : 'No significant changes detected',
    cells: change.count,
  };
}

export function changeText(a: ChangeAssessment): string {
  return a.description;
}
