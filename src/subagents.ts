import type { Frame, LearnedPattern } from './types.js';
import type { AskFn } from './ai.js';
import { newPattern } from './flow-memory.js';

export type SubagentStatus = 'pass' | 'fail' | 'aborted' | 'skipped';

export interface SubagentTask {
  id: string;
  target: string;
  label: string;
  kind: 'link' | 'route';
  budget: number;
}

export interface SubagentOutcome {
  id: string;
  target: string;
  label: string;
  status: SubagentStatus;
  budget: number;
  dry: boolean;
  message: string;
  shots: Frame[];
  thinking: string[];
  point?: { x: number; y: number };
  avoid?: string;
  add?: string;
}

export interface SubagentReport {
  goal: string;
  kind: 'link' | 'route' | string;
  time: number;
  finished: boolean;
  results: SubagentOutcome[];
}

export interface TestRequest {
  goal: string;
  kind: 'link' | 'route';
  items: string[];
}

/** Tally of pass/fail/aborted/skipped results */
export function tally(results: SubagentOutcome[]): Record<SubagentStatus, number> {
  const counts: Record<SubagentStatus, number> = { pass: 0, fail: 0, aborted: 0, skipped: 0 };
  for (const r of results) {
    if (counts[r.status] !== undefined) counts[r.status]++;
  }
  return counts;
}

/** Determines if user input represents a subagent test goal */
export function isTestGoal(goal: string): boolean {
  return /^\s*\/test\b/i.test(goal);
}

/** Parses /test command into TestRequest */
export function parseTestSpec(goal: string): TestRequest | null {
  const m = goal.match(/^\s*\/test\s+(links?|route)\s+(.+)$/i);
  if (!m) return null;
  const isRoute = /^route$/i.test(m[1]);
  const rawItems = isRoute ? m[2].split(/\s*(?:>|->|→)\s*/) : m[2].split(/[,;]\s*/);
  const items = rawItems.map((s) => s.trim()).filter(Boolean);
  return {
    goal,
    kind: isRoute ? 'route' : 'link',
    items,
  };
}

/** Ask the model to list links or route sections if not specified */
export async function listSections(
  ask: AskFn,
  frame: Frame | null,
  req: TestRequest
): Promise<{ items: string[] }> {
  if (req.items.length) return { items: req.items };
  if (!frame) return { items: ['Navigation', 'Settings', 'Profile'] };

  try {
    const prompt = `List the interactive clickable ${req.kind === 'link' ? 'navigation links/buttons' : 'route stops'} visible on this screen as a JSON array of strings under key "items". Example: {"items": ["Home", "Shop", "Cart"]}`;
    const reply = await ask({
      messages: [{ role: 'user', content: prompt }],
      images: [frame],
      format: 'json',
    });
    const parsed = JSON.parse(reply.content);
    if (Array.isArray(parsed.items) && parsed.items.length) {
      return { items: parsed.items.map(String) };
    }
  } catch {
    // fallback
  }
  return { items: req.kind === 'route' ? ['Home', 'Search', 'Item Details'] : ['Files', 'Notes', 'Game', 'Calc'] };
}

/** Plans subagents by slicing action budget across items */
export function planSubagents(
  kind: 'link' | 'route' | string,
  items: string[],
  totalBudget: number
): SubagentTask[] {
  const perTask = Math.max(2, Math.floor(totalBudget / Math.max(1, items.length)));
  return items.map((target, idx) => ({
    id: `sub-${idx + 1}-${Date.now()}`,
    target,
    label: `${kind === 'route' ? `Stop #${idx + 1}` : 'Test link'}: ${target}`,
    kind: kind === 'route' ? 'route' : 'link',
    budget: perTask,
  }));
}

/** Runs subagents sequentially, checking abort condition */
export async function runSubagents(
  tasks: SubagentTask[],
  runner: (task: SubagentTask) => Promise<SubagentOutcome>,
  isAborted: () => boolean,
  onProgress?: (results: SubagentOutcome[]) => void
): Promise<SubagentOutcome[]> {
  const outcomes: SubagentOutcome[] = [];

  for (const task of tasks) {
    if (isAborted()) {
      outcomes.push({
        id: task.id,
        target: task.target,
        label: task.label,
        status: 'aborted',
        budget: task.budget,
        dry: false,
        message: 'Aborted before execution',
        shots: [],
        thinking: [],
      });
      onProgress?.([...outcomes]);
      continue;
    }

    try {
      const outcome = await runner(task);
      outcomes.push(outcome);
    } catch (err: unknown) {
      outcomes.push({
        id: task.id,
        target: task.target,
        label: task.label,
        status: 'fail',
        budget: task.budget,
        dry: false,
        message: err instanceof Error ? err.message : String(err),
        shots: [],
        thinking: [],
      });
    }

    onProgress?.([...outcomes]);
  }

  return outcomes;
}

/** Generates learned patterns from subagent results */
export function reportPatterns(results: SubagentOutcome[], goal: string): LearnedPattern[] {
  const patterns: LearnedPattern[] = [];
  for (const r of results) {
    if (r.avoid) {
      patterns.push(newPattern('avoid', r.avoid, r.target));
    }
    if (r.add) {
      patterns.push(newPattern('add', r.add, r.target));
    }
  }
  return patterns;
}

/** Formats summary string */
export function summaryText(results: SubagentOutcome[]): string {
  const t = tally(results);
  return `${t.pass} pass, ${t.fail} fail, ${t.aborted} aborted, ${t.skipped} skipped (${results.length} total)`;
}
