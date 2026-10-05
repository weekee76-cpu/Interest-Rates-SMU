import React, { useState, useMemo } from 'react';
import { calculateExactMasCompounding } from '../services/masSoraService';
import { Check, ArrowRight } from 'lucide-react';

interface MasCompoundingEngineViewProps {
  onApplyCalculatedRate: (rate: number) => void;
}

export const MasCompoundingEngineView: React.FC<MasCompoundingEngineViewProps> = ({
  onApplyCalculatedRate
}) => {
  // Preset default to recent 90-day window
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-10-01');
  const [appliedNotification, setAppliedNotification] = useState(false);

  const compoundingResult = useMemo(() => {
    return calculateExactMasCompounding(startDate, endDate);
  }, [startDate, endDate]);

  const handleApply = () => {
    onApplyCalculatedRate(compoundingResult.dailyCompoundedRate);
    setAppliedNotification(true);
    setTimeout(() => setAppliedNotification(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Overview & MAS Methodology Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              MAS Compounded SORA Calculation Engine
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Official Monetary Authority of Singapore Actual/365 overnight compounding convention
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              {appliedNotification ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Applied to Calculator!</span>
                </>
              ) : (
                <>
                  <span>Apply {compoundingResult.dailyCompoundedRate}% to Calculator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Selector Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Quick Presets */}
          <div className="sm:col-span-2 flex flex-col justify-end">
            <span className="text-[11px] text-slate-500 mb-1">Standard Tenors:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStartDate('2026-09-01');
                  setEndDate('2026-10-01');
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                1-Month Window (30D)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate('2026-07-01');
                  setEndDate('2026-10-01');
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                3-Month Window (92D)
              </button>
              <button
                type="button"
                onClick={() => {
                  setStartDate('2026-04-01');
                  setEndDate('2026-10-01');
                }}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded hover:bg-slate-50 text-slate-700 cursor-pointer"
              >
                6-Month Window (183D)
              </button>
            </div>
          </div>
        </div>

        {/* Formula & Result Visual Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-slate-900 text-white rounded-xl">
            <span className="text-xs text-slate-400 uppercase tracking-wider">
              Exact Daily Compounded SORA
            </span>
            <div className="mt-1 font-mono text-3xl font-extrabold text-emerald-400 tabular-nums">
              {compoundingResult.dailyCompoundedRate.toFixed(4)}% p.a.
            </div>
            <div className="text-[11px] text-slate-300 mt-1">
              Across {compoundingResult.totalDays} calendar days ({compoundingResult.businessDaysCount} business days)
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              SORA Index Verification
            </span>
            <div className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
              {compoundingResult.indexCompoundedRate?.toFixed(4) || '—'}% p.a.
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Start Index: {compoundingResult.startIndex?.toFixed(6) || '—'} · End Index:{' '}
              {compoundingResult.endIndex?.toFixed(6) || '—'}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500 uppercase tracking-wider">
              Formula Convention
            </span>
            <div className="mt-2 text-xs font-mono bg-white p-2 border border-slate-200 rounded text-slate-800 leading-relaxed overflow-x-auto">
              [ ∏ (1 + r_i · n_i / 36500) - 1 ] × (365 / d) × 100
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              Actual/365 Singapore money market standard
            </div>
          </div>
        </div>
      </div>

      {/* Day by Day Step Execution Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              MAS Business Day Compounding Audit Trail
            </h3>
            <p className="text-xs text-slate-500">
              Showing rate r_i, weekend weighting n_i, and factor per business day published by MAS
            </p>
          </div>
          <span className="font-mono text-xs text-slate-500">
            {compoundingResult.steps.length} published records
          </span>
        </div>

        <div className="overflow-x-auto max-h-[460px]">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-2.5 px-4">Publication Date</th>
                <th className="py-2.5 px-4">Day</th>
                <th className="py-2.5 px-4 text-right">MAS Overnight Rate (r_i)</th>
                <th className="py-2.5 px-4 text-right">Weight (n_i)</th>
                <th className="py-2.5 px-4 text-right">Compounding Factor</th>
                <th className="py-2.5 px-4 text-right">Cumulative Product</th>
                <th className="py-2.5 px-4 text-right">Running Compounded Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {compoundingResult.steps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    No business days found in this range. Select dates between 2026-04-01 and 2026-10-02.
                  </td>
                </tr>
              ) : (
                compoundingResult.steps.map((step) => (
                  <tr key={step.date} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-4 font-sans font-medium text-slate-900">
                      {step.date}
                    </td>
                    <td className="py-2 px-4 font-sans text-slate-500">
                      {step.dayOfWeek}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-900 font-semibold tabular-nums">
                      {step.soraRate.toFixed(4)}%
                    </td>
                    <td className="py-2 px-4 text-right text-slate-600 tabular-nums">
                      {step.dayWeight} {step.dayWeight > 1 ? '(Fri+Weekend)' : ''}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-500 tabular-nums">
                      {step.factor.toFixed(8)}
                    </td>
                    <td className="py-2 px-4 text-right text-slate-600 tabular-nums">
                      {step.runningProduct.toFixed(8)}
                    </td>
                    <td className="py-2 px-4 text-right text-emerald-700 font-semibold tabular-nums">
                      {step.runningCompoundedAnnualRate.toFixed(4)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
