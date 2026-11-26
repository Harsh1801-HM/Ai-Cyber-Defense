import React from 'react';

export default function RiskGauge({ score = 0, level = 'LOW' }) {
  const normalizedScore = Math.min(Math.max(score, 0), 100);
  // Semicircle arc calculations
  const radius = 70;
  const strokeWidth = 14;
  const circumference = Math.PI * radius; // Half perimeter
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  let colorClass = '#10b981'; // Green (Low)
  if (normalizedScore >= 70) colorClass = '#ef4444'; // Red (High)
  else if (normalizedScore >= 40) colorClass = '#f59e0b'; // Amber (Medium)

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-44 h-24 flex items-end justify-center">
        <svg className="w-44 h-44 overflow-visible" viewBox="0 0 160 100">
          {/* Background Arc */}
          <path
            d="M 10 90 A 70 70 0 0 1 150 90"
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Active Score Arc */}
          <path
            d="M 10 90 A 70 70 0 0 1 150 90"
            fill="none"
            stroke={colorClass}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out, stroke 0.5s ease' }}
          />
        </svg>
        <div className="absolute bottom-0 text-center">
          <span className="text-3xl font-extrabold font-mono text-white">{normalizedScore}</span>
          <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">/ 100 Risk</span>
        </div>
      </div>
      <div className="mt-3">
        <span
          className={`px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
            normalizedScore >= 70
              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : normalizedScore >= 40
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}
        >
          {level} Risk
        </span>
      </div>
    </div>
  );
}
