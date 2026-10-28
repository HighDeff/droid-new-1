export type ThoughtKind = 'plan' | 'reflect' | 'decide' | 'verify' | 'check' | 'route' | 'supervisor';

export interface ThinkingEntry {
  id: string;
  step: string;
  time: number;
  kind: ThoughtKind;
  text: string;
  thinking: string | null;
  verdict?: string;
}

export function addEntry(
  timeline: ThinkingEntry[],
  entry: Omit<ThinkingEntry, 'id' | 'time'> & { id?: string; time?: number },
  limit = 100
): ThinkingEntry[] {
  const full: ThinkingEntry = {
    id: entry.id ?? `th-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    time: entry.time ?? Date.now(),
    step: entry.step,
    kind: entry.kind,
    text: entry.text,
    thinking: entry.thinking,
    verdict: entry.verdict,
  };
  return [full, ...timeline].slice(0, limit);
}

export function verdictText(entry: ThinkingEntry): string {
  if (entry.verdict) return entry.verdict;
  return entry.text;
}
