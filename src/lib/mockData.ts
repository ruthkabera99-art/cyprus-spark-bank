// Mock user data for demo purposes
export interface CryptoBalance {
  currency: string;
  symbol: string;
  balance: number;
  usdValue: number;
  icon: string;
}

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan' | 'crypto_buy' | 'crypto_sell';
  description: string;
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  category: 'traditional' | 'crypto';
}

export interface CollateralDocument {
  id: string;
  name: string;
  type: string;
  uploadedAt: string;
}

export interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  termMonths: number;
  interestRate: number;
  monthlyPayment: number;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  applicationDate: string;
  collateralType: 'real_estate' | 'vehicle' | 'equipment' | 'crypto' | 'other';
  collateralValue: number;
  collateralDescription: string;
  collateralDocuments: CollateralDocument[];
  // Crypto collateral specific
  cryptoCollateral?: {
    currency: string;
    amount: number;
    usdValueAtLock: number;
    currentUsdValue: number;
    ltv: number;
    liquidationThreshold: number;
  };
  // Approved loan details
  approvedDate?: string;
  disbursedAmount?: number;
  remainingBalance?: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
  paidPayments?: number;
  totalPayments?: number;
}

export interface User {
  id: string;
  email: string;
  password: string; // In real app, this would be hashed
  firstName: string;
  lastName: string;
  phone: string;
  accountNumber: string;
  traditionalBalance: number;
  cryptoBalances: CryptoBalance[];
  transactions: Transaction[];
  loanApplications: LoanApplication[];
  createdAt: string;
}

export const mockUsers: User[] = [
  {
    id: 'user-001',
    email: 'demo@securebank.com',
    password: 'demo123',
    firstName: 'John',
    lastName: 'Mitchell',
    phone: '+1 (555) 123-4567',
    accountNumber: 'SB-2024-001847',
    traditionalBalance: 45678.92,
    cryptoBalances: [
      { currency: 'Bitcoin', symbol: 'BTC', balance: 1.2456, usdValue: 52340.50, icon: '₿' },
      { currency: 'Ethereum', symbol: 'ETH', balance: 8.5, usdValue: 28900.00, icon: 'Ξ' },
      { currency: 'Tether', symbol: 'USDT', balance: 15000, usdValue: 15000.00, icon: '₮' },
    ],
    transactions: [
      { id: 'tx-001', type: 'deposit', description: 'Wire Transfer from External Bank', amount: 5000, currency: 'USD', date: '2024-01-15', status: 'completed', category: 'traditional' },
      { id: 'tx-002', type: 'crypto_buy', description: 'Purchased Bitcoin', amount: 0.15, currency: 'BTC', date: '2024-01-14', status: 'completed', category: 'crypto' },
      { id: 'tx-003', type: 'transfer', description: 'Transfer to Jane Doe', amount: -1200, currency: 'USD', date: '2024-01-13', status: 'completed', category: 'traditional' },
      { id: 'tx-004', type: 'crypto_sell', description: 'Sold Ethereum', amount: 2.5, currency: 'ETH', date: '2024-01-12', status: 'completed', category: 'crypto' },
      { id: 'tx-005', type: 'withdrawal', description: 'ATM Withdrawal', amount: -500, currency: 'USD', date: '2024-01-11', status: 'completed', category: 'traditional' },
      { id: 'tx-006', type: 'deposit', description: 'Salary Deposit', amount: 8500, currency: 'USD', date: '2024-01-10', status: 'completed', category: 'traditional' },
      { id: 'tx-007', type: 'loan', description: 'Loan Disbursement', amount: 25000, currency: 'USD', date: '2024-01-05', status: 'completed', category: 'traditional' },
      { id: 'tx-008', type: 'crypto_buy', description: 'Purchased USDT', amount: 5000, currency: 'USDT', date: '2024-01-04', status: 'completed', category: 'crypto' },
    ],
    loanApplications: [
      {
        id: 'loan-001',
        userId: 'user-001',
        amount: 25000,
        purpose: 'Business Expansion',
        termMonths: 24,
        interestRate: 8.5,
        monthlyPayment: 1134.27,
        status: 'approved',
        applicationDate: '2023-12-15',
        collateralType: 'real_estate',
        collateralValue: 75000,
        collateralDescription: 'Commercial property at 123 Business Ave',
        collateralDocuments: [
          { id: 'doc-001', name: 'Property Deed.pdf', type: 'application/pdf', uploadedAt: '2023-12-15' },
          { id: 'doc-002', name: 'Property Valuation.pdf', type: 'application/pdf', uploadedAt: '2023-12-15' },
        ],
        approvedDate: '2023-12-20',
        disbursedAmount: 25000,
        remainingBalance: 18450.50,
        nextPaymentDate: '2024-02-01',
        nextPaymentAmount: 1134.27,
        paidPayments: 6,
        totalPayments: 24,
      },
      {
        id: 'loan-002',
        userId: 'user-001',
        amount: 15000,
        purpose: 'Investment',
        termMonths: 12,
        interestRate: 7.25,
        monthlyPayment: 1301.45,
        status: 'under_review',
        applicationDate: '2024-01-10',
        collateralType: 'crypto',
        collateralValue: 30000,
        collateralDescription: 'Bitcoin collateral locked',
        collateralDocuments: [],
        cryptoCollateral: {
          currency: 'BTC',
          amount: 0.75,
          usdValueAtLock: 31500,
          currentUsdValue: 31500,
          ltv: 50,
          liquidationThreshold: 75,
        },
      },
      {
        id: 'loan-003',
        userId: 'user-001',
        amount: 5000,
        purpose: 'Personal Use',
        termMonths: 6,
        interestRate: 9.0,
        monthlyPayment: 860.21,
        status: 'pending',
        applicationDate: '2024-01-18',
        collateralType: 'vehicle',
        collateralValue: 12000,
        collateralDescription: '2021 Honda Accord',
        collateralDocuments: [
          { id: 'doc-003', name: 'Vehicle Title.pdf', type: 'application/pdf', uploadedAt: '2024-01-18' },
        ],
      },
    ],
    createdAt: '2023-06-15',
  },
  {
    id: 'user-002',
    email: 'jane@example.com',
    password: 'password123',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '+1 (555) 987-6543',
    accountNumber: 'SB-2024-002156',
    traditionalBalance: 128450.00,
    cryptoBalances: [
      { currency: 'Bitcoin', symbol: 'BTC', balance: 3.5, usdValue: 147000.00, icon: '₿' },
      { currency: 'Ethereum', symbol: 'ETH', balance: 25.0, usdValue: 85000.00, icon: 'Ξ' },
      { currency: 'Tether', symbol: 'USDT', balance: 50000, usdValue: 50000.00, icon: '₮' },
    ],
    transactions: [
      { id: 'tx-101', type: 'deposit', description: 'Business Revenue', amount: 35000, currency: 'USD', date: '2024-01-15', status: 'completed', category: 'traditional' },
      { id: 'tx-102', type: 'crypto_buy', description: 'Purchased Bitcoin', amount: 0.5, currency: 'BTC', date: '2024-01-14', status: 'pending', category: 'crypto' },
    ],
    loanApplications: [],
    createdAt: '2023-08-20',
  },
];

