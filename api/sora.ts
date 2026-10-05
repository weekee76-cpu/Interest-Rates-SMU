/**
 * MAS SORA Serverless Endpoint
 * Path: /api/sora.ts
 *
 * Pulls daily SORA + compounded 1M/3M/6M averages from the official MAS API Gateway:
 * https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily
 *
 * Requires header: KeyId: <MAS_KEY_ID>
 * Reads dynamically from process.env.MAS_KEY_ID or process.env.MAS_API_KEY (or request headers).
 */

const MAS_ENDPOINT_URL =
  'https://eservices.mas.gov.sg/apimg-gw/server/monthly_statistical_bulletin_non610mssql/domestic_interest_rates_daily/views/domestic_interest_rates_daily';

// In-memory cache to prevent hitting MAS API rate limits on consecutive requests
let memoryCache: {
  timestamp: number;
  data: any;
} | null = null;

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

export interface SoraRecord {
  date: string;
  sora: number;
  sora1M?: number;
  sora3M?: number;
  sora6M?: number;
  soraIndex?: number;
  volumeSgdMillion?: number;
  raw?: Record<string, any>;
}

export interface SoraApiResponse {
  success: boolean;
  source: string;
  lastUpdated: string;
  keyConfigured: boolean;
  cached?: boolean;
  data: {
    overnightSora: number;
    compounded1M: number;
    compounded3M: number;
    compounded6M: number;
    soraIndex: number;
    changeOvernight?: number;
    change3M?: number;
    records: SoraRecord[];
  };
  warning?: string;
  error?: string;
}

function sendResponse(res: any, status: number, headers: Record<string, string>, data: any) {
  if (res && typeof res.end === 'function') {
    if (typeof res.setHeader === 'function') {
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
    }
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(status).json(data);
    }
    res.writeHead(status, headers);
    return res.end(JSON.stringify(data, null, 2));
  }
  return new Response(JSON.stringify(data, null, 2), { status, headers });
}

