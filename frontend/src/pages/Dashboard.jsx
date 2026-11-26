import React, { useState } from 'react';
import { Globe, FileText, Film, Activity, ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';
import UrlAnalyzer from '../components/dashboard/UrlAnalyzer';
import TextAnalyzer from '../components/dashboard/TextAnalyzer';
import MediaAnalyzer from '../components/dashboard/MediaAnalyzer';
import AnomalyDetector from '../components/dashboard/AnomalyDetector';
import ExplanationPanel from '../components/panels/ExplanationPanel';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('url');
  const [scanResult, setScanResult] = useState(null);

  const tabs = [
    { id: 'url', label: 'URL Threat Scanner', icon: Globe },
    { id: 'text', label: 'Prompt Injection / Text', icon: FileText },
    { id: 'media', label: 'Deepfake Media', icon: Film },
    { id: 'anomaly', label: 'Anomaly Detector', icon: Activity },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-blue-400" />
            Explainable AI Cyber Defense Console
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time threat evaluation combining Heuristic Analysis, ML Classifiers & XAI Reasoning.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            System Engine Active
          </div>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Input & Analyzer Column */}
        <div className="lg:col-span-6 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-6">
            {/* Tab Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold transition ${
                      active
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Analyzer Component */}
            <div className="pt-2">
              {activeTab === 'url' && <UrlAnalyzer onResult={setScanResult} />}
              {activeTab === 'text' && <TextAnalyzer onResult={setScanResult} />}
              {activeTab === 'media' && <MediaAnalyzer onResult={setScanResult} />}
              {activeTab === 'anomaly' && <AnomalyDetector onResult={setScanResult} />}
            </div>
          </div>
        </div>

        {/* Right XAI Explanation Column */}
        <div className="lg:col-span-6">
          <ExplanationPanel result={scanResult} />
        </div>
      </div>
    </div>
  );
}
