import type { WorkflowStep } from './types.js';

export interface PlanGuard {
  checkStep: (step: WorkflowStep) => { ok: boolean; reason?: string };
  recordStep: (step: WorkflowStep) => void;
  reset: () => void;
}

export function createPlanGuard(maxRepeats = 5): PlanGuard {
  const history: string[] = [];

  return {
    checkStep: (step: WorkflowStep) => {
      const signature = `${step.action}-${step.x.toFixed(2)}-${step.y.toFixed(2)}`;
      const recent = history.slice(-maxRepeats);
      const repeats = recent.filter((s) => s === signature).length;
      if (repeats >= maxRepeats) {
        return { ok: false, reason: `Action loop detected: repeated "${step.name}" ${repeats} times` };
      }
      return { ok: true };
    },
    recordStep: (step: WorkflowStep) => {
      const signature = `${step.action}-${step.x.toFixed(2)}-${step.y.toFixed(2)}`;
      history.push(signature);
    },
    reset: () => {
      history.length = 0;
    },
  };
}
