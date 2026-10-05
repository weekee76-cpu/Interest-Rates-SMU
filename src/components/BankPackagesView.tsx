import React from 'react';
import { SINGAPORE_BANK_PACKAGES } from '../data/bankPackages';
import { BankPackage, SoraSummaryRates } from '../types/sora';
import { formatSGD } from '../utils/loanCalculations';
import { Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface BankPackagesViewProps {
  currentLoanAmount: number;
  tenureYears: number;
  rates: SoraSummaryRates;
  onApplyPackage: (pkg: BankPackage) => void;
}

export const BankPackagesView: React.FC<BankPackagesViewProps> = ({
  currentLoanAmount,
  tenureYears,
  rates,
  onApplyPackage
}) => {
  const computeMonthlyForPackage = (pkg: BankPackage) => {
    let baseRate = 0;
    if (pkg.benchmarkType === '3M_SORA') {
      baseRate = rates.compounded3M;
    } else if (pkg.benchmarkType === '1M_SORA') {
      baseRate = rates.compounded1M;
    } else {
      baseRate = pkg.initialRate; // Fixed
    }

    const year1TotalRate = pkg.benchmarkType === 'FIXED' ? pkg.initialRate : baseRate + pkg.spreadYear1;
    const monthlyRate = (year1TotalRate / 100) / 12;
    const totalMonths = tenureYears * 12;

    const monthlyPayment = (currentLoanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    return {
      totalRate: year1TotalRate,
      monthlyPayment: Math.round(monthlyPayment)
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Singapore Bank SORA Loan Comparison
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Evaluating live Singapore bank spreads against your loan of {formatSGD(currentLoanAmount)} ({tenureYears} yrs)
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            Current Base: 3M SORA = <span className="font-mono font-semibold text-slate-900">{rates.compounded3M.toFixed(4)}%</span> · 1M SORA = <span className="font-mono font-semibold text-slate-900">{rates.compounded1M.toFixed(4)}%</span>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
          {SINGAPORE_BANK_PACKAGES.map((pkg) => {
            const { totalRate, monthlyPayment } = computeMonthlyForPackage(pkg);

            return (
              <div
                key={pkg.id}
                className="border border-slate-200 rounded-xl p-5 hover:border-slate-400 transition-all flex flex-col justify-between bg-white hover:shadow-xs group"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span className="font-semibold text-slate-900">{pkg.bank}</span>
                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
                      {pkg.benchmarkType === 'FIXED' ? 'Fixed Rate' : pkg.benchmarkType.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {pkg.name}
                  </h3>

                  {/* Pricing Box */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Year 1 All-In Rate</span>
                      <span className="font-mono text-lg font-bold text-slate-900 tabular-nums">
                        {totalRate.toFixed(3)}% p.a.
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs text-slate-500">Estimated Payment</span>
                      <span className="font-mono text-base font-bold text-emerald-700 tabular-nums">
                        {formatSGD(monthlyPayment)} / mo
                      </span>
                    </div>
                  </div>

                  {/* Spread Progression Details */}
                  <div className="mt-4 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Year 1 Spread:</span>
                      <span className="font-mono font-medium text-slate-900">
                        {pkg.benchmarkType === 'FIXED' ? '2.85% Fixed' : `+${pkg.spreadYear1.toFixed(2)}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Year 2 Spread:</span>
                      <span className="font-mono font-medium text-slate-900">
                        {pkg.benchmarkType === 'FIXED' ? '2.85% Fixed' : `+${pkg.spreadYear2.toFixed(2)}%`}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Thereafter:</span>
                      <span className="font-mono font-medium text-slate-900">
                        +{pkg.spreadThereafter.toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Lock-in Commitment:</span>
                      <span className="font-medium text-slate-900">{pkg.lockInYears} Years</span>
                    </div>
                  </div>

                  {/* Perks & Features */}
                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{pkg.perks}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onApplyPackage(pkg)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-lg transition-colors cursor-pointer group-hover:bg-slate-900 group-hover:text-white"
                  >
                    <span>Load Package into Calculator</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
