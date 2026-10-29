export type StageId =
  | 'executor'
  | 'grounding'
  | 'planner'
  | 'reflect'
  | 'verdict'
  | 'screenWatcher'
  | 'supervisor'
  | 'subagents'
  | 'popup'
  | 'goal'
  | 'drift'
  | 'identify'
  | 'screenResponder';

export type StageGroup = 'pipeline' | 'agent';

export interface StageDefinition {
  id: StageId;
  name: string;
  description: string;
  group: StageGroup;
  verification?: boolean;
}

export const STAGES: readonly StageDefinition[] = [
  {
    id: 'executor',
    name: 'Step Executor',
    description: 'Dispatches pointer and keyboard actions',
    group: 'pipeline',
    verification: false,
  },
  {
    id: 'grounding',
    name: 'Target Grounding',
    description: 'Verifies element location before action',
    group: 'pipeline',
    verification: true,
  },
  {
    id: 'planner',
    name: 'Workflow Planner',
    description: 'Generates steps to achieve goal',
    group: 'pipeline',
    verification: false,
  },
  {
    id: 'reflect',
    name: 'Step Reflection',
    description: 'Inspects outcome after execution',
    group: 'pipeline',
    verification: true,
  },
  {
    id: 'verdict',
    name: 'Step Verdict',
    description: 'Determines step success/failure',
    group: 'pipeline',
    verification: true,
  },
  {
    id: 'goal',
    name: 'Goal Verifier',
    description: 'Verifies overall workflow goal completion',
    group: 'pipeline',
    verification: true,
  },
  {
    id: 'screenWatcher',
    name: 'Screen Watcher',
    description: 'Notes screen changes and proposes adjustments',
    group: 'agent',
    verification: false,
  },
  {
    id: 'supervisor',
    name: 'Supervisor',
    description: 'Monitors progress and initiates fixes',
    group: 'agent',
    verification: false,
  },
  {
    id: 'subagents',
    name: 'Subagents',
    description: 'Parallel link and route verification tests',
    group: 'agent',
    verification: false,
  },
  {
    id: 'popup',
    name: 'Popup Watcher',
    description: 'Identifies and auto-closes intrusive popups',
    group: 'agent',
    verification: false,
  },
  {
    id: 'drift',
    name: 'Drift Monitor',
    description: 'Tracks coordinate and layout stability',
    group: 'agent',
    verification: true,
  },
];

const STAGE_MAP = new Map<StageId, StageDefinition>(STAGES.map((s) => [s.id, s]));

export function stageOf(id: StageId): StageDefinition {
  return (
    STAGE_MAP.get(id) || {
      id,
      name: id,
      description: '',
      group: 'pipeline',
    }
  );
}

export const DEFAULT_STAGES: Record<StageId, boolean> = {
  executor: true,
  grounding: true,
  planner: true,
  reflect: true,
  verdict: true,
  screenWatcher: true,
  supervisor: true,
  subagents: true,
  popup: true,
  goal: true,
  drift: true,
  identify: true,
  screenResponder: true,
};

export function sanitizeStages(raw: unknown): Record<StageId, boolean> {
  const res = { ...DEFAULT_STAGES };
  if (!raw || typeof raw !== 'object') return res;
  for (const k of Object.keys(DEFAULT_STAGES) as StageId[]) {
    if (typeof (raw as Record<string, unknown>)[k] === 'boolean') {
      res[k] = (raw as Record<string, boolean>)[k];
    }
  }
  return res;
}

export function createStageControllers(): Record<StageId, AbortController> {
  const controllers = {} as Record<StageId, AbortController>;
  for (const k of Object.keys(DEFAULT_STAGES) as StageId[]) {
    controllers[k] = new AbortController();
  }
  return controllers;
}

export function stageOff(id: StageId): string {
  return `${stageOf(id).name} is disabled in Loop Control`;
}

export function toggleMessage(id: StageId, on: boolean): string {
  return `${stageOf(id).name} ${on ? 'enabled' : 'disabled'}`;
}

export function unverifiedStages(stages: Record<string, boolean> = {}): StageDefinition[] {
  return STAGES.filter((s) => s.verification && !stages[s.id]);
}
