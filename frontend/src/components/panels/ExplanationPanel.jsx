import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert, Cpu, CheckSquare, ListChecks } from 'lucide-react';
import RiskGauge from '../charts/RiskGauge';

export default function ExplanationPanel({ result }) {
  if (!result) {
    return (
      <div className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px] border border-slate-800">
        <Cpu className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-300">Explainable AI (XAI) Engine Idle</h3>
        <p className="text-sm text-slate-500 max-w-sm mt-1">
          Submit a URL, Text prompt, Media file, or Numerical dataset on the left to view real-time threat intelligence and technical breakdowns.
        </p>
      </div>
    );
  }

  const { riskScore, riskLevel, threatType, threatClassification, explanation, indicators = [], suggestedActions = [], reasons = [], breakdown } = result;

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
      {/* Header & Gauge */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-800/80 pb-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white tracking-wide">Threat Analysis & XAI Summary</h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">ID: {result.analysisId || result.id || 'N/A'}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="bg-blue-500/20 text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-500/30">
              Type: {result.type}
            </span>
            <span className="bg-purple-500/20 text-purple-400 text-xs font-semibold px-2.5 py-0.5 rounded border border-purple-500/30">
              Classification: {threatClassification || threatType || 'Evaluated'}
            </span>
          </div>
        </div>

        <RiskGauge score={riskScore} level={riskLevel} />
      </div>

      {/* AI Executive Summary */}
      <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" /> Executive AI Assessment
        </h4>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {explanation?.summary || 'No summary available for this scan.'}
        </p>
      </div>

      {/* Key Risk Indicators */}
      {indicators.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Triggered Risk Indicators ({indicators.length})
          </h4>
          <div className="space-y-2">
            {indicators.map((ind, idx) => (
              <div key={idx} className="bg-slate-900/60 rounded-lg p-3 border border-slate-800/80 flex items-start justify-between gap-3">
                <div>
                  <h5 className="text-sm font-semibold text-amber-300">{ind.indicator || ind.name}</h5>
                  <p className="text-xs text-slate-400 mt-0.5">{ind.description}</p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                  +{ind.weight} Risk
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {suggestedActions.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-400" /> Recommended Mitigations
          </h4>
          <ul className="space-y-2">
            {suggestedActions.map((act, idx) => (
              <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800">
                <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
