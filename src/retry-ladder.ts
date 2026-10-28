import type { LearnedPattern, WorkflowStep } from './types.js';

export const STEP_RETRIES_MIN = 0;
export const STEP_RETRIES_MAX = 5;
export const DEFAULT_STEP_RETRIES = 2;

export interface Attempt {
  n: number;
  ok: boolean;
  message: string;
  feedback?: string;
}

export function describeAttempt(a: Attempt): string {
  return `Attempt #${a.n}: ${a.ok ? 'SUCCESS' : 'FAILED'} — ${a.message}`;
}

export function avoidPattern(step: WorkflowStep, feedback: string): LearnedPattern {
  const patternText = (feedback || `Failed action for ${step.name}`).trim();
  const ctx = (step.target || step.name || '').trim();
  const now = Date.now();
  return {
    id: `pat_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    kind: 'avoid',
    pattern: patternText,
    context: ctx,
    time: now,
    description: patternText,
    target: ctx,
    addedAt: now,
  };
}

export async function runLadder<T>(
  retries: number,
  task: (attemptNum: number) => Promise<{ ok: boolean; result: T; message: string }>
): Promise<{ ok: boolean; result?: T; attempts: Attempt[] }> {
  const attempts: Attempt[] = [];
  const max = Math.max(1, retries + 1);

  for (let i = 1; i <= max; i++) {
    const res = await task(i);
    attempts.push({ n: i, ok: res.ok, message: res.message });
    if (res.ok) {
      return { ok: true, result: res.result, attempts };
    }
  }

  return { ok: false, attempts };
}
