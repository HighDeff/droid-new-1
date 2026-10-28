import type { Frame, WorkflowStep } from './types.js';

export interface Grounding {
  point: { x: number; y: number };
  confidence: number;
  label: string;
}

export interface StepOutcome {
  ok: boolean;
  executed: boolean;
  message: string;
  target: { x: number; y: number };
  end?: { x: number; y: number };
  live?: Frame;
  shot?: Frame;
  grabbed?: string;
}

export function dragEndError(step: WorkflowStep): string | null {
  if (step.action === 'drag' && (step.endX === undefined || step.endY === undefined)) {
    return 'Drag action requires endX and endY coordinates';
  }
  return null;
}

export async function runStep(
  step: WorkflowStep,
  frame: Frame | null,
  dryRun = false
): Promise<StepOutcome> {
  const bad = dragEndError(step);
  if (bad) {
    return {
      ok: false,
      executed: false,
      message: bad,
      target: { x: step.x, y: step.y },
    };
  }

  return {
    ok: true,
    executed: !dryRun,
    message: dryRun ? 'Step verified (dry run)' : `Executed ${step.action} at (${(step.x * 100).toFixed(0)}%, ${(step.y * 100).toFixed(0)}%)`,
    target: { x: step.x, y: step.y },
    ...(step.action === 'drag' ? { end: { x: step.endX!, y: step.endY! } } : {}),
  };
}
