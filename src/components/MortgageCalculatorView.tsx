import React, { useState, useId } from 'react';
import {
  LoanInputState,
  LoanCalculationResult,
  SoraSummaryRates,
  SoraBenchmark,
  PropertyType
} from '../types/sora';
import { formatSGD, formatPercent } from '../utils/loanCalculations';
import { Info, HelpCircle } from 'lucide-react';

interface MortgageCalculatorViewProps {
  input: LoanInputState;
  onChangeInput: (updater: (prev: LoanInputState) => LoanInputState) => void;
  result: LoanCalculationResult;
  rates: SoraSummaryRates;
  onExportCsv: () => void;
  onNavigateToCompounding: () => void;
}

export const MortgageCalculatorView: React.FC<MortgageCalculatorViewProps> = ({
  input,
  onChangeInput,
  result,
  rates,
  onExportCsv,
  onNavigateToCompounding
}) => {
  const propertyTypeId = useId();
  const loanAmountId = useId();
  const loanTenureId = useId();
  const benchmarkId = useId();
  const bankSpreadId = useId();
  const incomeId = useId();
  const commitmentsId = useId();

  const [scheduleViewMode, setScheduleViewMode] = useState<'annual' | 'monthly'>('annual');
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredChartYear, setHoveredChartYear] = useState<number | null>(null);
  const rowsPerPage = 24;

  const quickLoanPresets = [
    { label: '500K', value: 500000 },
    { label: '800K', value: 800000 },
    { label: '1.2M', value: 1200000 },
    { label: '1.6M', value: 1600000 },
    { label: '2.5M', value: 2500000 }
  ];

  const quickSpreadPresets = [
    { label: '+0.60%', value: 0.60 },
    { label: '+0.68%', value: 0.68 },
    { label: '+0.75%', value: 0.75 },
    { label: '+0.85%', value: 0.85 }
  ];

  const maxTenure = input.propertyType === 'HDB' ? 30 : 35;

  // Pagination for monthly view
  const totalPages = Math.ceil(result.schedule.length / rowsPerPage);
  const displayedMonthlyRows = result.schedule.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="space-y-6">
      {/* 2-Column Responsive Layout: Inputs on left, Real-time Results on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Loan Parameters & Inputs (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">
              Loan & Benchmark Parameters
            </h2>
            <span className="text-xs text-slate-500">Singapore MAS Rates</span>
          </div>

          {/* Property Type Selector */}
          <div>
            <label htmlFor={propertyTypeId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Property Classification
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => onChangeInput(prev => ({
                  ...prev,
                  propertyType: 'HDB',
                  loanTenureYears: Math.min(prev.loanTenureYears, 30)
                }))}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  input.propertyType === 'HDB'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                HDB Flat
              </button>
              <button
                type="button"
                onClick={() => onChangeInput(prev => ({ ...prev, propertyType: 'PRIVATE' }))}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  input.propertyType === 'PRIVATE'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Private / Condo
              </button>
              <button
                type="button"
                onClick={() => onChangeInput(prev => ({ ...prev, propertyType: 'COMMERCIAL' }))}
                className={`py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  input.propertyType === 'COMMERCIAL'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Commercial
              </button>
            </div>
          </div>

          {/* Loan Amount Input with Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={loanAmountId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Loan Principal (SGD)
              </label>
              <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                {formatSGD(input.loanAmount)}
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm font-medium">
                S$
              </div>
              <input
                id={loanAmountId}
                type="number"
                min="50000"
                max="20000000"
                step="10000"
                value={input.loanAmount}
                onChange={(e) => {
                  const val = Math.max(10000, Number(e.target.value) || 0);
                  onChangeInput(prev => ({ ...prev, loanAmount: val }));
                }}
                className="w-full pl-9 pr-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent tabular-nums"
              />
            </div>
            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Presets:</span>
              {quickLoanPresets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChangeInput(prev => ({ ...prev, loanAmount: preset.value }))}
                  className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    input.loanAmount === preset.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Loan Tenure */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={loanTenureId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Loan Tenure
              </label>
              <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                {input.loanTenureYears} Years ({input.loanTenureYears * 12} Months)
              </span>
            </div>
            <input
              id={loanTenureId}
              type="range"
              min="5"
              max={maxTenure}
              step="1"
              value={input.loanTenureYears}
              onChange={(e) => {
                const val = Number(e.target.value);
                onChangeInput(prev => ({ ...prev, loanTenureYears: val }));
              }}
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
              <span>5 Years</span>
              <span>15 Years</span>
              <span>25 Years</span>
              <span>{maxTenure} Years {input.propertyType === 'HDB' && '(HDB Cap)'}</span>
            </div>
          </div>

          {/* SORA Benchmark Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={benchmarkId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                MAS SORA Benchmark
              </label>
              <button
                type="button"
                onClick={onNavigateToCompounding}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer inline-flex items-center gap-0.5"
              >
                Inspect Day Math
              </button>
            </div>
            <select
              id={benchmarkId}
              value={input.benchmark}
              onChange={(e) => {
                const val = e.target.value as SoraBenchmark;
                onChangeInput(prev => ({ ...prev, benchmark: val }));
              }}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white text-slate-900"
            >
              <option value="3M_SORA">
                3-Month Compounded SORA ({rates.compounded3M.toFixed(4)}% p.a.) - Standard SG Mortgage
              </option>
              <option value="1M_SORA">
                1-Month Compounded SORA ({rates.compounded1M.toFixed(4)}% p.a.) - Faster Reset
              </option>
              <option value="6M_SORA">
                6-Month Compounded SORA ({rates.compounded6M.toFixed(4)}% p.a.) - Semi-Annual
              </option>
              <option value="OVERNIGHT_SORA">
                Spot Overnight SORA ({rates.overnightSora.toFixed(4)}% p.a.) - Raw Daily
              </option>
              <option value="CUSTOM">
                Custom Benchmark Rate (Manual SORA Input)
              </option>
            </select>

            {/* Custom SORA Rate Input if CUSTOM selected */}
            {input.benchmark === 'CUSTOM' && (
              <div className="mt-2.5 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="block text-xs text-slate-600 mb-1">
                  Manual SORA Benchmark Rate (% p.a.)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    max="15"
                    value={input.customBenchmarkRate}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      onChangeInput(prev => ({ ...prev, customBenchmarkRate: val }));
                    }}
                    className="w-full px-3 py-1.5 text-sm font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 tabular-nums"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 text-xs">
                    %
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bank Spread / Margin */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor={bankSpreadId} className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Bank Spread / Margin (% p.a.)
              </label>
              <span className="font-mono text-xs font-semibold text-slate-900 tabular-nums">
                +{input.bankSpread.toFixed(2)}% p.a.
              </span>
            </div>
            <div className="relative">
              <input
                id={bankSpreadId}
                type="number"
                step="0.01"
                min="0.10"
                max="5.00"
                value={input.bankSpread}
                onChange={(e) => {
                  const val = Math.max(0, Number(e.target.value) || 0);
                  onChangeInput(prev => ({ ...prev, bankSpread: val }));
                }}
                className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent tabular-nums"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                % p.a.
              </div>
            </div>
            {/* Quick Spread Presets */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Common:</span>
              {quickSpreadPresets.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChangeInput(prev => ({ ...prev, bankSpread: preset.value }))}
                  className={`px-2 py-0.5 text-xs font-mono rounded border transition-colors cursor-pointer ${
                    input.bankSpread === preset.value
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total Rate Equation Summary Card */}
          <div className="p-3 bg-slate-900 text-white rounded-lg">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-1">
              Total Applicable Interest Rate
            </div>
            <div className="flex items-baseline justify-between">
              <div className="font-mono text-xs text-slate-300">
                <span>{result.soraRateUsed.toFixed(4)}% (SORA)</span>
                <span className="mx-1">+</span>
                <span>{input.bankSpread.toFixed(2)}% (Spread)</span>
              </div>
              <div className="font-mono text-xl font-bold text-emerald-400 tabular-nums">
                {result.totalRate.toFixed(4)}% p.a.
              </div>
            </div>
          </div>

          {/* MAS Regulatory TDSR / Affordability Section */}
          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                MAS TDSR Stress Assessment
              </div>
              <div className="group relative cursor-pointer">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <div className="hidden group-hover:block absolute right-0 bottom-full mb-1 w-64 p-2 bg-slate-900 text-white text-[11px] rounded shadow-lg z-50">
                  MAS mandates computing TDSR using a stress floor of 4.00% p.a. for residential loans. TDSR cannot exceed 55%.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={incomeId} className="block text-[11px] text-slate-500 mb-1">
                  Gross Monthly Income (SGD)
                </label>
                <div className="relative">
                  <input
                    id={incomeId}
                    type="number"
                    step="500"
                    min="1000"
                    value={input.borrowerMonthlyIncome}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      onChangeInput(prev => ({ ...prev, borrowerMonthlyIncome: val }));
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 tabular-nums"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={commitmentsId} className="block text-[11px] text-slate-500 mb-1">
                  Other Monthly Debts (SGD)
                </label>
                <div className="relative">
                  <input
                    id={commitmentsId}
                    type="number"
                    step="100"
                    min="0"
                    value={input.otherMonthlyCommitments}
                    onChange={(e) => {
                      const val = Math.max(0, Number(e.target.value) || 0);
                      onChangeInput(prev => ({ ...prev, otherMonthlyCommitments: val }));
                    }}
                    className="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 tabular-nums"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key Repayment Metrics, Stress Tests & Visualizations (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Primary Result Headline Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Estimated Monthly Installment
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight tabular-nums">
                    {formatSGD(result.monthlyPayment, true)}
                  </span>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-500">Total Effective Interest</span>
                <div className="font-mono text-base font-bold text-slate-800 tabular-nums">
                  {formatPercent(result.totalRate, 4)} p.a.
                </div>
              </div>
            </div>

            {/* 3 Secondary Metric Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div>
                <span className="text-xs text-slate-500">Total Interest Payable</span>
                <div className="font-mono text-base font-bold text-slate-900 tabular-nums mt-0.5">
                  {formatSGD(result.totalInterest)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Over {input.loanTenureYears} years tenure
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500">Total Principal + Interest</span>
                <div className="font-mono text-base font-bold text-slate-900 tabular-nums mt-0.5">
                  {formatSGD(result.totalPayment)}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Principal: {formatSGD(input.loanAmount)}
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500">Interest Split (SORA vs Spread)</span>
                <div className="font-mono text-xs font-semibold text-slate-800 tabular-nums mt-1">
                  SORA: {formatSGD(result.soraInterestShare)}
                </div>
                <div className="font-mono text-xs text-slate-600 tabular-nums">
                  Bank: {formatSGD(result.bankSpreadInterestShare)}
                </div>
              </div>
            </div>

            {/* Visual Interest vs Principal Progress Bar */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-medium">
                <span>Principal ({((input.loanAmount / result.totalPayment) * 100).toFixed(1)}%)</span>
                <span>Interest ({((result.totalInterest / result.totalPayment) * 100).toFixed(1)}%)</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-slate-900 h-full"
                  style={{ width: `${(input.loanAmount / result.totalPayment) * 100}%` }}
                  title={`Principal: ${formatSGD(input.loanAmount)}`}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(result.soraInterestShare / result.totalPayment) * 100}%` }}
                  title={`SORA Base Interest: ${formatSGD(result.soraInterestShare)}`}
                />
                <div
                  className="bg-blue-600 h-full"
                  style={{ width: `${(result.bankSpreadInterestShare / result.totalPayment) * 100}%` }}
                  title={`Bank Margin: ${formatSGD(result.bankSpreadInterestShare)}`}
                />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-900" />
                  <span>Principal</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500" />
                  <span>SORA Component ({result.soraRateUsed.toFixed(2)}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
                  <span>Bank Margin (+{input.bankSpread.toFixed(2)}%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* MAS Regulatory TDSR & Stress Test Panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900">
                  MAS Stress Testing & TDSR Invariants
                </h3>
              </div>
              <span className="text-xs font-mono text-slate-500">
                Stress Floor: {result.stressTestRate.toFixed(2)}% p.a.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {/* Stress Installment Comparison */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-600 font-medium">
                  At MAS Stress Rate ({result.stressTestRate.toFixed(2)}%)
                </span>
                <div className="mt-1 font-mono text-lg font-bold text-slate-900 tabular-nums">
                  {formatSGD(result.stressTestMonthlyPayment)} / mo
                </div>
                <div className="text-xs text-rose-600 font-mono mt-1 font-medium">
                  +{formatSGD(result.stressMonthlyDifference)} / mo buffer required
                </div>
              </div>

              {/* TDSR Ratio Status */}
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-medium">
                    Total Debt Servicing Ratio (TDSR)
                  </span>
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                    result.tdsrStatus === 'HEALTHY'
                      ? 'bg-emerald-100 text-emerald-800'
                      : result.tdsrStatus === 'MODERATE'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {result.tdsrStatus} ({result.tdsrPercentage}%)
                  </span>
                </div>
                <div className="mt-2 h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      result.tdsrStatus === 'HEALTHY'
                        ? 'bg-emerald-500'
                        : result.tdsrStatus === 'MODERATE'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, result.tdsrPercentage)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                  <span>Current: {result.tdsrPercentage}%</span>
                  <span>MAS Cap: 55.0%</span>
                </div>
              </div>
            </div>

            {/* MSR notice for HDB */}
            {input.propertyType === 'HDB' && result.msrPercentage !== undefined && (
              <div className="mt-3 p-3 bg-blue-50/60 border border-blue-100 rounded-lg flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <Info className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>HDB Mortgage Servicing Ratio (MSR) evaluated at <strong>{result.msrPercentage}%</strong> (MAS limit 30%).</span>
                </div>
                <span className={`font-mono font-semibold px-2 py-0.5 rounded text-[11px] ${
                  result.msrStatus === 'HEALTHY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {result.msrStatus === 'HEALTHY' ? 'MSR Compliant' : 'MSR Exceeded'}
                </span>
              </div>
            )}
          </div>

          {/* Interactive Amortization Trajectory Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Loan Balance Trajectory
                </h3>
                <p className="text-xs text-slate-500">Amortization curve across {input.loanTenureYears} years</p>
              </div>
              {hoveredChartYear && (
                <div className="text-xs font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                  Year {hoveredChartYear}: Balance{' '}
                  {formatSGD(
                    result.yearlySchedule.find(y => y.year === hoveredChartYear)?.endingBalance || 0
                  )}
                </div>
              )}
            </div>

            {/* Clean SVG Amortization Chart */}
            <div className="h-48 w-full mt-4">
              <svg viewBox="0 0 600 160" className="w-full h-full overflow-visible">
                {/* Grid horizontal lines */}
                <line x1="40" y1="20" x2="580" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="70" x2="580" y2="70" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="120" x2="580" y2="120" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="40" y1="150" x2="580" y2="150" stroke="#e2e8f0" strokeWidth="1" />

                {/* Y-axis labels */}
                <text x="35" y="24" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  {formatSGD(input.loanAmount)}
                </text>
                <text x="35" y="74" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  {formatSGD(input.loanAmount * 0.5)}
                </text>
                <text x="35" y="154" textAnchor="end" className="text-[10px] fill-slate-400 font-mono">
                  S$0
                </text>

                {/* Amortization area curve */}
                {(() => {
                  const points = result.yearlySchedule.map((row, idx) => {
                    const x = 50 + (idx / Math.max(1, result.yearlySchedule.length - 1)) * 520;
                    const y = 150 - (row.endingBalance / input.loanAmount) * 130;
                    return `${x},${y}`;
                  });

                  const pathD = `M 50,20 L ${points.join(' L ')} L 570,150 L 50,150 Z`;
                  const lineD = `M 50,20 L ${points.join(' L ')}`;

                  return (
                    <>
                      <defs>
                        <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0f172a" stopOpacity="0.18" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path d={pathD} fill="url(#balanceGrad)" />
                      <path d={lineD} fill="none" stroke="#0f172a" strokeWidth="2.5" />

                      {/* Year hover markers */}
                      {result.yearlySchedule.map((row, idx) => {
                        const x = 50 + (idx / Math.max(1, result.yearlySchedule.length - 1)) * 520;
                        const y = 150 - (row.endingBalance / input.loanAmount) * 130;
                        return (
                          <circle
                            key={row.year}
                            cx={x}
                            cy={y}
                            r={hoveredChartYear === row.year ? 5 : 2.5}
                            className="fill-slate-900 cursor-pointer transition-all"
                            onMouseEnter={() => setHoveredChartYear(row.year)}
                            onMouseLeave={() => setHoveredChartYear(null)}
                          />
                        );
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            <div className="flex justify-between text-[11px] text-slate-400 font-mono px-8">
              <span>Year 1</span>
              <span>Year {Math.round(input.loanTenureYears / 2)}</span>
              <span>Year {input.loanTenureYears} (Payoff)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amortization Schedule Data Table Section */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Payment & Amortization Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Exact principal amortization, SORA interest component and bank spread breakdown
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setScheduleViewMode('annual')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  scheduleViewMode === 'annual'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Summary
              </button>
              <button
                type="button"
                onClick={() => {
                  setScheduleViewMode('monthly');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  scheduleViewMode === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Details ({result.schedule.length} mo)
              </button>
            </div>

            <button
              type="button"
              onClick={onExportCsv}
              className="text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Export CSV
            </button>
          </div>
        </div>

        {/* Schedule Table */}
        <div className="overflow-x-auto">
          {scheduleViewMode === 'annual' ? (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Year</th>
                  <th className="py-3 px-4 text-right">Starting Balance</th>
                  <th className="py-3 px-4 text-right">Annual Payment</th>
                  <th className="py-3 px-4 text-right">Principal Repaid</th>
                  <th className="py-3 px-4 text-right">Interest Paid</th>
                  <th className="py-3 px-4 text-right">Ending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 font-sans font-medium text-slate-900">
                      Year {row.year}
                    </td>
                    <td className="py-2.5 px-4 text-right text-slate-600 tabular-nums">
                      {formatSGD(row.startingBalance)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-semibold text-slate-900 tabular-nums">
                      {formatSGD(row.totalPayment)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-emerald-700 tabular-nums">
                      {formatSGD(row.totalPrincipal)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-amber-700 tabular-nums">
                      {formatSGD(row.totalInterest)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-slate-900 tabular-nums">
                      {formatSGD(row.endingBalance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <>
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Month</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Starting Balance</th>
                    <th className="py-3 px-4 text-right">Payment</th>
                    <th className="py-3 px-4 text-right">Principal</th>
                    <th className="py-3 px-4 text-right">Interest</th>
                    <th className="py-3 px-4 text-right">SORA Part</th>
                    <th className="py-3 px-4 text-right">Bank Margin</th>
                    <th className="py-3 px-4 text-right">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {displayedMonthlyRows.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2 px-4 font-sans font-medium text-slate-900">
                        M{row.month}
                      </td>
                      <td className="py-2 px-4 font-sans text-slate-500">
                        {row.displayDate}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-600 tabular-nums">
                        {formatSGD(row.startingBalance)}
                      </td>
                      <td className="py-2 px-4 text-right font-semibold text-slate-900 tabular-nums">
                        {formatSGD(row.payment)}
                      </td>
                      <td className="py-2 px-4 text-right text-emerald-700 tabular-nums">
                        {formatSGD(row.principal)}
                      </td>
                      <td className="py-2 px-4 text-right text-amber-700 tabular-nums">
                        {formatSGD(row.interest)}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-500 tabular-nums">
                        {formatSGD(row.soraComponent)}
                      </td>
                      <td className="py-2 px-4 text-right text-slate-500 tabular-nums">
                        {formatSGD(row.bankSpreadComponent)}
                      </td>
                      <td className="py-2 px-4 text-right font-medium text-slate-900 tabular-nums">
                        {formatSGD(row.endingBalance)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination controls for monthly */}
              <div className="px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Showing {(currentPage - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(currentPage * rowsPerPage, result.schedule.length)} of{' '}
                  {result.schedule.length} months
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    className="px-2.5 py-1 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="font-mono text-slate-700">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 border border-slate-200 rounded text-slate-700 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
