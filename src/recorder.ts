import type { WorkflowStep } from './types.js';
import type { HotkeyEvent } from './safety.js';

export function keyCombo(e: HotkeyEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Meta');
  if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    parts.push(e.key);
  }
  return parts.join('+');
}

export function keyStep(id: string, combo: string): WorkflowStep {
  return {
    id,
    name: `Press ${combo}`,
    action: 'key',
    x: 0.5,
    y: 0.5,
    text: combo,
    status: 'pending',
  };
}

export function scrollStep(id: string, x: number, y: number, deltaY: number): WorkflowStep {
  const dir = deltaY > 0 ? 'down' : 'up';
  return {
    id,
    name: `Scroll ${dir}`,
    action: 'scroll',
    x,
    y,
    text: `${dir} (${Math.abs(deltaY)})`,
    status: 'pending',
  };
}

export function continuesScroll(last: WorkflowStep | undefined, deltaY: number, timeGap: number): boolean {
  if (!last || last.action !== 'scroll' || timeGap > 600) return false;
  const lastDir = last.text?.includes('down') ? 1 : -1;
  const curDir = deltaY > 0 ? 1 : -1;
  return lastDir === curDir;
}

export function stepDelay(lastTime: number, now: number): number {
  if (lastTime <= 0) return 0;
  return Math.max(0, Math.min(5000, now - lastTime));
}
