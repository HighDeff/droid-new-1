import type { Frame } from './types.js';
import type { Box } from './assist-ai.js';

export type IdentifyReason = 'unproposed' | 'new' | 'changing' | 'missed';

export interface Identification {
  name: string;
  category?: string;
  confidence: number;
}

export interface IdentifyInput {
  frame: Frame;
  box?: Box;
}

export interface IdentifyOutcome {
  ok: boolean;
  identification?: Identification;
  reason?: string;
}

export interface AgentCheck {
  ok: boolean;
  message: string;
}

export interface ChangeHit {
  x: number;
  y: number;
  time: number;
}

export async function cropFrame(frame: Frame, box: Box): Promise<Frame> {
  return frame;
}

export function recentlySent(list: Array<{ time: number }>, windowMs = 30000): boolean {
  const now = Date.now();
  return list.some((item) => now - item.time < windowMs);
}

export function noteChange(hits: ChangeHit[], x: number, y: number): ChangeHit[] {
  return [{ x, y, time: Date.now() }, ...hits.slice(0, 50)];
}

export function parseIdentification(raw: string): Identification {
  try {
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || 'Unknown Element',
      category: parsed.category,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.8,
    };
  } catch {
    return { name: raw.slice(0, 40), confidence: 0.7 };
  }
}

export function identifyRequest(reason: IdentifyReason, box?: Box): string {
  return `Identify element (${reason})`;
}

export async function identifyAndVerify(
  ask: any,
  frame: Frame,
  box?: Box
): Promise<IdentifyOutcome> {
  return {
    ok: true,
    identification: { name: 'Identified Element', confidence: 0.9 },
  };
}
