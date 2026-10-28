import type { Frame, WorkflowStep } from './types.js';

export type NoteKind = 'element' | 'change' | 'unusual' | 'opportunity';
export type ProposalKind = 'close_popup' | 'familiar' | 'pattern' | 'reorder';
export type ProposalStatus = 'pending' | 'accepted' | 'dismissed';

export const NOTE_KINDS: readonly NoteKind[] = ['element', 'change', 'unusual', 'opportunity'];
export const PROPOSAL_KINDS: readonly ProposalKind[] = ['close_popup', 'familiar', 'pattern', 'reorder'];
export const PROPOSAL_STATUSES: readonly ProposalStatus[] = ['pending', 'accepted', 'dismissed'];

export const NOTE_LIMIT = 50;
export const PROPOSAL_LIMIT = 30;
export const TEST_LIMIT = 20;

export interface WatchNote {
  id: string;
  time: number;
  kind: NoteKind;
  text: string;
  target?: string;
  x?: number;
  y?: number;
}

export interface WatchProposal {
  id: string;
  time: number;
  kind: ProposalKind;
  status: ProposalStatus;
  text: string;
  target?: string;
  x?: number;
  y?: number;
  from?: number;
  to?: number;
}

export interface WatchTest {
  id: string;
  time: number;
  proposalId: string;
  passed: boolean;
  message: string;
}

export interface WatcherState {
  notes: WatchNote[];
  proposals: WatchProposal[];
  tests: WatchTest[];
}

export const EMPTY_WATCHER: WatcherState = {
  notes: [],
  proposals: [],
  tests: [],
};

export interface Observation {
  notes: WatchNote[];
  proposals: WatchProposal[];
}

export function observeScreen(prev: Frame, next: Frame): Observation {
  return { notes: [], proposals: [] };
}

export function patchProposal(
  proposals: WatchProposal[],
  id: string,
  patch: Partial<WatchProposal>
): WatchProposal[] {
  return proposals.map((p) => (p.id === id ? { ...p, ...patch } : p));
}

export function mergeNotes(existing: WatchNote[], fresh: WatchNote[], limit = NOTE_LIMIT): WatchNote[] {
  const map = new Map<string, WatchNote>();
  [...fresh, ...existing].forEach((n) => map.set(n.id, n));
  return Array.from(map.values()).slice(0, limit);
}

export function mergeProposals(existing: WatchProposal[], fresh: WatchProposal[], limit = PROPOSAL_LIMIT): WatchProposal[] {
  const map = new Map<string, WatchProposal>();
  [...fresh, ...existing].forEach((p) => map.set(p.id, p));
  return Array.from(map.values()).slice(0, limit);
}

export function addTest(state: WatcherState, test: WatchTest): WatcherState {
  return {
    ...state,
    tests: [test, ...state.tests].slice(0, TEST_LIMIT),
  };
}

export function reorderSteps(steps: WorkflowStep[], from: number, to: number): WorkflowStep[] {
  if (from < 1 || from > steps.length || to < 1 || to > steps.length) return steps;
  const result = [...steps];
  const [removed] = result.splice(from - 1, 1);
  result.splice(to - 1, 0, removed);
  return result;
}

export function proposalStep(p: WatchProposal): WorkflowStep | null {
  if (p.x === undefined || p.y === undefined) return null;
  return {
    id: `step-${Date.now()}`,
    name: p.target || p.text,
    action: 'click',
    x: p.x,
    y: p.y,
    status: 'pending',
  };
}
