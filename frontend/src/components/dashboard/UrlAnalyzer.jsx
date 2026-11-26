import React, { useState } from 'react';
import axios from 'axios';
import { Globe, Search, Loader2 } from 'lucide-react';

export default function UrlAnalyzer({ onResult }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/analyze-url', { url: url.trim() });
      if (res.data.success) {
        onResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'URL scan request failed.');
    } finally {
      setLoading(false);
    }
  };

  const sampleUrls = [
    'http://login-paypal-verify-account.com-secure.xyz/login',
    'https://google.com',
    'http://192.168.1.1/admin-login.php?user=admin',
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={handleScan} className="space-y-3">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Enter Target URL for Threat Analysis
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Globe className="w-4 h-4 absolute left-3 top-3.5 text-slate-500" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. http://login-paypal-security-update.xyz/verify"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono transition"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Scan URL
          </button>
        </div>
      </form>

      {error && <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}

      <div className="pt-2">
        <span className="text-xs text-slate-500 font-medium block mb-2">Try Preset Examples:</span>
        <div className="flex flex-wrap gap-2">
          {sampleUrls.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setUrl(sample)}
              className="text-xs text-slate-400 hover:text-blue-400 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg transition font-mono truncate max-w-xs"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
