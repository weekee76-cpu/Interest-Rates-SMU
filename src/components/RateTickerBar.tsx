import React from 'react';
import { SoraSummaryRates } from '../types/sora';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface RateTickerBarProps {
  rates: SoraSummaryRates;
  selectedBenchmark: string;
  onQuickSelectBenchmark?: (benchmark: '1M_SORA' | '3M_SORA' | '6M_SORA' | 'OVERNIGHT_SORA') => void;
}

export const RateTickerBar: React.FC<RateTickerBarProps> = ({
  rates,
  selectedBenchmark,
  onQuickSelectBenchmark
}) => {
  const renderDelta = (delta: number) => {
    if (delta > 0) {
      return (
        <span className="inline-flex items-center text-rose-600 font-mono text-xs tabular-nums font-medium">
          <ArrowUpRight className="w-3 h-3 mr-0.5" />
          +{delta.toFixed(4)}%
        </span>
      );
    }
    if (delta < 0) {
      return (
        <span className="inline-flex items-center text-emerald-600 font-mono text-xs tabular-nums font-medium">
          <ArrowDownRight className="w-3 h-3 mr-0.5" />
          {delta.toFixed(4)}%
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-slate-400 font-mono text-xs tabular-nums">
        <Minus className="w-3 h-3 mr-0.5" />
        0.0000%
      </span>
    );
  };

  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Top metadata line with unboxed separators */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mb-2 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Monetary Authority of Singapore (MAS) Benchmark</span>
            <span aria-hidden="true">·</span>
            <span>Published daily at 09:00 SGT</span>
            <span aria-hidden="true">·</span>
            <span>Reference Date: {rates.lastUpdated}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <span>SORA Index:</span>
            <span className="font-mono text-slate-700 font-semibold tabular-nums">{rates.soraIndex.toFixed(6)}</span>
          </div>
        </div>

        {/* High density rate metric strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Overnight SORA */}
          <button
            type="button"
            onClick={() => onQuickSelectBenchmark?.('OVERNIGHT_SORA')}
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
              selectedBenchmark === 'OVERNIGHT_SORA'
                ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">Overnight SORA</span>
              {renderDelta(rates.changeOvernight)}
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
              {rates.overnightSora.toFixed(4)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Spot volume-weighted rate</p>
          </button>

          {/* 1-Month Compounded SORA */}
          <button
            type="button"
            onClick={() => onQuickSelectBenchmark?.('1M_SORA')}
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
              selectedBenchmark === '1M_SORA'
                ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">1-Month Compounded</span>
              <span className="text-xs text-slate-400 font-mono">30D</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
              {rates.compounded1M.toFixed(4)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Monthly reset benchmark</p>
          </button>

          {/* 3-Month Compounded SORA (Most common in Singapore home loans) */}
          <button
            type="button"
            onClick={() => onQuickSelectBenchmark?.('3M_SORA')}
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer relative ${
              selectedBenchmark === '3M_SORA'
                ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-700 font-semibold">3-Month Compounded</span>
              {renderDelta(rates.change3M)}
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
              {rates.compounded3M.toFixed(4)}%
            </div>
            <div className="flex items-center justify-between mt-0.5 text-[11px]">
              <span className="text-slate-500">Most common mortgage base</span>
              <span className="text-blue-600 font-medium text-[10px]">Standard</span>
            </div>
          </button>

          {/* 6-Month Compounded SORA */}
          <button
            type="button"
            onClick={() => onQuickSelectBenchmark?.('6M_SORA')}
            className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
              selectedBenchmark === '6M_SORA'
                ? 'border-slate-900 bg-slate-50/80 shadow-xs ring-1 ring-slate-900/10'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">6-Month Compounded</span>
              <span className="text-xs text-slate-400 font-mono">180D</span>
            </div>
            <div className="mt-1 text-xl font-bold font-mono text-slate-900 tabular-nums tracking-tight">
              {rates.compounded6M.toFixed(4)}%
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Semi-annual reset index</p>
          </button>
        </div>
      </div>
    </div>
  );
};
