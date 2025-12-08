// src/components/ProgressBar.jsx
import React, { useEffect } from "react";

/**
 * Props:
 * - step: current step number (1-based)
 * - total: total steps (default 5)
 * - persistKey: optional localStorage key to store latest step (default 'kycProgress')
 */
export default function ProgressBar({ step = 1, total = 5, persistKey = "kycProgress" }) {
  const pct = Math.max(0, Math.min(100, Math.round((step / total) * 100)));

  useEffect(() => {
    // persist progress so refresh won't lose it
    try {
      localStorage.setItem(persistKey, String(step));
    } catch (e) {
      // ignore storage errors
    }
  }, [step, persistKey]);

  return (
    <div className="w-full" aria-hidden={false}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-slate-600">Step {step} of {total}</div>
        <div className="text-xs text-slate-400">{pct}%</div>
      </div>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full bg-slate-100 h-3 rounded-full overflow-hidden"
      >
        <div
          className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
