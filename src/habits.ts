import type { Habit, HabitAnchor, HabitLesson, WorkflowStep, Frame } from './types.js';

export const ANCHOR_PATCH = 48;

export function anchorPatch(patch: string): string {
  return patch;
}

export function isReliable(h: Habit): boolean {
  return h.totalCount >= 3 && successRate(h) >= 0.7;
}

export function successRate(h: Habit): number {
  if (h.totalCount === 0) return 0;
  return h.successCount / h.totalCount;
}

export function habitLine(h: Habit): string {
  const rate = Math.round(successRate(h) * 100);
  return `"${h.target}": ${h.successCount}/${h.totalCount} (${rate}%) ${h.pinned ? '📌' : ''}`;
}

export function togglePin(habits: Habit[], id: string): Habit[] {
  return habits.map((h) => (h.id === id ? { ...h, pinned: !h.pinned } : h));
}

export function pruneHabits(habits: Habit[], limit = 100): Habit[] {
  return habits
    .slice()
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.lastUsed - a.lastUsed)
    .slice(0, limit);
}

export function relevantHabits(habits: Habit[], target: string): Habit[] {
  const term = target.trim().toLowerCase();
  return habits.filter((h) => h.target.toLowerCase().includes(term));
}

export function anchoredHabit(habits: Habit[], target: string): Habit | null {
  const rel = relevantHabits(habits, target);
  return rel.find((h) => isReliable(h)) ?? rel[0] ?? null;
}

export function seedFromAnchor(habit: Habit, live: Frame): { x: number; y: number } | null {
  return { x: habit.anchor.x, y: habit.anchor.y };
}

export function recordOutcome(
  habits: Habit[],
  target: string,
  success: boolean,
  anchor: HabitAnchor,
  dx = 0,
  dy = 0
): Habit[] {
  const existing = habits.find((h) => h.target.toLowerCase() === target.toLowerCase());
  const lesson: HabitLesson = { time: Date.now(), success, dx, dy };

  if (existing) {
    return habits.map((h) =>
      h.id === existing.id
        ? {
            ...h,
            anchor,
            successCount: h.successCount + (success ? 1 : 0),
            totalCount: h.totalCount + 1,
            lessons: [...h.lessons.slice(-9), lesson],
            lastUsed: Date.now(),
          }
        : h
    );
  }

  const newH: Habit = {
    id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    target,
    pinned: false,
    anchor,
    lessons: [lesson],
    successCount: success ? 1 : 0,
    totalCount: 1,
    lastUsed: Date.now(),
  };

  return [newH, ...habits];
}

export function strengthenHabit(
  habits: Habit[],
  step: WorkflowStep,
  point: { x: number; y: number },
  live: Frame
): Habit[] {
  const target = step.target || step.name;
  return recordOutcome(
    habits,
    target,
    true,
    { x: point.x, y: point.y, w: 0.05, h: 0.05 }
  );
}
