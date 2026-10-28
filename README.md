# Droid Assist

An AI accessibility assistant and screen automation application built with React, TypeScript, and Vite.

## Features

- **Multi-Source Screen Capture**: Supports interactive demo desktop, browser screen sharing, and remote desktop bridge.
- **Visual Drift Correction**: Euclidean comparison with dynamic template matching to maintain alignment when UI elements move.
- **Workflow Automation & Recording**: Record, edit, replay, and manage multi-step workflows (click, double click, move, drag, scroll, type, wait, calc, search).
- **Interactive Stage & Spatial Grid**: Labeled coordinate grid (A1..H12), cursor path tracking, on-screen annotations, and ruler measurement.
- **Specialized Multi-Agent System**:
  - **Popup Watcher**: Identifies and clears intrusive ads and overlays.
  - **Drift Monitor**: Cross-checks frames and maintains synchronization levels.
  - **Element Identifier & Map Studio**: Maps UI components and verifies coordinates.
  - **Coordinate Learner & Habits**: Learns dwell positions and successful action targets.
  - **Supervisor & Subagents**: Reviews execution quality, applies corrections, and conducts automated link/route verification.
- **Thinking Timeline**: Real-time visibility into AI reasoning, reflection, and step verdicts.
- **Safety Controls**: Emergency abort hotkey, configurable action budgets, and armed/dry-run states.

## Getting Started

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```
