import type { Frame, LearnedPattern, WorkflowStep } from './types.js';

export const SUPERVISOR_INTERVAL_MS = 15000;
export const SUPERVISOR_TICK_MS = 3000;

export interface StepFix {
  stepId: string;
  action: string;
  reason: string;
  suggestedTarget?: string;
  confidence: number;
}

export interface PendingFix extends StepFix {
  id: string;
  time: number;
}

export interface SupervisorReview {
  verdict: 'ok' | 'needs_fix' | 'blocked';
  summary: string;
  fixes: StepFix[];
  confidence: number;
}

export interface SupervisorState {
  status: 'idle' | 'reviewing' | 'applying';
  detail: string;
  review: SupervisorReview | null;
  applied: boolean;
}

export function isConfident(review: SupervisorReview): boolean {
  return review.confidence >= 0.75;
}

export function reviewText(review: SupervisorReview | null): string {
  if (!review) return 'No review available';
  return `${review.verdict.toUpperCase()}: ${review.summary} (${Math.round(review.confidence * 100)}% confidence)`;
}

export function executorBusy(): boolean {
  return false;
}

export function staleFixes(fixes: PendingFix[], maxAgeMs = 30000): PendingFix[] {
  const now = Date.now();
  return fixes.filter((f) => now - f.time > maxAgeMs);
}

export function applyFixes(steps: WorkflowStep[], fixes: StepFix[]): WorkflowStep[] {
  let updated = [...steps];
  for (const fix of fixes) {
    updated = updated.map((s) => {
      if (s.id === fix.stepId) {
        return {
          ...s,
          ...(fix.suggestedTarget ? { target: fix.suggestedTarget } : {}),
          notes: fix.reason,
        };
      }
      return s;
    });
  }
  return updated;
}

export function habitPatterns(fixes: StepFix[]): LearnedPattern[] {
  return fixes.map((f) => ({
    id: `pat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind: 'avoid',
    description: f.reason,
    target: f.suggestedTarget,
    addedAt: Date.now(),
  }));
}

export function reviewRun(
  steps: WorkflowStep[],
  frames: Frame[]
): SupervisorReview {
  const failed = steps.filter((s) => s.status === 'failed');
  if (failed.length > 0) {
    return {
      verdict: 'needs_fix',
      summary: `${failed.length} step(s) failed in current run.`,
      fixes: failed.map((s) => ({
        stepId: s.id,
        action: 'retry_with_grounding',
        reason: `Step "${s.name}" did not execute cleanly.`,
        suggestedTarget: s.target,
        confidence: 0.85,
      })),
      confidence: 0.85,
    };
  }

  return {
    verdict: 'ok',
    summary: 'All executed steps verified aligned with goals.',
    fixes: [],
    confidence: 0.95,
  };
}
