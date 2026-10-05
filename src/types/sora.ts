export type SoraBenchmark = '1M_SORA' | '3M_SORA' | '6M_SORA' | 'OVERNIGHT_SORA' | 'CUSTOM';

export type PropertyType = 'HDB' | 'PRIVATE' | 'COMMERCIAL';

export interface DailySoraRate {
  date: string; // YYYY-MM-DD
  soraRate: number; // in percent e.g. 2.9425
  dayWeight: number; // e.g. 1 for Mon-Thu, 3 for Fri
  soraIndex: number; // MAS published SORA Index e.g. 1.054321
  volumeSgdMillion?: number;
  rate1MCompounded?: number;
  rate3MCompounded?: number;
  rate6MCompounded?: number;
}

export interface SoraSummaryRates {
  lastUpdated: string;
  overnightSora: number;
  compounded1M: number;
  compounded3M: number;
  compounded6M: number;
  soraIndex: number;
  changeOvernight: number;
  change3M: number;
}

export interface LoanInputState {
  loanAmount: number;
  loanTenureYears: number;
  benchmark: SoraBenchmark;
  customBenchmarkRate: number;
  bankSpread: number; // % p.a.
  propertyType: PropertyType;
  repaymentType: 'AMORTIZED' | 'INTEREST_ONLY';
  borrowerMonthlyIncome: number;
  otherMonthlyCommitments: number;
  startDate: string; // YYYY-MM
}

export interface AmortizationRow {
  month: number;
  year: number;
  displayDate: string;
  startingBalance: number;
  payment: number;
  principal: number;
  interest: number;
  soraComponent: number;
  bankSpreadComponent: number;
  endingBalance: number;
}

export interface AnnualAmortizationRow {
  year: number;
  startingBalance: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  endingBalance: number;
}

export interface LoanCalculationResult {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  effectiveRate: number;
  soraRateUsed: number;
  totalRate: number;
  soraInterestShare: number;
  bankSpreadInterestShare: number;
  stressTestRate: number; // MAS mandated 4.0%
  stressTestMonthlyPayment: number;
  stressMonthlyDifference: number;
  tdsrPercentage: number;
  tdsrStatus: 'HEALTHY' | 'MODERATE' | 'BREACHED'; // MAS limit 55%
  msrPercentage?: number;
  msrStatus?: 'HEALTHY' | 'BREACHED'; // MAS HDB limit 30%
  schedule: AmortizationRow[];
  yearlySchedule: AnnualAmortizationRow[];
}

export interface CompoundingDayStep {
  date: string;
  dayOfWeek: string;
  soraRate: number;
  dayWeight: number; // ni
  factor: number; // (1 + (ri * ni) / 365)
  runningProduct: number;
  runningCompoundedAnnualRate: number;
}

export interface CustomCompoundingResult {
  startDate: string;
  endDate: string;
  totalDays: number;
  businessDaysCount: number;
  dailyCompoundedRate: number;
  startIndex?: number;
  endIndex?: number;
  indexCompoundedRate?: number;
  steps: CompoundingDayStep[];
}

export interface BankPackage {
  id: string;
  bank: string;
  name: string;
  benchmarkType: '1M_SORA' | '3M_SORA' | 'FIXED';
  initialRate: number;
  spreadYear1: number;
  spreadYear2: number;
  spreadYear3: number;
  spreadThereafter: number;
  lockInYears: number;
  minLoanAmount: number;
  perks: string;
}
