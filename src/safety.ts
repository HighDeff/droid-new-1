/**
 * Safety controls, abort hotkey matchers, and action budget limits.
 */

export const DEFAULT_ABORT_HOTKEY = 'Escape';
export const DEFAULT_ACTION_BUDGET = 20;

export interface HotkeyEvent {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

export interface ActionBudget {
  remaining: number;
  total: number;
}

export function sanitizeBudget(v: unknown): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return DEFAULT_ACTION_BUDGET;
  return Math.min(100, Math.max(1, Math.floor(v)));
}

export function createBudget(budget = DEFAULT_ACTION_BUDGET): ActionBudget {
  const b = sanitizeBudget(budget);
  return { remaining: b, total: b };
}

export function spendAction(b: ActionBudget): { ok: boolean; budget: ActionBudget } {
  if (b.remaining <= 0) return { ok: false, budget: b };
  return { ok: true, budget: { ...b, remaining: b.remaining - 1 } };
}

export function hotkeyFromEvent(e: HotkeyEvent | KeyboardEvent): string {
  const parts: string[] = [];
  if (e.ctrlKey) parts.push('Ctrl');
  if (e.altKey) parts.push('Alt');
  if (e.shiftKey) parts.push('Shift');
  if (e.metaKey) parts.push('Meta');
  if (e.key && !['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
    parts.push(e.key);
  }
  return parts.join('+') || 'Escape';
}

export function matchesHotkey(e: HotkeyEvent, hotkey: string): boolean {
  if (!hotkey) return false;
  const current = hotkeyFromEvent(e).toLowerCase();
  const target = hotkey.trim().toLowerCase();
  return current === target || e.key.toLowerCase() === target;
}