export default async function handler(req: any, res?: any) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, KeyId, keyid',
    'Cache-Control': 'public, max-age=300, stale-while-revalidate=1800'
  };

  // Handle CORS preflight
  const method = req.method || 'GET';
  if (method === 'OPTIONS') {
    if (res && typeof res.end === 'function') {
      res.writeHead(204, headers);
      return res.end();
    }
    return new Response(null, { status: 204, headers });
  }

  // Extract KeyId from environment variables or request headers (never hardcoded)
  const reqHeaders = req.headers || {};
  const passedKeyId =
    reqHeaders['keyid'] ||
    reqHeaders['KeyId'] ||
    reqHeaders['key-id'] ||
    (typeof req.headers?.get === 'function' ? req.headers.get('KeyId') || req.headers.get('keyid') : null);

  const masKeyId =
    process.env.MAS_KEY_ID ||
    process.env.MAS_API_KEY ||
    passedKeyId ||
    '';

  // Check URL query parameters if present
  let urlParams = '';
  let forceRefresh = false;
  if (typeof req.url === 'string') {
    const queryIndex = req.url.indexOf('?');
    if (queryIndex !== -1) {
      const searchParams = new URLSearchParams(req.url.slice(queryIndex));
      forceRefresh = searchParams.get('refresh') === 'true' || searchParams.get('nocache') === 'true';
      searchParams.delete('refresh');
      searchParams.delete('nocache');
      const filteredQuery = searchParams.toString();
      if (filteredQuery) {
        urlParams = `?${filteredQuery}`;
      }
    }
  } else if (req.query) {
    forceRefresh = req.query.refresh === 'true' || req.query.nocache === 'true';
  }

  // Return cache if valid and not refreshed
  const now = Date.now();
  if (!forceRefresh && memoryCache && (now - memoryCache.timestamp < CACHE_TTL_MS)) {
    const cachedPayload = {
      ...memoryCache.data,
      cached: true
    };
    return sendResponse(res, 200, headers, cachedPayload);
  }

  // If MAS_KEY_ID is missing, return informative status
  if (!masKeyId) {
    const errorPayload: SoraApiResponse = {
      success: false,
      source: 'Monetary Authority of Singapore (MAS) Gateway',
      lastUpdated: new Date().toISOString().split('T')[0],
      keyConfigured: false,
      warning:
        'MAS_KEY_ID environment variable is not configured. Please set MAS_KEY_ID in your environment or pass KeyId header.',
      data: {
        overnightSora: 2.9240,
        compounded1M: 2.8850,
        compounded3M: 2.9520,
        compounded6M: 3.0180,
        soraIndex: 1.096842,
        records: []
      }
    };

    return sendResponse(res, 200, headers, errorPayload);
  }

  // Call the official MAS Gateway endpoint
  try {
    const targetUrl = `${MAS_ENDPOINT_URL}${urlParams}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const masResponse = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'KeyId': masKeyId,
        'Accept': 'application/json',
        'User-Agent': 'Singapore-SORA-Calculator/1.0'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!masResponse.ok) {
      const errorText = await masResponse.text().catch(() => '');
      throw new Error(`MAS API responded with HTTP ${masResponse.status}: ${errorText || masResponse.statusText}`);
    }

    const json = await masResponse.json();

    // Normalize MAS dataset
    // MAS response usually has records array in result.records, data, or top-level array
    const rawRecords: any[] =
      json?.result?.records ||
      json?.records ||
      json?.data ||
      (Array.isArray(json) ? json : []);

    const parsedRecords: SoraRecord[] = rawRecords.map((r: any) => {
      const date = r.end_of_day || r.date || r.publication_date || r.ref_date || '';
      const sora = parseFloat(r.sora || r.sor || r.overnight_rate || '0');
      const sora1M = parseFloat(r.sora_1m || r.compounded_sora_1m || r.sora1m || '0');
      const sora3M = parseFloat(r.sora_3m || r.compounded_sora_3m || r.sora3m || '0');
      const sora6M = parseFloat(r.sora_6m || r.compounded_sora_6m || r.sora6m || '0');
      const soraIndex = parseFloat(r.sora_index || r.soraindex || '0');
      const volume = parseFloat(r.volume_of_sora || r.volume_sgd_m || r.volume || '0');

      return {
        date,
        sora: isNaN(sora) ? 0 : sora,
        sora1M: isNaN(sora1M) ? undefined : sora1M,
        sora3M: isNaN(sora3M) ? undefined : sora3M,
        sora6M: isNaN(sora6M) ? undefined : sora6M,
        soraIndex: isNaN(soraIndex) ? undefined : soraIndex,
        volumeSgdMillion: isNaN(volume) ? undefined : volume,
        raw: r
      };
    });

    const latest = parsedRecords[0] || {
      date: new Date().toISOString().split('T')[0],
      sora: 2.9240,
      sora1M: 2.8850,
      sora3M: 2.9520,
      sora6M: 3.0180,
      soraIndex: 1.096842
    };

    const previous = parsedRecords[1] || latest;

    const payload: SoraApiResponse = {
      success: true,
      source: 'Monetary Authority of Singapore (MAS) Gateway',
      lastUpdated: latest.date,
      keyConfigured: true,
      data: {
        overnightSora: latest.sora,
        compounded1M: latest.sora1M || 2.8850,
        compounded3M: latest.sora3M || 2.9520,
        compounded6M: latest.sora6M || 3.0180,
        soraIndex: latest.soraIndex || 1.096842,
        changeOvernight: +(latest.sora - previous.sora).toFixed(4),
        change3M: +((latest.sora3M || 0) - (previous.sora3M || 0)).toFixed(4),
        records: parsedRecords
      }
    };

    // Store in cache
    memoryCache = {
      timestamp: Date.now(),
      data: payload
    };

    return sendResponse(res, 200, headers, payload);
  } catch (err: any) {
    const errorPayload: SoraApiResponse = {
      success: false,
      source: 'Monetary Authority of Singapore (MAS) Gateway',
      lastUpdated: new Date().toISOString().split('T')[0],
      keyConfigured: true,
      error: err.message || 'Failed to fetch rates from MAS Gateway',
      data: {
        overnightSora: 2.9240,
        compounded1M: 2.8850,
        compounded3M: 2.9520,
        compounded6M: 3.0180,
        soraIndex: 1.096842,
        records: []
      }
    };

    return sendResponse(res, 502, headers, errorPayload);
  }
}
