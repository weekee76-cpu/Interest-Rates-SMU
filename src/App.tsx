import { useState, useEffect, useMemo } from 'react';
import { TopHeader } from './components/TopHeader';
import { RateTickerBar } from './components/RateTickerBar';
import { MortgageCalculatorView } from './components/MortgageCalculatorView';
import { MasCompoundingEngineView } from './components/MasCompoundingEngineView';
import { HistoricalRatesView } from './components/HistoricalRatesView';
import { BankPackagesView } from './components/BankPackagesView';
import { MasApiSpecView } from './components/MasApiSpecView';

import {
  LoanInputState,
  SoraSummaryRates,
  BankPackage
} from './types/sora';
import { getLatestSoraRates, SEEDED_MAS_RATES } from './services/masSoraService';
import { calculateSoraLoan, exportScheduleToCSV } from './utils/loanCalculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'calculator' | 'compounding' | 'historical' | 'comparison' | 'api-spec'
  >('calculator');

  // Fallback initial seeded summary
  const lastIndex = SEEDED_MAS_RATES.length - 1;
  const initialRates: SoraSummaryRates = {
    lastUpdated: SEEDED_MAS_RATES[lastIndex].date,
    overnightSora: SEEDED_MAS_RATES[lastIndex].soraRate,
    compounded1M: SEEDED_MAS_RATES[lastIndex].rate1MCompounded || 2.8850,
    compounded3M: SEEDED_MAS_RATES[lastIndex].rate3MCompounded || 2.9520,
    compounded6M: SEEDED_MAS_RATES[lastIndex].rate6MCompounded || 3.0180,
    soraIndex: SEEDED_MAS_RATES[lastIndex].soraIndex,
    changeOvernight: 0.0050,
    change3M: -0.0120
  };

  const [rates, setRates] = useState<SoraSummaryRates>(initialRates);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Loan state defaults to standard Singapore mortgage: S$1,000,000 at 25 years with 3M SORA + 0.70%
  const [loanInput, setLoanInput] = useState<LoanInputState>({
    loanAmount: 1000000,
    loanTenureYears: 25,
    benchmark: '3M_SORA',
    customBenchmarkRate: 2.952,
    bankSpread: 0.70,
    propertyType: 'PRIVATE',
    repaymentType: 'AMORTIZED',
    borrowerMonthlyIncome: 15000,
    otherMonthlyCommitments: 800,
    startDate: '2026-11'
  });

  // Fetch / verify MAS rates on mount
  useEffect(() => {
    let isMounted = true;
    getLatestSoraRates().then((data) => {
      if (isMounted) {
        setRates(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleRefreshRates = async () => {
    setIsRefreshing(true);
    try {
      const data = await getLatestSoraRates();
      setRates(data);
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Determine effective benchmark SORA rate
  const effectiveSoraRate = useMemo(() => {
    switch (loanInput.benchmark) {
      case '3M_SORA':
        return rates.compounded3M;
      case '1M_SORA':
        return rates.compounded1M;
      case '6M_SORA':
        return rates.compounded6M;
      case 'OVERNIGHT_SORA':
        return rates.overnightSora;
      case 'CUSTOM':
        return loanInput.customBenchmarkRate;
      default:
        return rates.compounded3M;
    }
  }, [loanInput.benchmark, loanInput.customBenchmarkRate, rates]);

  // Compute calculation result whenever inputs or rates change
  const calculationResult = useMemo(() => {
    return calculateSoraLoan(loanInput, effectiveSoraRate);
  }, [loanInput, effectiveSoraRate]);

  // Quick select benchmark from ticker
  const handleQuickSelectBenchmark = (
    benchmark: '1M_SORA' | '3M_SORA' | '6M_SORA' | 'OVERNIGHT_SORA'
  ) => {
    setLoanInput((prev) => ({
      ...prev,
      benchmark
    }));
    setActiveTab('calculator');
  };

  // Apply bank package to calculator
  const handleApplyPackage = (pkg: BankPackage) => {
    if (pkg.benchmarkType === 'FIXED') {
      setLoanInput((prev) => ({
        ...prev,
        benchmark: 'CUSTOM',
        customBenchmarkRate: pkg.initialRate,
        bankSpread: 0
      }));
    } else {
      setLoanInput((prev) => ({
        ...prev,
        benchmark: pkg.benchmarkType as '1M_SORA' | '3M_SORA',
        bankSpread: pkg.spreadYear1
      }));
    }
    setActiveTab('calculator');
  };

  // Apply rate calculated from MAS Compounding Engine
  const handleApplyCompoundedRate = (customRate: number) => {
    setLoanInput((prev) => ({
      ...prev,
      benchmark: 'CUSTOM',
      customBenchmarkRate: customRate
    }));
    setActiveTab('calculator');
  };

  // Export Amortization CSV
  const handleExportCsv = () => {
    exportScheduleToCSV(
      calculationResult.schedule,
      loanInput.loanAmount,
      calculationResult.totalRate
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top 3-Zone Header Bar */}
      <TopHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onExportCsv={handleExportCsv}
        onRefreshRates={handleRefreshRates}
        isRefreshing={isRefreshing}
      />

      {/* MAS Benchmark Ticker Strip */}
      <RateTickerBar
        rates={rates}
        selectedBenchmark={loanInput.benchmark}
        onQuickSelectBenchmark={handleQuickSelectBenchmark}
      />

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'calculator' && (
          <MortgageCalculatorView
            input={loanInput}
            onChangeInput={setLoanInput}
            result={calculationResult}
            rates={rates}
            onExportCsv={handleExportCsv}
            onNavigateToCompounding={() => setActiveTab('compounding')}
          />
        )}

        {activeTab === 'compounding' && (
          <MasCompoundingEngineView
            onApplyCalculatedRate={handleApplyCompoundedRate}
          />
        )}

        {activeTab === 'historical' && <HistoricalRatesView />}

        {activeTab === 'comparison' && (
          <BankPackagesView
            currentLoanAmount={loanInput.loanAmount}
            tenureYears={loanInput.loanTenureYears}
            rates={rates}
            onApplyPackage={handleApplyPackage}
          />
        )}

        {activeTab === 'api-spec' && <MasApiSpecView />}
      </main>

      {/* Clean Financial Compliance Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">SORA Prime · SG</span>
            <span aria-hidden="true">·</span>
            <span>Interest calculation based on Monetary Authority of Singapore (MAS) Actual/365 convention</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <span>MAS DataStore Resource 9a0bf149</span>
            <span aria-hidden="true">·</span>
            <span>SingStat / MAS Standards</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
