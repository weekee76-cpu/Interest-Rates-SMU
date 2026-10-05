import React, { useState } from 'react';
import { Terminal, Copy, Check, ExternalLink, Database, Activity, ShieldAlert, Key } from 'lucide-react';

export const MasApiSpecView: React.FC = () => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [testEndpoint, setTestEndpoint] = useState<'health' | 'sora'>('health');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'warning' | 'error'>('idle');
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleTestEndpoint = async (endpoint: 'health' | 'sora') => {
    setTestEndpoint(endpoint);
    setTestStatus('testing');
    setTestResponse(null);

    try {
      const res = await fetch(`/api/${endpoint}`);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));

      if (res.ok) {
        if (endpoint === 'health') {
          setTestStatus('success');
        } else {
          // If sora, check if key is configured
          setTestStatus(data.keyConfigured ? 'success' : 'warning');
        }
      } else {
        setTestStatus('error');
      }
    } catch (err: any) {
      setTestStatus('error');
      setTestResponse(JSON.stringify({ error: err.message || 'Connection failed' }, null, 2));
    }
  };

  const soraServerlessSnippet = `// /api/sora.ts (Serverless handler at project root level)
const MAS_ENDPOINT_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

export default async function handler(req: any, res?: any) {
  // Read KeyId dynamically from environment variable (never hardcoded)
  const masKeyId = process.env.MAS_KEY_ID || process.env.MAS_API_KEY || '';

  if (!masKeyId) {
    return res.status(200).json({
      success: false,
      keyConfigured: false,
      message: 'MAS_KEY_ID is not configured in environment variables.'
    });
  }

  // Request to MAS Gateway with required KeyId header
  const response = await fetch(MAS_ENDPOINT_URL, {
    method: 'GET',
    headers: {
      'KeyId': masKeyId,
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  return res.status(200).json({ success: true, data });
}`;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              MAS Serverless Connection & Endpoints
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live serverless functions located in <code className="text-slate-800 font-mono font-semibold">/api</code> at project root level
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTestEndpoint('health')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-600" />
              <span>Test /api/health</span>
            </button>
            <button
              type="button"
              onClick={() => handleTestEndpoint('sora')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-blue-400" />
              <span>Test /api/sora</span>
            </button>
          </div>
        </div>

        {/* Live Test Diagnostic Output */}
        {testStatus !== 'idle' && (
          <div className="mt-4 space-y-2">
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
              testStatus === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : testStatus === 'testing'
                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                : testStatus === 'warning'
                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              <div className="flex items-center gap-2">
                {testStatus === 'warning' && <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />}
                <span>
                  {testStatus === 'testing' && `Calling /api/${testEndpoint}...`}
                  {testStatus === 'success' && `/api/${testEndpoint} responded successfully with HTTP 200.`}
                  {testStatus === 'warning' && `/api/sora handler executed. MAS_KEY_ID is currently unconfigured, so fallback rates are safely returned.`}
                  {testStatus === 'error' && `Error reaching /api/${testEndpoint}.`}
                </span>
              </div>
            </div>

            {testResponse && (
              <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-48">
                <pre>{testResponse}</pre>
              </div>
            )}
          </div>
        )}

        {/* Serverless Files Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 font-mono">
                /api/health.ts
              </span>
              <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Health Check
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Verifies serverless availability, uptime timestamp, and detects if <code className="font-mono text-slate-800">MAS_KEY_ID</code> is present in environment variables.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 font-mono">
                /api/sora.ts
              </span>
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                MAS Gateway Client
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Pulls daily SORA and compounded 1M/3M/6M averages from the MAS gateway, supplying the required <code className="font-mono text-slate-800">KeyId</code> header. Includes 15-minute response caching.
            </p>
          </div>
        </div>

        {/* Gateway Specification */}
        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Target MAS Gateway Endpoint
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              <span>Header: KeyId: &lt;MAS_KEY_ID&gt;</span>
            </div>
          </div>
          <div className="text-xs text-slate-700 font-mono bg-white p-2.5 rounded border border-slate-200 break-all select-all">
            https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
          </div>
          <p className="text-[11px] text-slate-500">
            No API keys are hardcoded. Set <code className="font-mono text-slate-700">MAS_KEY_ID="your_key_here"</code> in your serverless deployment environment (e.g. Vercel, Netlify, Cloud Run, or .env).
          </p>
        </div>
      </div>

      {/* Code Snippet: Serverless Handler */}
      <div className="bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-xs border border-slate-800">
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Implementation Preview: /api/sora.ts</span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(soraServerlessSnippet, 'serverless-code')}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            {copiedCode === 'serverless-code' ? (
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
          <pre>{soraServerlessSnippet}</pre>
        </div>
      </div>
    </div>
  );
};

