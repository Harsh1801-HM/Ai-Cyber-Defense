import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bell, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/alerts');
      if (res.data.success) {
        setAlerts(res.data.alerts || []);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAckAll = async () => {
    try {
      await axios.post('/api/alerts/ack-all');
      fetchAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-400" /> High-Severity Real-Time Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">Live threat incidents exceeding high risk threshold (Score &ge; 70).</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleAckAll}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <CheckCircle className="w-3.5 h-3.5" /> Acknowledge All
          </button>
          <button
            onClick={fetchAlerts}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center border border-slate-800">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-slate-300">All Clear — No Unacknowledged Alerts</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              High-risk threat detections will automatically stream to this room in real-time.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert._id} className="glass-card rounded-2xl p-5 border border-red-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <h4 className="text-sm font-bold text-white">{alert.threatClassification || 'High Security Threat'}</h4>
                  <span className="bg-red-500/20 text-red-400 text-xs font-bold font-mono px-2 py-0.5 rounded border border-red-500/30">
                    Risk: {alert.riskScore} / 100
                  </span>
                </div>
                <p className="text-xs text-slate-300">{alert.explanation?.summary || 'Critical threat flag triggered.'}</p>
                <span className="text-[11px] font-mono text-slate-500 block">Logged: {new Date(alert.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
