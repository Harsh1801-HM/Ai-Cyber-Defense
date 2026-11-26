import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Film, Image as ImageIcon, Loader2 } from 'lucide-react';

export default function MediaAnalyzer({ onResult }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleScan = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('media', file);

    try {
      const res = await axios.post('/api/analyze-media', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        onResult(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Media deepfake scan failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleScan} className="space-y-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Upload Image or Video for Deepfake & Artifact Detection
        </label>
        
        <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 rounded-xl p-6 text-center transition bg-slate-900/40 relative">
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-8 h-8 text-blue-400 mb-1" />
            <p className="text-sm font-semibold text-slate-300">
              {file ? file.name : 'Drag & drop image/video or click to browse'}
            </p>
            <p className="text-xs text-slate-500 font-mono">
              {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${file.type}` : 'Supports JPG, PNG, MP4, WEBM (Max 50MB)'}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !file}
            className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
            Analyze Media
          </button>
        </div>
      </form>

      {error && <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</div>}
    </div>
  );
}
