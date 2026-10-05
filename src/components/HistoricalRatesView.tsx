import React, { useState, useMemo } from 'react';
import { getHistoricalSoraRates } from '../services/masSoraService';
import { Download, Search } from 'lucide-react';

export const HistoricalRatesView: React.FC = () => {
  const allHistorical = useMemo(() => getHistoricalSoraRates(120), []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOvernight, setShowOvernight] = useState(true);
  const [show1M, setShow1M] = useState(true);
  const [show3M, setShow3M] = useState(true);
  const [show6M, setShow6M] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Chronological order for chart
  const chartData = useMemo(() => {
    return [...allHistorical].reverse();
  }, [allHistorical]);

  // Filtered rows for table
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return allHistorical;
    return allHistorical.filter(r => r.date.includes(searchQuery));
  }, [allHistorical, searchQuery]);

  // Statistics calculation
  const stats = useMemo(() => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0, stdDev: 0 };
    const rates = chartData.map(d => d.soraRate);
    const sum = rates.reduce((acc, r) => acc + r, 0);
    const avg = sum / rates.length;
    const min = Math.min(...rates);
    const max = Math.max(...rates);
    const variance = rates.reduce((acc, r) => acc + Math.pow(r - avg, 2), 0) / rates.length;
    return {
      avg: +avg.toFixed(4),
      min: +min.toFixed(4),
      max: +max.toFixed(4),
      stdDev: +Math.sqrt(variance).toFixed(4)
    };
  }, [chartData]);

  // Export historical CSV
  const handleExportHistoricalCSV = () => {
    const headers = ['Date', 'Day Weight', 'Overnight SORA (%)', '1M Compounded (%)', '3M Compounded (%)', '6M Compounded (%)', 'SORA Index', 'Volume (SGD M)'];
    const rows = allHistorical.map(r => [
      r.date,
      r.dayWeight,
      r.soraRate,
      r.rate1MCompounded || '',
      r.rate3MCompounded || '',
      r.rate6MCompounded || '',
      r.soraIndex,
      r.volumeSgdMillion || ''
    ]);

    const csv = ['# MAS SORA Historical Benchmark Rates', headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MAS_SORA_Historical_Rates_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // SVG Chart bounds
  const minRate = Math.min(2.5, stats.min - 0.1);
  const maxRate = Math.max(3.3, stats.max + 0.1);
  const rateRange = maxRate - minRate;

  const getY = (val: number) => {
    return 180 - ((val - minRate) / rateRange) * 150;
  };

  const getPoints = (accessor: (d: typeof chartData[0]) => number | undefined) => {
    return chartData.map((d, i) => {
      const x = 50 + (i / Math.max(1, chartData.length - 1)) * 520;
      const val = accessor(d) || stats.avg;
      const y = getY(val);
      return `${x},${y}`;
    }).join(' ');
  };

  const hoveredData = hoveredIndex !== null ? chartData[hoveredIndex] : null;

  return (
    <div className="space-y-6">
      {/* Header & KPI Summary */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              MAS SORA Historical Rates & Trend Analysis
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracks the volume-weighted average rate of unsecured overnight interbank SGD funds
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportHistoricalCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Rate Dataset</span>
          </button>
        </div>

        {/* 4 Metric Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500">Period Average SORA</span>
            <div className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
              {stats.avg.toFixed(4)}%
            </div>
            <span className="text-[11px] text-slate-400">Mean across 120 days</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500">Minimum Recorded</span>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-600 tabular-nums">
              {stats.min.toFixed(4)}%
            </div>
            <span className="text-[11px] text-slate-400">Lowest overnight fixing</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500">Maximum Recorded</span>
            <div className="mt-1 font-mono text-xl font-bold text-rose-600 tabular-nums">
              {stats.max.toFixed(4)}%
            </div>
            <span className="text-[11px] text-slate-400">Highest overnight fixing</span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs text-slate-500">Rate Volatility (σ)</span>
            <div className="mt-1 font-mono text-xl font-bold text-slate-800 tabular-nums">
              ±{stats.stdDev.toFixed(4)}%
            </div>
            <span className="text-[11px] text-slate-400">Standard deviation</span>
          </div>
        </div>

        {/* Chart Series Toggle Controls */}
        <div className="flex flex-wrap items-center justify-between mt-6 pt-4 border-t border-slate-100 gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 font-medium">Display Series:</span>
            <button
              type="button"
              onClick={() => setShowOvernight(!showOvernight)}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                showOvernight
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <span>Overnight SORA</span>
            </button>
            <button
              type="button"
              onClick={() => setShow1M(!show1M)}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                show1M
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-300" />
              <span>1M Compounded</span>
            </button>
            <button
              type="button"
              onClick={() => setShow3M(!show3M)}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                show3M
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300" />
              <span>3M Compounded</span>
            </button>
            <button
              type="button"
              onClick={() => setShow6M(!show6M)}
              className={`px-2.5 py-1 rounded border transition-colors cursor-pointer flex items-center gap-1.5 ${
                show6M
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-slate-600 border-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300" />
              <span>6M Compounded</span>
            </button>
          </div>

          {hoveredData && (
            <div className="text-xs font-mono text-slate-800 bg-slate-100 px-3 py-1 rounded flex items-center gap-3">
              <span className="font-semibold">{hoveredData.date}</span>
              <span>Overnight: {hoveredData.soraRate.toFixed(4)}%</span>
              <span>3M: {hoveredData.rate3MCompounded?.toFixed(4)}%</span>
            </div>
          )}
        </div>

        {/* SVG Historical Chart */}
        <div className="h-64 w-full mt-4">
          <svg
            viewBox="0 0 600 200"
            className="w-full h-full overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Grid horizontal lines */}
            <line x1="45" y1="30" x2="580" y2="30" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="80" x2="580" y2="80" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="130" x2="580" y2="130" stroke="#f1f5f9" strokeWidth="1" />
            <line x1="45" y1="180" x2="580" y2="180" stroke="#e2e8f0" strokeWidth="1" />

            {/* Y axis text */}
            <text x="40" y="34" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
              {maxRate.toFixed(2)}%
            </text>
            <text x="40" y="105" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
              {((maxRate + minRate) / 2).toFixed(2)}%
            </text>
            <text x="40" y="184" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
              {minRate.toFixed(2)}%
            </text>

            {/* Line Series */}
            {showOvernight && (
              <polyline
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
                strokeDasharray="2,2"
                points={getPoints(d => d.soraRate)}
              />
            )}
            {show1M && (
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="2"
                points={getPoints(d => d.rate1MCompounded)}
              />
            )}
            {show3M && (
              <polyline
                fill="none"
                stroke="#d97706"
                strokeWidth="2.5"
                points={getPoints(d => d.rate3MCompounded)}
              />
            )}
            {show6M && (
              <polyline
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                points={getPoints(d => d.rate6MCompounded)}
              />
            )}

            {/* Hover column trigger bars */}
            {chartData.map((d, i) => {
              const x = 50 + (i / Math.max(1, chartData.length - 1)) * 520;
              return (
                <g key={d.date} onMouseEnter={() => setHoveredIndex(i)}>
                  <rect
                    x={x - 4}
                    y={20}
                    width={8}
                    height={160}
                    fill="transparent"
                    className="cursor-pointer hover:fill-slate-900/5"
                  />
                  {hoveredIndex === i && (
                    <line x1={x} y1={20} x2={x} y2={180} stroke="#0f172a" strokeWidth="1" strokeDasharray="2,2" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 font-mono px-8">
          <span>{chartData[0]?.date}</span>
          <span>{chartData[Math.round(chartData.length / 2)]?.date}</span>
          <span>{chartData[chartData.length - 1]?.date} (Latest MAS Release)</span>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              MAS Business Day Fixing Ledger
            </h3>
            <p className="text-xs text-slate-500">
              All published daily fixing values, weights, and interbank transaction volumes
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search date (e.g. 2026-09)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[420px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Overnight SORA</th>
                <th className="py-2.5 px-4 text-right">1M Compounded</th>
                <th className="py-2.5 px-4 text-right">3M Compounded</th>
                <th className="py-2.5 px-4 text-right">6M Compounded</th>
                <th className="py-2.5 px-4 text-right">SORA Index</th>
                <th className="py-2.5 px-4 text-right">Volume (SGD M)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredRows.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-4 font-sans font-medium text-slate-900">
                    {row.date}
                  </td>
                  <td className="py-2 px-4 text-right font-semibold text-slate-900 tabular-nums">
                    {row.soraRate.toFixed(4)}%
                  </td>
                  <td className="py-2 px-4 text-right text-blue-600 tabular-nums">
                    {row.rate1MCompounded?.toFixed(4)}%
                  </td>
                  <td className="py-2 px-4 text-right text-amber-700 font-semibold tabular-nums">
                    {row.rate3MCompounded?.toFixed(4)}%
                  </td>
                  <td className="py-2 px-4 text-right text-emerald-700 tabular-nums">
                    {row.rate6MCompounded?.toFixed(4)}%
                  </td>
                  <td className="py-2 px-4 text-right text-slate-600 tabular-nums">
                    {row.soraIndex.toFixed(6)}
                  </td>
                  <td className="py-2 px-4 text-right text-slate-500 tabular-nums">
                    {row.volumeSgdMillion ? `S$${row.volumeSgdMillion.toLocaleString()}M` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
