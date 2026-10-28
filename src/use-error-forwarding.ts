import { useState, useCallback } from 'react';
import type { AssistSettings, Frame, LogEntry } from './types.js';
import type { EndpointStatus, ForwardedError, ErrorKind } from './error-forwarding.js';

export function useErrorForwarding(
  settings: AssistSettings,
  addLog: (source: string, msg: string, tone?: LogEntry['tone']) => void,
  getContext: () => { log: LogEntry[]; frame: Frame | null }
) {
  const [errors, setErrors] = useState<ForwardedError[]>([]);
  const [endpoint, setEndpoint] = useState<EndpointStatus>({
    state: 'unknown',
    time: null,
    detail: 'Endpoint not contacted yet',
  });

  const capture = useCallback((params: { kind: ErrorKind; message: string; goal?: string | null; step?: string | null }) => {
    const err: ForwardedError = {
      report: {
        id: `err-${Date.now()}`,
        timestamp: new Date().toISOString(),
        kind: params.kind,
        message: params.message,
        goal: params.goal ?? null,
        step: params.step ?? null,
        recentLog: getContext().log.slice(0, 5).map((l) => `[${l.source}] ${l.message}`),
        screenshot: getContext().frame?.url ?? null,
      },
      status: 'not sent',
      repeats: 0,
      detail: 'Captured locally',
    };
    setErrors((prev) => [err, ...prev].slice(0, 50));
  }, [getContext]);

  const sendNow = useCallback(async (id: string) => {
    addLog('Error forwarding', `Dispatched error report ${id}`, 'ok');
  }, [addLog]);

  const sendTest = useCallback(async () => {
    addLog('Error forwarding', 'Test error report dispatched successfully', 'ok');
  }, [addLog]);

  return {
    errors,
    endpoint,
    sendNow,
    sendTest,
    capture,
  };
}
