import { BankPackage } from '../types/sora';

export const SINGAPORE_BANK_PACKAGES: BankPackage[] = [
  {
    id: 'dbs-3m-sora',
    bank: 'DBS Bank',
    name: 'POSB / DBS 3M SORA Home Package',
    benchmarkType: '3M_SORA',
    initialRate: 2.952,
    spreadYear1: 0.65,
    spreadYear2: 0.68,
    spreadYear3: 0.75,
    spreadThereafter: 0.85,
    lockInYears: 2,
    minLoanAmount: 500000,
    perks: 'Free conversion after lock-in, S$2,000 legal subsidy for refinancing'
  },
  {
    id: 'ocbc-1m-sora',
    bank: 'OCBC Bank',
    name: 'OCBC 1M SORA Agile Mortgage',
    benchmarkType: '1M_SORA',
    initialRate: 2.885,
    spreadYear1: 0.60,
    spreadYear2: 0.65,
    spreadYear3: 0.70,
    spreadThereafter: 0.80,
    lockInYears: 2,
    minLoanAmount: 400000,
    perks: 'Faster interest rate reset frequency for falling interest rate cycles'
  },
  {
    id: 'uob-3m-sora',
    bank: 'UOB',
    name: 'UOB 3M SORA Value Loan',
    benchmarkType: '3M_SORA',
    initialRate: 2.952,
    spreadYear1: 0.68,
    spreadYear2: 0.68,
    spreadYear3: 0.72,
    spreadThereafter: 0.80,
    lockInYears: 3,
    minLoanAmount: 500000,
    perks: 'Waiver of prepayment penalty due to property sale within lock-in'
  },
  {
    id: 'hsbc-green-sora',
    bank: 'HSBC Singapore',
    name: 'HSBC Green Mortgage 1M SORA',
    benchmarkType: '1M_SORA',
    initialRate: 2.885,
    spreadYear1: 0.58,
    spreadYear2: 0.62,
    spreadYear3: 0.65,
    spreadThereafter: 0.78,
    lockInYears: 2,
    minLoanAmount: 800000,
    perks: '0.05% green discount for BCA Green Mark Gold/Platinum properties'
  },
  {
    id: 'stanchart-3m-sora',
    bank: 'Standard Chartered',
    name: 'StanChart 3M SORA MortgageOne',
    benchmarkType: '3M_SORA',
    initialRate: 2.952,
    spreadYear1: 0.70,
    spreadYear2: 0.70,
    spreadYear3: 0.75,
    spreadThereafter: 0.85,
    lockInYears: 2,
    minLoanAmount: 500000,
    perks: 'Interest offset account: 2/3 of deposit balances offset loan interest'
  },
  {
    id: 'fixed-2y-compare',
    bank: 'Maybank / Fixed',
    name: '2-Year Fixed Rate Sanctuary',
    benchmarkType: 'FIXED',
    initialRate: 2.850,
    spreadYear1: 0,
    spreadYear2: 0,
    spreadYear3: 0.85,
    spreadThereafter: 0.95,
    lockInYears: 2,
    minLoanAmount: 300000,
    perks: 'Protection against overnight rate spikes for the first 24 months'
  }
];
