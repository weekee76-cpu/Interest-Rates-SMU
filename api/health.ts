/**
 * Health Check Serverless Endpoint
 * Path: /api/health.ts
 */

export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
  masKeyConfigured: boolean;
  version: string;
}

export default async function handler(req: any, res?: any) {
  // CORS support
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, KeyId',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  };

  // Handle OPTIONS preflight
  const method = req.method || (req.headers ? 'GET' : 'GET');
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.writeHead(204, headers);
      return res.end();
    }
    return new Response(null, { status: 204, headers });
  }

  const isMasKeyConfigured = Boolean(
    process.env.MAS_KEY_ID || process.env.MAS_API_KEY
  );

  const payload: HealthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'singapore-sora-calculator-api',
    masKeyConfigured: isMasKeyConfigured,
    version: '1.0.0'
  };

  // Node.js (raw http.ServerResponse, Express, Connect, Vite) & Vercel Serverless
  if (res && typeof res.end === 'function') {
    if (typeof res.setHeader === 'function') {
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    }
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(200).json(payload);
    }
    res.writeHead(200, headers);
    return res.end(JSON.stringify(payload, null, 2));
  }

  // Web Standard Fetch API style (Next.js App Router / Edge / Cloudflare Workers)
  return new Response(JSON.stringify(payload, null, 2), {
    status: 200,
    headers
  });
}
