import {
  LoanInputState,
  LoanCalculationResult,
  AmortizationRow,
  AnnualAmortizationRow
} from '../types/sora';

/**
 * Format currency in Singapore Dollars
 */
export function formatSGD(val: number, includeDecimals = false): string {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0
  }).format(val);
}

/**
 * Format percentage with 2-4 decimals
 */
export function formatPercent(val: number, decimals = 4): string {
  return `${val.toFixed(decimals)}%`;
}

/**
 * Compute Singapore SORA Loan Amortization & MAS Stress Tests
 */
export function calculateSoraLoan(
  input: LoanInputState,
  effectiveSoraRate: number
): LoanCalculationResult {
  const {
    loanAmount,
    loanTenureYears,
    bankSpread,
    propertyType,
    repaymentType,
    borrowerMonthlyIncome,
    otherMonthlyCommitments,
    startDate
  } = input;

  const totalRate = Math.max(0.001, effectiveSoraRate + bankSpread);
  const totalMonths = Math.max(1, loanTenureYears * 12);
  const monthlyRate = totalRate / 100 / 12;

  let monthlyPayment = 0;
  if (repaymentType === 'INTEREST_ONLY') {
    monthlyPayment = loanAmount * monthlyRate;
  } else {
    // Standard Amortization formula
    monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths))) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  // Monthly Amortization generation
  const schedule: AmortizationRow[] = [];
  let balance = loanAmount;
  let accumulatedInterest = 0;
  let accumulatedPrincipal = 0;

  const [startYearStr, startMonthStr] = (startDate || '2026-11').split('-');
  let currentYear = parseInt(startYearStr, 10) || 2026;
  let currentMonthIndex = parseInt(startMonthStr, 10) - 1 || 10;

  const soraWeight = totalRate > 0 ? effectiveSoraRate / totalRate : 0;
  const spreadWeight = totalRate > 0 ? bankSpread / totalRate : 0;

  for (let m = 1; m <= totalMonths; m++) {
    const interest = balance * monthlyRate;
    let principal = monthlyPayment - interest;

    if (repaymentType === 'INTEREST_ONLY') {
      principal = m === totalMonths ? balance : 0;
    }

    if (principal > balance || m === totalMonths) {
      principal = balance;
    }

    const endingBal = Math.max(0, balance - principal);
    const dateObj = new Date(currentYear, currentMonthIndex);
    const displayDate = dateObj.toLocaleDateString('en-SG', { month: 'short', year: 'numeric' });

    schedule.push({
      month: m,
      year: Math.ceil(m / 12),
      displayDate,
      startingBalance: Math.round(balance),
      payment: Math.round(principal + interest),
      principal: Math.round(principal),
      interest: Math.round(interest),
      soraComponent: Math.round(interest * soraWeight),
      bankSpreadComponent: Math.round(interest * spreadWeight),
      endingBalance: Math.round(endingBal)
    });

    accumulatedInterest += interest;
    accumulatedPrincipal += principal;
    balance = endingBal;

    currentMonthIndex++;
    if (currentMonthIndex > 11) {
      currentMonthIndex = 0;
      currentYear++;
    }

    if (balance <= 0 && repaymentType !== 'INTEREST_ONLY') break;
  }

  // Aggregate annual schedule
  const yearlyMap = new Map<number, AnnualAmortizationRow>();
  for (const row of schedule) {
    if (!yearlyMap.has(row.year)) {
      yearlyMap.set(row.year, {
        year: row.year,
        startingBalance: row.startingBalance,
        totalPayment: 0,
        totalPrincipal: 0,
        totalInterest: 0,
        endingBalance: row.endingBalance
      });
    }
    const yearItem = yearlyMap.get(row.year)!;
    yearItem.totalPayment += row.payment;
    yearItem.totalPrincipal += row.principal;
    yearItem.totalInterest += row.interest;
    yearItem.endingBalance = row.endingBalance;
  }
  const yearlySchedule = Array.from(yearlyMap.values());

  // MAS Stress Testing Floor (Residential 4.00%, Commercial 5.00%)
  const stressTestRate = propertyType === 'COMMERCIAL' ? 5.0 : 4.0;
  const stressMonthlyRate = stressTestRate / 100 / 12;
  const stressTestMonthlyPayment = (loanAmount * (stressMonthlyRate * Math.pow(1 + stressMonthlyRate, totalMonths))) /
    (Math.pow(1 + stressMonthlyRate, totalMonths) - 1);
  const stressMonthlyDifference = stressTestMonthlyPayment - monthlyPayment;

  // TDSR calculation (MAS mandated 55% maximum limit)
  let tdsrPercentage = 0;
  let tdsrStatus: 'HEALTHY' | 'MODERATE' | 'BREACHED' = 'HEALTHY';
  if (borrowerMonthlyIncome > 0) {
    const totalObligations = stressTestMonthlyPayment + otherMonthlyCommitments;
    tdsrPercentage = (totalObligations / borrowerMonthlyIncome) * 100;
    if (tdsrPercentage > 55) {
      tdsrStatus = 'BREACHED';
    } else if (tdsrPercentage > 45) {
      tdsrStatus = 'MODERATE';
    } else {
      tdsrStatus = 'HEALTHY';
    }
  }

  // MSR calculation for HDB (MAS mandated 30% limit)
  let msrPercentage: number | undefined;
  let msrStatus: 'HEALTHY' | 'BREACHED' | undefined;
  if (propertyType === 'HDB' && borrowerMonthlyIncome > 0) {
    msrPercentage = (monthlyPayment / borrowerMonthlyIncome) * 100;
    msrStatus = msrPercentage > 30 ? 'BREACHED' : 'HEALTHY';
  }

  return {
    monthlyPayment: Math.round(monthlyPayment),
    totalInterest: Math.round(accumulatedInterest),
    totalPayment: Math.round(loanAmount + accumulatedInterest),
    effectiveRate: +totalRate.toFixed(4),
    soraRateUsed: +effectiveSoraRate.toFixed(4),
    totalRate: +totalRate.toFixed(4),
    soraInterestShare: Math.round(accumulatedInterest * soraWeight),
    bankSpreadInterestShare: Math.round(accumulatedInterest * spreadWeight),
    stressTestRate,
    stressTestMonthlyPayment: Math.round(stressTestMonthlyPayment),
    stressMonthlyDifference: Math.round(stressMonthlyDifference),
    tdsrPercentage: +tdsrPercentage.toFixed(1),
    tdsrStatus,
    msrPercentage: msrPercentage ? +msrPercentage.toFixed(1) : undefined,
    msrStatus,
    schedule,
    yearlySchedule
  };
}

/**
 * Generate CSV string from amortization schedule
 */
export function exportScheduleToCSV(
  schedule: AmortizationRow[],
  loanAmount: number,
  totalRate: number
): void {
  const headers = [
    'Month',
    'Year',
    'Payment Date',
    'Starting Balance (SGD)',
    'Payment (SGD)',
    'Principal Paid (SGD)',
    'Interest Paid (SGD)',
    'SORA Component (SGD)',
    'Bank Spread Component (SGD)',
    'Ending Balance (SGD)'
  ];

  const rows = schedule.map((r) => [
    r.month,
    r.year,
    `"${r.displayDate}"`,
    r.startingBalance,
    r.payment,
    r.principal,
    r.interest,
    r.soraComponent,
    r.bankSpreadComponent,
    r.endingBalance
  ]);

  const csvContent = [
    `# Singapore SORA Loan Amortization Schedule`,
    `# Initial Loan Principal: SGD ${loanAmount}`,
    `# Total Effective Rate: ${totalRate}% p.a.`,
    `# Exported: ${new Date().toISOString()}`,
    headers.join(','),
    ...rows.map((row) => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SORA_Loan_Amortization_${loanAmount}_SGD.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
