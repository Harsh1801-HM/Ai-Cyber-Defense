import React, { useState } from 'react';
import axios from 'axios';
import { Activity, Play, Loader2 } from 'lucide-react';

export default function AnomalyDetector({ onResult }) {
  const [dataInput, setDataInput] = useState('20, 22, 21, 19, 25, 23, 98, 22, 21');
  const [label, setLabel] = useState('Server CPU Usage (%)');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    const array = dataInput
      .split(',')
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v));

    if (array.length < 3) {
      setError('Please enter at least 3 valid numerical data points separated by commas.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/detect-anomaly', { data: array, label });
      if (res.data.success) {
        onResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Anomaly detection failed.');
    } finally {
      setLoading(false);
    }
  };

  const presetDatasets = [
    { label: 'CPU Usage Spikes', data: '20, 22, 21, 19, 25, 23, 98, 22, 21' },
    { label: 'Network Ingress Bytes', data: '1200, 1150, 1190, 15000, 1210, 1180, 1230' },
    { label: 'Normal Distributed Traffic', data: '45, 48, 47, 50, 46, 49, 51' },
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleScan} className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Dataset Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Memory Usage / API Traffic"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Comma-Separated Numerical Data Points
          </label>
          <textarea
            rows={3}
            value={dataInput}
            onChange={(e) => setDataInput(e.target.value)}
            placeholder="e.g. 10.5, 12.1, 11.8, 95.4, 11.2"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono resize-none"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !dataInput.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Detect Outliers
          </button>
        </div>
      </form>

      {error && <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

      <div className="pt-2">
        <span className="text-xs text-slate-500 font-medium block mb-2">Preset Telemetry Sets:</span>
        <div className="flex flex-wrap gap-2">
          {presetDatasets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setLabel(preset.label);
                setDataInput(preset.data);
              }}
              className="text-xs text-slate-400 hover:text-blue-400 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition font-mono"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
