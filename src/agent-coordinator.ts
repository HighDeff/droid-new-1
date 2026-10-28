/**
 * Multi-Agent Coordinator & Awakening Timer
 * - Parallel coordinate plotters (10+ parallel subagents tracking elements and paths)
 * - Awakening Timer: Snoozes AI for 30s or custom interval, awakens with screenshot delta + context
 * - Mobility Tracker: Identifies whether elements are static, user-moved, or continuously in motion
 * - Blacklist & Invalid Operation Memory: Prevents AI from repeating failed actions
 */

import type { Frame } from './types.js';

export interface ParallelAgentWorker {
  id: string;
  name: string;
  specialty: 'path_plotter' | 'speed_tracker' | 'obstacle_scanner' | 'anchor_verifier' | 'inventory_scout';
  status: 'idle' | 'tracking' | 'adjusting' | 'alert';
  lastCoords: { x: number; y: number };
  note: string;
}

export interface AwakenTimerState {
  active: boolean;
  durationSeconds: number;
  remainingSeconds: number;
  reason: string;
  snoozedAt: number;
  preSnoozeFrameUrl?: string;
  preSnoozeContext?: string[];
}

export interface ElementMobilityRecord {
  name: string;
  history: Array<{ x: number; y: number; time: number }>;
  mobility: 'static' | 'user-moved' | 'in-motion';
  frequency: number;
  speed: number; // units/sec
  predictedPosition?: { x: number; y: number };
}

export interface BlacklistedOperation {
  target: string;
  action: string;
  reason: string;
  timestamp: number;
}

export function createParallelAgents(count = 12): ParallelAgentWorker[] {
  const specialties: ParallelAgentWorker['specialty'][] = [
    'path_plotter',
    'speed_tracker',
    'obstacle_scanner',
    'anchor_verifier',
    'inventory_scout',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `agent-worker-${i + 1}`,
    name: `Agent #${i + 1} (${specialties[i % specialties.length].replace('_', ' ')})`,
    specialty: specialties[i % specialties.length],
    status: 'idle',
    lastCoords: { x: 0.1 * ((i % 10) + 1), y: 0.1 * (Math.floor(i / 10) + 2) },
    note: 'Standing by for live path plotting',
  }));
}

/** Analyze historical positions to classify mobility */
export function classifyMobility(
  history: Array<{ x: number; y: number; time: number }>
): { mobility: 'static' | 'user-moved' | 'in-motion'; speed: number } {
  if (history.length < 2) return { mobility: 'static', speed: 0 };

  const recent = history.slice(-5);
  let totalDist = 0;
  for (let i = 1; i < recent.length; i++) {
    const dx = recent[i].x - recent[i - 1].x;
    const dy = recent[i].y - recent[i - 1].y;
    totalDist += Math.hypot(dx, dy);
  }

  const durationSec = Math.max(0.1, (recent[recent.length - 1].time - recent[0].time) / 1000);
  const speed = totalDist / durationSec;

  if (speed > 0.05) {
    return { mobility: 'in-motion', speed };
  }
  if (totalDist > 0.02) {
    return { mobility: 'user-moved', speed };
  }
  return { mobility: 'static', speed: 0 };
}

/** Predict next position for items in motion based on velocity */
export function predictNextPosition(
  history: Array<{ x: number; y: number; time: number }>,
  leadSeconds = 1
): { x: number; y: number } | null {
  if (history.length < 2) return null;
  const p1 = history[history.length - 2];
  const p2 = history[history.length - 1];
  const dt = (p2.time - p1.time) / 1000;
  if (dt <= 0) return null;

  const vx = (p2.x - p1.x) / dt;
  const vy = (p2.y - p1.y) / dt;

  return {
    x: Math.min(1, Math.max(0, p2.x + vx * leadSeconds)),
    y: Math.min(1, Math.max(0, p2.y + vy * leadSeconds)),
  };
}
