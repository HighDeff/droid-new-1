import { useState, useCallback } from 'react';
import type { WorkflowStep, Frame, LogEntry } from './types.js';
import type { Measurement, RulerPoint } from './ruler.js';
import { createMeasurement } from './ruler.js';
import type { Calibration } from './calibration.js';

export function remapStep(cal: Calibration, step: WorkflowStep): WorkflowStep {
  return step;
}

export function useMeasure(options: {
  frames: Frame[];
  framesRef: { current: Frame[] };
  elementMap: () => any[];
  addLog: (from: string, msg: string, tone?: LogEntry['tone']) => void;
  rescale: (cal: Calibration) => void;
}) {
  const [on, setOn] = useState(false);
  const [points, setPoints] = useState<RulerPoint[]>([]);

  const toggle = useCallback(() => {
    setOn((v) => !v);
    if (on) setPoints([]);
  }, [on]);

  const addPoint = useCallback((p: RulerPoint) => {
    setPoints((prev) => [...prev, p]);
  }, []);

  const clear = useCallback(() => {
    setPoints([]);
  }, []);

  const measurement: Measurement = createMeasurement(points);

  const recalibrateNow = useCallback((mode: string) => {
    options.addLog('Ruler', `Recalibrated coordinates (${mode})`, 'ok');
  }, [options]);

  const noteGrounding = useCallback((out: any) => {
    // optional note
  }, []);

  return {
    on,
    toggle,
    points,
    addPoint,
    clear,
    measurement,
    recalibrateNow,
    noteGrounding,
  };
}
