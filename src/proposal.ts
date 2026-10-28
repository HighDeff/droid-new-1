import type { WorkflowStep } from './types.js';

export interface Proposal {
  id: string;
  text: string;
  action: string;
  x: number;
  y: number;
  target?: string;
}

export interface ProposalContext {
  goal?: string;
  step?: string;
}

export function proposalText(p: Proposal): string {
  return p.text;
}

export function localProposal(text: string, x = 0.5, y = 0.5): Proposal {
  return {
    id: `prop-${Date.now()}`,
    text,
    action: 'click',
    x,
    y,
  };
}

export function proposeStep(p: Proposal): WorkflowStep {
  return {
    id: `step-${Date.now()}`,
    name: p.text,
    action: 'click',
    x: p.x,
    y: p.y,
    status: 'pending',
    target: p.target,
  };
}
