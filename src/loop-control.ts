export type StageId =
  | 'executor'
  | 'grounding'
  | 'planner'
  | 'screenWatcher'
  | 'supervisor'
  | 'subagents'
  | 'popup'
  | 'goal'
  | 'drift';

export interface StageInfo {
  name: string;
  description: string;
  group: 'pipeline' | 'agent' | 'executor';
}

export function stageOf(id: StageId): StageInfo {
  if (id === 'executor' || id === 'grounding') return { name: id, description: '', group: 'executor' };
  if (id === 'planner' || id === 'goal') return { name: id, description: '', group: 'pipeline' };
  return { name: id, description: '', group: 'agent' };
}

export interface StageGroup {
  id: string;
  name: string;
  stages: StageId[];
}

export const STAGES: Record<StageId, { name: string; description: string }> = {
  executor: { name: 'Step Executor', description: 'Dispatches pointer and keyboard actions' },
  screenWatcher: { name: 'Screen Watcher', description: 'Notes screen changes and proposes adjustments' },
  supervisor: { name: 'Supervisor', description: 'Monitors progress and initiates fixes' },
  subagents: { name: 'Subagents', description: 'Parallel link and route verification tests' },
  popup: { name: 'Popup Watcher', description: 'Identifies and auto-closes intrusive popups' },
  goal: { name: 'Goal Verifier', description: 'Verifies overall workflow goal completion' },
  drift: { name: 'Drift Monitor', description: 'Tracks coordinate and layout stability' },
};

export const DEFAULT_STAGES: Record<StageId, boolean> = {
  executor: true,
  screenWatcher: true,
  supervisor: true,
  subagents: true,
  popup: true,
  goal: true,
  drift: true,
};

export function sanitizeStages(raw: unknown): Record<StageId, boolean> {
  const res = { ...DEFAULT_STAGES };
  if (!raw || typeof raw !== 'object') return res;
  for (const k of Object.keys(DEFAULT_STAGES) as StageId[]) {
    if (typeof (raw as any)[k] === 'boolean') {
      res[k] = (raw as any)[k];
    }
  }
  return res;
}

export function createStageControllers(): Record<StageId, AbortController> {
  return {
    executor: new AbortController(),
    screenWatcher: new AbortController(),
    supervisor: new AbortController(),
    subagents: new AbortController(),
    popup: new AbortController(),
    goal: new AbortController(),
    drift: new AbortController(),
  };
}

export function stageOff(id: StageId): string {
  return `${STAGES[id]?.name || id} is disabled in Loop Control`;
}

export function toggleMessage(id: StageId, on: boolean): string {
  return `${STAGES[id]?.name || id} ${on ? 'enabled' : 'disabled'}`;
}

export function unverifiedStages(stages: Record<StageId, boolean>): StageId[] {
  return (Object.keys(DEFAULT_STAGES) as StageId[]).filter((k) => !stages[k]);
}
