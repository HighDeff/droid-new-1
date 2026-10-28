import React, { useState, useRef } from 'react';
import type { Frame } from './types.js';

interface SnipToolProps {
  onCapture: (box: { x: number; y: number; w: number; h: number }, dataUrl: string) => void;
  onClose: () => void;
  frame: Frame | null;
}

export function SnipOverlay({ onCapture, onClose, frame }: SnipToolProps) {
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [current, setCurrent] = useState<{ x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setStart({ x, y });
    setCurrent({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!start || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setCurrent({ x, y });
  };

  const handleMouseUp = () => {
    if (!start || !current || !frame) {
      setStart(null);
      setCurrent(null);
      return;
    }

    const box = {
      x: Math.min(start.x, current.x),
      y: Math.min(start.y, current.y),
      w: Math.abs(current.x - start.x),
      h: Math.abs(current.y - start.y),
    };

    if (box.w < 0.01 || box.h < 0.01) {
      setStart(null);
      setCurrent(null);
      return;
    }

    // Crop from frame
    const img = new Image();
    img.src = frame.full || frame.url;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const cropW = Math.max(1, Math.round(box.w * img.naturalWidth));
      const cropH = Math.max(1, Math.round(box.h * img.naturalHeight));
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(
          img,
          Math.round(box.x * img.naturalWidth),
          Math.round(box.y * img.naturalHeight),
          cropW,
          cropH,
          0,
          0,
          cropW,
          cropH
        );
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        onCapture(box, dataUrl);
      }
    };

    setStart(null);
    setCurrent(null);
  };

  const box = start && current ? {
    left: `${Math.min(start.x, current.x) * 100}%`,
    top: `${Math.min(start.y, current.y) * 100}%`,
    width: `${Math.abs(current.x - start.x) * 100}%`,
    height: `${Math.abs(current.y - start.y) * 100}%`,
  } : null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        cursor: 'crosshair',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 50,
        userSelect: 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#0f172a',
          color: '#38bdf8',
          padding: '6px 14px',
          borderRadius: '6px',
          fontWeight: 600,
          fontSize: '13px',
          border: '1px solid #38bdf8',
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
        }}
      >
        <span>✂ Drag a rectangle to snip any area of the screen</span>
        <button
          type="button"
          onClick={onClose}
          style={{
            backgroundColor: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            padding: '2px 8px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Cancel
        </button>
      </div>

      {box && (
        <div
          style={{
            position: 'absolute',
            ...box,
            border: '2px dashed #38bdf8',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
          }}
        />
      )}
    </div>
  );
}

export function SnipInspector({
  snip,
  onClose,
  onReroute,
  onSaveElement,
}: {
  snip: { box: { x: number; y: number; w: number; h: number }; dataUrl: string } | null;
  onClose: () => void;
  onReroute?: (center: { x: number; y: number }) => void;
  onSaveElement?: (name: string, box: { x: number; y: number; w: number; h: number }, patch: string) => void;
}) {
  const [elementName, setElementName] = useState('');

  if (!snip) return null;

  const center = {
    x: snip.box.x + snip.box.w / 2,
    y: snip.box.y + snip.box.h / 2,
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 320,
        backgroundColor: '#0f172a',
        border: '1px solid #38bdf8',
        borderRadius: '8px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
        padding: '16px',
        zIndex: 100,
        color: '#f8fafc',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong style={{ color: '#38bdf8', fontSize: '14px' }}>✂ Screen Snip Captured</strong>
        <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
          ✕
        </button>
      </div>

      <img
        src={snip.dataUrl}
        alt="Snip crop"
        style={{
          width: '100%',
          maxHeight: 140,
          objectFit: 'contain',
          backgroundColor: '#020617',
          borderRadius: '4px',
          marginBottom: '8px',
        }}
      />

      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '8px' }}>
        Region: ({Math.round(snip.box.x * 100)}%, {Math.round(snip.box.y * 100)}%) · Size: {Math.round(snip.box.w * 100)}% × {Math.round(snip.box.h * 100)}%
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {onReroute && (
          <button
            type="button"
            onClick={() => onReroute(center)}
            style={{
              padding: '6px 10px',
              backgroundColor: '#0284c7',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            ⤾ Reroute Operations to This Center
          </button>
        )}

        <div style={{ display: 'flex', gap: '4px' }}>
          <input
            type="text"
            placeholder="Element name (e.g. Chest)"
            value={elementName}
            onChange={(e) => setElementName(e.target.value)}
            style={{
              flex: 1,
              padding: '4px 8px',
              backgroundColor: '#1e293b',
              color: '#f8fafc',
              border: '1px solid #334155',
              borderRadius: '4px',
              fontSize: '12px',
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (onSaveElement && elementName.trim()) {
                onSaveElement(elementName.trim(), snip.box, snip.dataUrl);
                onClose();
              }
            }}
            disabled={!elementName.trim()}
            style={{
              padding: '4px 10px',
              backgroundColor: '#059669',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: elementName.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '12px',
            }}
          >
            Save Map
          </button>
        </div>
      </div>
    </div>
  );
}
