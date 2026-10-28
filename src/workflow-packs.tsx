import React, { useState } from 'react';
import type { WorkflowStep, StepAction } from './types.js';
import styles from './droid-assist.module.css';

export interface WorkflowPackStep {
  id: string;
  name: string;
  action: StepAction;
  x: number;
  y: number;
  endX?: number;
  endY?: number;
  text?: string;
  target?: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  errorInfo?: string;
  selected?: boolean;
}

export interface WorkflowPack {
  id: string;
  name: string;
  goal: string;
  steps: WorkflowPackStep[];
  status: 'idle' | 'running' | 'completed' | 'error';
  errorMessage?: string;
}

interface WorkflowPacksProps {
  engine: any;
}

const DEFAULT_PACKS: WorkflowPack[] = [
  {
    id: 'pack-game-nav',
    name: 'Pack 1: Game Navigation',
    goal: 'Click Games, open Custom Game, select Character 5, and start game',
    status: 'idle',
    steps: [
      { id: 'gn-1', name: 'Click Games Tab', action: 'click', x: 0.22, y: 0.12, target: 'Games tab', status: 'pending', selected: true },
      { id: 'gn-2', name: 'Select Custom Game', action: 'click', x: 0.32, y: 0.12, target: 'Custom Game', status: 'pending', selected: true },
      { id: 'gn-3', name: 'Select Character 5', action: 'click', x: 0.44, y: 0.12, target: 'Char 5 button', status: 'pending', selected: true },
      { id: 'gn-4', name: 'Click Start Game', action: 'click', x: 0.56, y: 0.12, target: 'Start Game button', status: 'pending', selected: true },
    ],
  },
  {
    id: 'pack-quest-dialogue',
    name: 'Pack 2: Quest & Dialogue',
    goal: 'Move character 3 spaces forward, talk to priest, type hi and advance dialogue',
    status: 'idle',
    steps: [
      { id: 'qd-1', name: 'Move Character Forward', action: 'move', x: 0.44, y: 0.65, target: 'Sir Knight (Guy)', status: 'pending', selected: true },
      { id: 'qd-2', name: 'Talk to Elder Priest', action: 'click', x: 0.65, y: 0.53, target: 'Priest Talk Button', status: 'pending', selected: true },
      { id: 'qd-3', name: 'Type "hi" in Dialogue', action: 'type', x: 0.65, y: 0.62, text: 'hi', target: 'Dialogue Box', status: 'pending', selected: true },
      { id: 'qd-4', name: 'Click Next to Advance', action: 'click', x: 0.72, y: 0.50, target: 'Next Button', status: 'pending', selected: true },
    ],
  },
  {
    id: 'pack-inventory',
    name: 'Pack 3: Equip & Inventory',
    goal: 'Open treasure chest, equip sword to hand, and put hat on character',
    status: 'idle',
    steps: [
      { id: 'eq-1', name: 'Open Treasure Chest', action: 'double_click', x: 0.72, y: 0.45, target: 'Treasure Chest', status: 'pending', selected: true },
      { id: 'eq-2', name: 'Equip Sword to Hand', action: 'drag', x: 0.52, y: 0.45, endX: 0.46, endY: 0.65, target: 'Sword', status: 'pending', selected: true },
      { id: 'eq-3', name: 'Place Hat on Head', action: 'drag', x: 0.58, y: 0.45, endX: 0.44, endY: 0.58, target: 'Hat', status: 'pending', selected: true },
    ],
  },
];

