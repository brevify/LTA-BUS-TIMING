import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Database,
  ExternalLink,
  Key,
  Radio,
  Server,
  X,
} from 'lucide-react';
import { BackendConfig, getBackendConfig, saveBackendConfig } from '../../services/ltaApi';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated: () => void;
}

export const BackendModal: React.FC<BackendModalProps> = ({
  isOpen,
  onClose,
  onConfigUpdated,
}) => {
  const [config, setConfig] = useState<BackendConfig>(getBackendConfig());
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    saveBackendConfig(config);
    onConfigUpdated();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!config.backendBaseUrl) {
      setTestingStatus('error');
      setTestMessage('Please specify a Backend Base URL first.');
      return;
    }

    setTestingStatus('testing');
    setTestMessage('Pinging bus arrivals endpoint...');

    try {
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (config.ltaAccountKey) {
        headers['AccountKey'] = config.ltaAccountKey;
      }

      const res = await fetch(`${config.backendBaseUrl}/BusArrivalv2?BusStopCode=01012`, {
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setTestingStatus('success');
        setTestMessage(`Connection verified! Received ${data.Services?.length || 0} services from backend.`);
      } else {
        setTestingStatus('error');
        setTestMessage(`Backend returned HTTP status ${res.status}: ${res.statusText}`);
      }
    } catch (err: any) {
      setTestingStatus('error');
      setTestMessage(`Failed to reach backend: ${err.message || 'Network error'}. Check CORS or endpoint URL.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Backend Connection & LTA DataMall</h3>
              <p className="text-xs text-slate-400">
                Connect your backend proxy or run with high-fidelity live simulation.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Data Source Mode Toggle */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              Data Pipeline Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setConfig({ ...config, useCustomBackend: false })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  !config.useCustomBackend
                    ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${!config.useCustomBackend ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-sm font-semibold text-white">Live Real-time Simulation</span>
                  </div>
                  {!config.useCustomBackend && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Dynamic Singapore fleet telemetry, real countdowns, and load tracking. Ready out-of-the-box with no keys required.
                </p>
              </div>

              <div
                onClick={() => setConfig({ ...config, useCustomBackend: true })}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  config.useCustomBackend
                    ? 'bg-emerald-950/30 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Database className={`w-4 h-4 ${config.useCustomBackend ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-sm font-semibold text-white">Connect Custom Backend</span>
                  </div>
                  {config.useCustomBackend && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">
                  Relay requests directly to your Node/Express, Python, or Cloud Run backend proxying LTA DataMall.
                </p>
              </div>
            </div>
          </div>

          {/* Custom Backend Inputs */}
          {config.useCustomBackend && (
            <div className="space-y-4 p-4 bg-slate-950/70 border border-slate-800 rounded-2xl animate-fade-in">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5">
                  Backend Base URL
                </label>
                <input
                  type="text"
                  value={config.backendBaseUrl}
                  onChange={(e) => setConfig({ ...config, backendBaseUrl: e.target.value })}
                  placeholder="e.g. /api/lta or http://localhost:5000/api"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  The frontend will request <code className="text-emerald-400 font-mono">/BusArrivalv2?BusStopCode=...</code>
                </span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>LTA DataMall AccountKey (Optional)</span>
                  <a
                    href="https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>Request LTA Key</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="password"
                    value={config.ltaAccountKey}
                    onChange={(e) => setConfig({ ...config, ltaAccountKey: e.target.value })}
                    placeholder="Enter AccountKey to pass in request headers"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60 font-mono"
                  />
                </div>
              </div>

              {/* Test Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={testingStatus === 'testing'}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {testingStatus === 'testing' ? 'Testing Connection...' : 'Test Backend Connection'}
                </button>

                {testingStatus === 'success' && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{testMessage}</span>
                  </div>
                )}

                {testingStatus === 'error' && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    <span>{testMessage}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Backend Implementation Guide */}
          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <span>Backend Implementation Blueprint</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              When ready, implement a simple Express proxy route in your backend to relay requests to LTA DataMall and bypass CORS:
            </p>
            <pre className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed">
{`app.get('/api/lta/BusArrivalv2', async (req, res) => {
  const { BusStopCode } = req.query;
  const ltaRes = await fetch(
    \`https://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=\${BusStopCode}\`,
    { headers: { AccountKey: process.env.LTA_ACCOUNT_KEY } }
  );
  const data = await ltaRes.json();
  res.json(data);
});`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">Settings saved locally in browser</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
