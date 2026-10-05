import React from 'react';
import { RefreshCw, Download } from 'lucide-react';

interface TopHeaderProps {
  activeTab: 'calculator' | 'compounding' | 'historical' | 'comparison' | 'api-spec';
  onSelectTab: (tab: 'calculator' | 'compounding' | 'historical' | 'comparison' | 'api-spec') => void;
  onExportCsv: () => void;
  onRefreshRates: () => void;
  isRefreshing: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  activeTab,
  onSelectTab,
  onExportCsv,
  onRefreshRates,
  isRefreshing
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectTab('calculator')}
              className="text-left group cursor-pointer focus:outline-none"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-slate-700 transition-colors">
                SORA Prime · SG
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => onSelectTab('calculator')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 text-left ${
                activeTab === 'calculator'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Mortgage Calculator
            </button>
            <button
              onClick={() => onSelectTab('compounding')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 text-left ${
                activeTab === 'compounding'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              MAS Compounding Engine
            </button>
            <button
              onClick={() => onSelectTab('historical')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 text-left ${
                activeTab === 'historical'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Historical Rates
            </button>
            <button
              onClick={() => onSelectTab('comparison')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 text-left ${
                activeTab === 'comparison'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Bank Packages
            </button>
            <button
              onClick={() => onSelectTab('api-spec')}
              className={`transition-colors whitespace-nowrap cursor-pointer py-1 border-b-2 text-left ${
                activeTab === 'api-spec'
                  ? 'border-slate-900 text-slate-900 font-semibold'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Backend API Spec
            </button>
          </nav>

          {/* Zone 3: Primary Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onRefreshRates}
              disabled={isRefreshing}
              title="Refresh MAS benchmark rates"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-slate-900' : ''}`} />
              <span className="hidden sm:inline">Refresh MAS</span>
            </button>
            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Schedule</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="md:hidden flex items-center gap-4 overflow-x-auto py-2.5 border-t border-slate-100 text-xs font-medium">
          <button
            onClick={() => onSelectTab('calculator')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'calculator' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Calculator
          </button>
          <button
            onClick={() => onSelectTab('compounding')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'compounding' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Compounding
          </button>
          <button
            onClick={() => onSelectTab('historical')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'historical' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Historical
          </button>
          <button
            onClick={() => onSelectTab('comparison')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'comparison' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            Banks
          </button>
          <button
            onClick={() => onSelectTab('api-spec')}
            className={`whitespace-nowrap px-2 py-1 rounded ${activeTab === 'api-spec' ? 'bg-slate-900 text-white' : 'text-slate-600'}`}
          >
            API
          </button>
        </div>
      </div>
    </header>
  );
};