export function WorkflowPacksStudio({ engine }: WorkflowPacksProps) {
  const [packs, setPacks] = useState<WorkflowPack[]>(DEFAULT_PACKS);
  const [activePackId, setActivePackId] = useState<string>(DEFAULT_PACKS[0].id);
  const [newStepName, setNewStepName] = useState('');
  const [newStepAction, setNewStepAction] = useState<StepAction>('click');

  const activePack = packs.find((p) => p.id === activePackId) || packs[0];

  const updateActiveGoal = (goal: string) => {
    setPacks((prev) => prev.map((p) => (p.id === activePackId ? { ...p, goal } : p)));
  };

  const toggleStepSelect = (packId: string, stepId: string) => {
    setPacks((prev) =>
      prev.map((p) =>
        p.id === packId
          ? {
              ...p,
              steps: p.steps.map((s) => (s.id === stepId ? { ...s, selected: !s.selected } : s)),
            }
          : p
      )
    );
  };

  const addStepToActivePack = () => {
    if (!newStepName.trim() || activePack.steps.length >= 5) return;
    const newStep: WorkflowPackStep = {
      id: `step-${Date.now()}`,
      name: newStepName.trim(),
      action: newStepAction,
      x: 0.5,
      y: 0.5,
      status: 'pending',
      selected: true,
    };
    setPacks((prev) =>
      prev.map((p) => (p.id === activePackId ? { ...p, steps: [...p.steps, newStep] } : p))
    );
    setNewStepName('');
  };

  const removeStep = (packId: string, stepId: string) => {
    setPacks((prev) =>
      prev.map((p) =>
        p.id === packId ? { ...p, steps: p.steps.filter((s) => s.id !== stepId) } : p
      )
    );
  };

  const moveStepToPack = (stepId: string, targetPackId: string) => {
    const step = activePack.steps.find((s) => s.id === stepId);
    if (!step) return;
    const targetPack = packs.find((p) => p.id === targetPackId);
    if (!targetPack || targetPack.steps.length >= 5) {
      alert('Target pack cannot exceed 5 steps');
      return;
    }
    setPacks((prev) =>
      prev.map((p) => {
        if (p.id === activePackId) {
          return { ...p, steps: p.steps.filter((s) => s.id !== stepId) };
        }
        if (p.id === targetPackId) {
          return { ...p, steps: [...p.steps, step] };
        }
        return p;
      })
    );
  };

  const addPack = () => {
    const num = packs.length + 1;
    const newPack: WorkflowPack = {
      id: `pack-${Date.now()}`,
      name: `Pack ${num}: Custom Flow`,
      goal: `User workflow pack ${num}`,
      steps: [],
      status: 'idle',
    };
    setPacks([...packs, newPack]);
    setActivePackId(newPack.id);
  };

  // Run only the active pack steps
  const runPack = async (pack: WorkflowPack) => {
    if (!pack.steps.length) return;
    setPacks((prev) =>
      prev.map((p) => (p.id === pack.id ? { ...p, status: 'running', errorMessage: undefined } : p))
    );

    // Convert pack steps to engine workflow steps
    const engineSteps: WorkflowStep[] = pack.steps.map((s) => ({
      id: s.id,
      name: s.name,
      action: s.action,
      x: s.x,
      y: s.y,
      endX: s.endX,
      endY: s.endY,
      text: s.text,
      target: s.target,
      status: 'pending',
    }));

    engine.setSteps(engineSteps);
    engine.setGoal(pack.goal);

    try {
      await engine.replay(false);
      setPacks((prev) =>
        prev.map((p) =>
          p.id === pack.id
            ? {
                ...p,
                status: 'completed',
                steps: p.steps.map((s) => ({ ...s, status: 'done' })),
              }
            : p
        )
      );
    } catch (err: any) {
      setPacks((prev) =>
        prev.map((p) =>
          p.id === pack.id
            ? {
                ...p,
                status: 'error',
                errorMessage: `Incomplete: ${err?.message || 'Step alignment drift detected'}`,
                steps: p.steps.map((s, idx) => (idx === 0 ? { ...s, status: 'failed' } : s)),
              }
            : p
        )
      );
    }
  };

  // Cross-run selected steps from all packs
  const crossRunSelected = async () => {
    const selectedSteps: WorkflowStep[] = [];
    packs.forEach((p) => {
      p.steps.forEach((s) => {
        if (s.selected) {
          selectedSteps.push({
            id: s.id,
            name: `${p.name}: ${s.name}`,
            action: s.action,
            x: s.x,
            y: s.y,
            endX: s.endX,
            endY: s.endY,
            text: s.text,
            target: s.target,
            status: 'pending',
          });
        }
      });
    });

    if (!selectedSteps.length) {
      alert('Please select at least one step to cross-run.');
      return;
    }

    engine.setSteps(selectedSteps);
    engine.setGoal(`Cross-run ${selectedSteps.length} selected action(s)`);
    await engine.replay(false);
  };

  // Combine all packs into 1 workflow
  const combineAllPacks = () => {
    const combined: WorkflowStep[] = [];
    packs.forEach((p) => {
      p.steps.forEach((s) => {
        combined.push({
          id: s.id,
          name: `${p.name}: ${s.name}`,
          action: s.action,
          x: s.x,
          y: s.y,
          endX: s.endX,
          endY: s.endY,
          text: s.text,
          target: s.target,
          status: 'pending',
        });
      });
    });
    engine.setSteps(combined);
    engine.setGoal(`Composite Workflow (${combined.length} actions from ${packs.length} packs)`);
  };

  // Tell AI to perform similar action using planning & auto-grounding
  const aiPerformSimilar = async () => {
    const prompt = `Perform similar workflow for: "${activePack.goal}". The reference steps are: ${activePack.steps
      .map((s) => `${s.action} on ${s.target || s.name}`)
      .join(', ')}. Use multi-element navigation, locate each target on the screen, and execute step by step.`;

    engine.setGoal(prompt);
    await engine.submitInput();
  };

  return (
    <div
      style={{
        margin: '12px 0',
        padding: '16px',
        backgroundColor: '#0f172a',
        borderRadius: '8px',
        border: '1px solid #334155',
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#38bdf8' }}>
            📦 Modular Workflow Packs Studio
          </h3>
          <small style={{ color: '#94a3b8' }}>
            Build up to 5 moves per pack. Combine, re-order, cross-run, or prompt AI to execute similar workflows.
          </small>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={addPack}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #38bdf8',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            + New Pack
          </button>
          <button
            type="button"
            onClick={crossRunSelected}
            style={{
              padding: '6px 12px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ⚡ Cross-Run Selected
          </button>
          <button
            type="button"
            onClick={combineAllPacks}
            style={{
              padding: '6px 12px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            🔗 Combine All into 1 Workflow
          </button>
        </div>
      </div>

      {/* Pack Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid #334155', paddingBottom: '8px', marginBottom: '12px', overflowX: 'auto' }}>
        {packs.map((p) => {
          const isActive = p.id === activePackId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePackId(p.id)}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: isActive ? '1px solid #38bdf8' : '1px solid #1e293b',
                backgroundColor: isActive ? '#1e293b' : '#020617',
                color: isActive ? '#38bdf8' : '#94a3b8',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{p.name}</span>
              <span
                style={{
                  fontSize: '11px',
                  backgroundColor: p.steps.length >= 5 ? '#f59e0b' : '#334155',
                  color: '#fff',
                  borderRadius: '10px',
                  padding: '1px 6px',
                }}
              >
                {p.steps.length}/5
              </span>
              {p.status === 'completed' && <span style={{ color: '#10b981' }}>✔</span>}
              {p.status === 'error' && <span style={{ color: '#ef4444' }}>⚠</span>}
            </button>
          );
        })}
      </div>

      {/* Active Pack Goal & Action Bar */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <input
          type="text"
          value={activePack.goal}
          onChange={(e) => updateActiveGoal(e.target.value)}
          placeholder="Workflow goal for this pack (AI extracts intent or you can customize)"
          style={{
            flex: 1,
            padding: '8px 12px',
            backgroundColor: '#1e293b',
            border: '1px solid #475569',
            borderRadius: '4px',
            color: '#f8fafc',
            fontSize: '13px',
          }}
        />
        <button
          type="button"
          onClick={() => runPack(activePack)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ▶ Run This Pack
        </button>
        <button
          type="button"
          onClick={aiPerformSimilar}
          style={{
            padding: '8px 16px',
            backgroundColor: '#d97706',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          ✨ AI Perform Similar Action
        </button>
      </div>

      {/* Error or Warning Message Banner */}
      {activePack.errorMessage && (
        <div
          style={{
            padding: '8px 12px',
            backgroundColor: '#450a0a',
            border: '1px solid #ef4444',
            borderRadius: '4px',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '12px',
            fontWeight: 600,
          }}
        >
          ⚠ {activePack.errorMessage}
        </div>
      )}

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        {activePack.steps.length === 0 && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', backgroundColor: '#020617', borderRadius: '4px' }}>
            No steps in this pack yet. Add up to 5 steps below.
          </div>
        )}
        {activePack.steps.map((step, idx) => (
          <div
            key={step.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#1e293b',
              borderRadius: '6px',
              borderLeft: step.status === 'done' ? '4px solid #10b981' : step.status === 'failed' ? '4px solid #ef4444' : '4px solid #64748b',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                checked={!!step.selected}
                onChange={() => toggleStepSelect(activePack.id, step.id)}
                title="Select for cross-run"
              />
              <span style={{ fontWeight: 700, color: '#38bdf8', minWidth: '24px' }}>#{idx + 1}</span>
              <div>
                <strong style={{ fontSize: '14px', marginRight: '8px' }}>{step.name}</strong>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#334155',
                    color: '#94a3b8',
                    textTransform: 'uppercase',
                  }}
                >
                  {step.action}
                </span>
                {step.target && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#cbd5e1' }}>Target: {step.target}</span>}
                {step.text && <span style={{ marginLeft: '8px', fontSize: '12px', color: '#a7f3d0' }}>Text: "{step.text}"</span>}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {step.status === 'done' && <span style={{ color: '#10b981', fontSize: '13px', fontWeight: 600 }}>✔ Completed</span>}
              {step.status === 'failed' && <span style={{ color: '#ef4444', fontSize: '13px', fontWeight: 600 }}>✖ Drift / Incomplete</span>}

              {/* Move to another pack dropdown */}
              <select
                aria-label={`Move ${step.name} to another pack`}
                onChange={(e) => {
                  if (e.target.value) {
                    moveStepToPack(step.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#020617',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '4px',
                  fontSize: '12px',
                }}
              >
                <option value="" disabled>
                  Move to pack...
                </option>
                {packs
                  .filter((p) => p.id !== activePack.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>

              <button
                type="button"
                onClick={() => removeStep(activePack.id, step.id)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
                title="Remove step"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Step Form (Max 5 steps) */}
      {activePack.steps.length < 5 ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#020617', padding: '10px', borderRadius: '6px' }}>
          <select
            value={newStepAction}
            onChange={(e) => setNewStepAction(e.target.value as StepAction)}
            style={{
              padding: '6px 10px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          >
            <option value="click">click</option>
            <option value="double_click">double_click</option>
            <option value="move">move</option>
            <option value="drag">drag</option>
            <option value="type">type</option>
            <option value="wait">wait</option>
            <option value="calc">calc</option>
            <option value="search">search</option>
          </select>
          <input
            type="text"
            value={newStepName}
            onChange={(e) => setNewStepName(e.target.value)}
            placeholder='Step name or action description (e.g. "click custom game")'
            style={{
              flex: 1,
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '4px',
              fontSize: '13px',
            }}
          />
          <button
            type="button"
            onClick={addStepToActivePack}
            disabled={!newStepName.trim()}
            style={{
              padding: '6px 16px',
              backgroundColor: '#0891b2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 600,
              cursor: newStepName.trim() ? 'pointer' : 'not-allowed',
              opacity: newStepName.trim() ? 1 : 0.5,
            }}
          >
            + Add Step ({activePack.steps.length}/5)
          </button>
        </div>
      ) : (
        <div style={{ padding: '8px', textAlign: 'center', color: '#f59e0b', fontSize: '13px' }}>
          Maximum 5 steps reached for this pack. You can move steps or create another pack to chain them.
        </div>
      )}
    </div>
  );
}
