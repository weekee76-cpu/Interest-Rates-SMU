import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Database } from 'lucide-react';

export const MasApiSpecView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fallback'>('idle');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestBackend = async () => {
    setTestStatus('testing');
    try {
      // Test if /api/sora/latest exists on server
      const res = await fetch('/api/sora/latest');
      if (res.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('fallback');
      }
    } catch {
      setTestStatus('fallback');
    }
  };

  const sampleExpressBackend = `// server.js or src/server.ts (Node/Express backend)
import express from 'express';

const app = express();
const MAS_SORA_RESOURCE = '9a0bf149-3083-461a-aec4-8b652f800e3c';
const MAS_API_URL = 'https://eservices.mas.gov.sg/api/action/datastore/search.json';

// In-memory cache for 1 hour to prevent MAS API rate throttling
let cache = { data: null, lastFetched: 0 };

app.get('/api/sora/latest', async (req, res) => {
  const now = Date.now();
  if (cache.data && now - cache.lastFetched < 3600000) {
    return res.json(cache.data);
  }

  try {
    const response = await fetch(
      \`\${MAS_API_URL}?resource_id=\${MAS_SORA_RESOURCE}&limit=10&sort=end_of_day%20desc\`
    );
    const result = await response.json();
    const records = result.result.records;

    const payload = {
      lastUpdated: records[0].end_of_day,
      overnightSora: parseFloat(records[0].sora),
      compounded1M: parseFloat(records[0].sora_1m),
      compounded3M: parseFloat(records[0].sora_3m),
      compounded6M: parseFloat(records[0].sora_6m),
      soraIndex: parseFloat(records[0].sora_index),
      volumeSgdMillion: parseFloat(records[0].volume_of_sora) || 0
    };

    cache = { data: payload, lastFetched: now };
    res.json(payload);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MAS rates', details: err.message });
  }
});`;

  const sampleJsonContract = `{
  "lastUpdated": "2026-10-02",
  "overnightSora": 2.9240,
  "compounded1M": 2.8850,
  "compounded3M": 2.9520,
  "compounded6M": 3.0180,
  "soraIndex": 1.096842,
  "volumeSgdMillion": 4350
}`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              MAS Backend Integration Guide & API Contract
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ready-to-deploy specifications for connecting your backend service to official MAS datasets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestBackend}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Test /api/sora Endpoint</span>
            </button>
          </div>
        </div>

        {testStatus !== 'idle' && (
          <div className={`mt-4 p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
            testStatus === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : testStatus === 'testing'
              ? 'bg-blue-50 text-blue-800 border border-blue-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}>
            <span>
              {testStatus === 'testing' && 'Probing /api/sora/latest backend route...'}
              {testStatus === 'success' && 'Backend route /api/sora/latest is responding with live data!'}
              {testStatus === 'fallback' && 'Backend route /api/sora/latest not yet connected. Frontend is using client-side high-fidelity MAS dataset.'}
            </span>
          </div>
        )}

        {/* MAS API Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Official MAS Open Data Endpoint
              </span>
              <a
                href="https://eservices.mas.gov.sg/api/action/datastore/search.json?resource_id=9a0bf149-3083-461a-aec4-8b652f800e3c"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                MAS DataStore <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="text-xs text-slate-600 font-mono bg-white p-2.5 rounded border border-slate-200 break-all select-all">
              resource_id: 9a0bf149-3083-461a-aec4-8b652f800e3c
            </div>
            <p className="text-[11px] text-slate-500">
              MAS publishes new daily overnight rates and compounded benchmarks every Singapore business day by 09:00 SGT.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Frontend Client Switch
            </span>
            <p className="text-xs text-slate-600">
              In <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-900 font-mono">src/services/masSoraService.ts</code>, simply adjust the fetch call to your backend proxy once ready.
            </p>
            <div className="text-[11px] text-slate-500">
              Zero code changes needed in the calculator logic; the calculation engine immediately calculates interest and amortization based on the latest rates.
            </div>
          </div>
        </div>
      </div>

      {/* Code Snippet: Express/Node Proxy Implementation */}
      <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-xs border border-slate-800">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Sample Express/Node Backend Proxy (server.ts)</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(sampleExpressBackend, 'backend-code')}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copiedCode === 'backend-code' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
        <div className="p-4 overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed">
          <pre>{sampleExpressBackend}</pre>
        </div>
      </div>

      {/* Code Snippet: Expected JSON Payload */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Expected JSON Payload from /api/sora/latest
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(sampleJsonContract, 'json-code')}
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            {copiedCode === 'json-code' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
        <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs font-mono text-slate-800 overflow-x-auto">
          <pre>{sampleJsonContract}</pre>
        </div>
      </div>
    </div>
  );
};