// Wallet addresses for crypto deposits (demo)
export const cryptoWallets = {
  BTC: {
    address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    network: 'Bitcoin Network',
  },
  ETH: {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f7ACBD',
    network: 'Ethereum (ERC-20)',
  },
  USDT: {
    address: 'TN3W4H6rK2ce4vX9FEfBfBGLHKwKDhJMeS',
    network: 'Tron (TRC-20)',
  },
};

// Loan configuration
export const loanConfig = {
  minAmount: 1000,
  maxAmount: 500000,
  purposes: [
    'Business Expansion',
    'Personal Use',
    'Investment',
    'Home Improvement',
    'Debt Consolidation',
    'Education',
    'Medical Expenses',
    'Vehicle Purchase',
    'Other',
  ],
  terms: [6, 12, 24, 36, 48, 60],
  collateralTypes: [
    { value: 'real_estate', label: 'Real Estate', documents: ['Property Deed', 'Property Valuation Report', 'Title Insurance'] },
    { value: 'vehicle', label: 'Vehicle', documents: ['Vehicle Title', 'Registration', 'Insurance Proof'] },
    { value: 'equipment', label: 'Equipment', documents: ['Equipment Invoice', 'Ownership Proof', 'Maintenance Records'] },
    { value: 'crypto', label: 'Crypto Assets', documents: [] },
    { value: 'other', label: 'Other Assets', documents: ['Proof of Ownership', 'Valuation Report'] },
  ],
  baseInterestRates: {
    6: 9.0,
    12: 8.5,
    24: 8.0,
    36: 7.5,
    48: 7.25,
    60: 7.0,
  },
  cryptoLTV: 50, // Loan-to-Value ratio for crypto collateral
  cryptoLiquidationThreshold: 75, // Liquidation threshold percentage
};

// Calculate monthly payment
export const calculateMonthlyPayment = (principal: number, annualRate: number, termMonths: number): number => {
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
};

// Get crypto price (mock - should be fetched from API in production)
export const getCryptoPrice = (symbol: string): number => {
  const prices: Record<string, number> = {
    BTC: 95000,  // Updated approximate price
    ETH: 3300,
    USDT: 1,
  };
  return prices[symbol] || 0;
};
