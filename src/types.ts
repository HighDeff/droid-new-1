/**
 * Core domain types and enumerations for Droid Assist
 */

export type ScreenSource = 'none' | 'demo' | 'screen' | 'bridge';
export type SyncLevel = 'green' | 'yellow' | 'red' | 'idle';
export type MonitorMode = 'app' | 'background' | 'advanced';
export type StepAction = 'click' | 'double_click' | 'move' | 'drag' | 'type' | 'key' | 'scroll' | 'calc' | 'search' | 'wait' | 'measure';
export type InputAction = 'click' | 'double_click' | 'move' | 'drag' | 'scroll' | 'type' | 'key';

export const STEP_ACTIONS: readonly StepAction[] = ['click', 'double_click', 'move', 'drag', 'type', 'key', 'scroll', 'calc', 'search', 'wait', 'measure'];
export const POINTER_ACTIONS = new Set<StepAction>(['click', 'double_click', 'move', 'drag']);

export interface Frame {
  id: number;
  time: number;
  url: string;
  full?: string;
  data: ImageData;
  srcW: number;
  srcH: number;
  source: ScreenSource;
}

export interface WorkflowStep {
  id: string;
  name: string;
  action: StepAction;
  x: number;
  y: number;
  target?: string;
  endX?: number;
  endY?: number;
  endTarget?: string;
  text?: string;
  delayMs?: number;
  status: 'pending' | 'running' | 'done' | 'failed';
  refFrame?: Frame;
  correctedX?: number;
  correctedY?: number;
  notes?: string;
}

export interface SavedCard {
  id: string;
  name: string;
  description: string;
  savedAt: number;
  steps: WorkflowStep[];
}

export interface AssistSettings {
  bridgeUrl: string;
  bridgeToken: string;
  errorUrl: string;
  errorToken: string;
  abortHotkey: string;
  aiUrl: string;
  aiModel: string;
  aiView: string;
  monitorMode: MonitorMode;
  autoAct: boolean;
  aiHelp: boolean;
  showTrail: boolean;
  showGrid: boolean;
  gridLabels: boolean;
  gridOpacity: number;
  errorForwarding: boolean;
  autoContinue: boolean;
  maxIterations: number;
  gallerySize: number;
  checkpoints: number;
  captureMs: number;
  watchMs: number;
  changeCells: number;
  stepRetries: number;
  driftStable: number;
  driftMatched: number;
  driftRadius: number;
  aiMaxInFlight: number;
  aiTimeoutMs: number;
  actionBudget: number;
  stages?: Record<string, boolean>;
}

export interface FamiliarElement {
  id: string;
  name: string;
  x: number;
  y: number;
  lastSeen?: number;
  patch?: string;
}

export interface LearnedPattern {
  id: string;
  kind: 'avoid' | 'add';
  pattern: string;
  context: string;
  time: number;
  description?: string;
  target?: string;
  addedAt?: number;
}

export interface HabitAnchor {
  x: number;
  y: number;
  w: number;
  h: number;
  patchUrl?: string;
}

export interface HabitLesson {
  time: number;
  success: boolean;
  dx: number;
  dy: number;
}

export interface Habit {
  id: string;
  target: string;
  pinned: boolean;
  anchor: HabitAnchor;
  lessons: HabitLesson[];
  successCount: number;
  totalCount: number;
  lastUsed: number;
}

export interface LogEntry {
  id: string;
  time: number;
  source: string;
  message: string;
  tone: 'info' | 'ok' | 'warn' | 'error';
  shots?: Frame[];
}

export interface Annotation {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  actX?: number;
  actY?: number;
  confidence?: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  t: number;
  click?: boolean;
}

export interface ActionRecord {
  id: string;
  time: number;
  action: InputAction;
  x: number;
  y: number;
  endX?: number;
  endY?: number;
  text?: string;
  source: string;
  via: 'bridge' | 'demo' | 'screen' | string;
  ok: boolean;
  message: string;
}
