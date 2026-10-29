import { useState, useCallback } from 'react';
import type { WorkflowStep, Frame, LogEntry } from './types.js';
import type { Measurement, RulerPoint } from './ruler.js';
import { createMeasurement } from './ruler.js';
import type { Calibration } from './calibration.js';

export function remapStep(cal: Calibration, step: WorkflowStep): WorkflowStep {
  return step;
}

export interface SavedMeasurement {
  id: string;
  by: string;
  line: string;
}

export interface BaselineState {
  a?: { name: string } | null;
  b?: { name: string } | null;
  cellW: number;
  cellH: number;
}

export function useMeasure(options: {
  frames: Frame[];
  framesRef: { current: Frame[] };
  elementMap: () => any[];
  addLog: (from: string, msg: string, tone?: LogEntry['tone']) => void;
  rescale: (cal: Calibration) => void;
}) {
  const [on, setOn] = useState(false);
  const [frameId, setFrameId] = useState<number | null>(null);
  const [points, setPoints] = useState<RulerPoint[]>([]);
  const [measurements, setMeasurements] = useState<SavedMeasurement[]>([]);
  const [baseline, setBaselineState] = useState<BaselineState | null>(null);
  const [calibration, setCalibration] = useState<{ detail: string; drift: boolean } | null>(null);

  const toggle = useCallback(() => {
    setOn((v) => {
      const next = !v;
      if (!next) {
        setPoints([]);
        setFrameId(null);
      }
      return next;
    });
  }, []);

  const addPoint = useCallback((p: RulerPoint) => {
    setPoints((prev) => [...prev, p]);
  }, []);

  const undo = useCallback(() => {
    setPoints((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setPoints([]);
  }, []);

  const measureFrame = useCallback((id: number | null) => {
    setFrameId(id);
    setOn(true);
  }, []);

  const measurement: Measurement = createMeasurement(points);

  const saveRuler = useCallback(() => {
    if (!measurement || !measurement.segments.length) return;
    const line = `${measurement.totalPx}px (${measurement.totalPct}%) with ${measurement.points.length} points`;
    const item: SavedMeasurement = {
      id: `meas_${Date.now().toString(36)}`,
      by: 'User',
      line,
    };
    setMeasurements((prev) => [item, ...prev]);
    options.addLog('Ruler', `Recorded measurement: ${line}`, 'ok');
  }, [measurement, options]);

  const setBaseline = useCallback(() => {
    setBaselineState({
      a: { name: 'Top-Left Reference' },
      b: { name: 'Bottom-Right Reference' },
      cellW: 60,
      cellH: 60,
    });
    options.addLog('Ruler', 'Set coordinate baseline grid 60×60px', 'info');
  }, [options]);

  const recalibrateNow = useCallback((mode: string) => {
    setCalibration({ detail: `${mode} sync`, drift: false });
    options.addLog('Ruler', `Recalibrated coordinates (${mode})`, 'ok');
  }, [options]);

  const noteGrounding = useCallback((_out: any) => {
    // optional note
  }, []);

  const measureQuery = useCallback((query: string, actor: string) => {
    const msg = `Measurement for "${query}" (${actor}): ${measurement.totalPx}px (${measurement.totalPct}%)`;
    options.addLog('Ruler', msg, 'info');
    return msg;
  }, [measurement, options]);

  return {
    on,
    toggle,
    points,
    addPoint,
    undo,
    clear,
    frameId,
    measureFrame,
    measurement,
    measurements,
    saveRuler,
    baseline,
    setBaseline,
    calibration,
    recalibrateNow,
    noteGrounding,
    measureQuery,
  };
}
