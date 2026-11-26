import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, RefreshCw, Trash2, ShieldAlert } from 'lucide-react';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/history');
      if (res.data.success) {
        setHistory(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-400" /> Scan Audit & Threat Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review historical scan evaluations and security audit records.</p>
        </div>
        <button
          onClick={fetchHistory}
          className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Logs
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Type</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Level</th>
                <th className="p-4">Classification</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-mono">
                    No scan logs recorded yet. Execute a scan from the dashboard to populate history.
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-900/40 transition">
                    <td className="p-4 font-bold text-blue-400">{item.type}</td>
                    <td className="p-4 font-mono font-bold">{item.riskScore} / 100</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[11px] font-bold ${
                          item.riskScore >= 70
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : item.riskScore >= 40
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.riskLevel || 'EVALUATED'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-200">{item.threatClassification || 'Analysis'}</td>
                    <td className="p-4 font-mono text-slate-500">{new Date(item.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
