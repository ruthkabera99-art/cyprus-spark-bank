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
  status: 'completed' | 'pending' | 'failed';
  category: 'traditional' | 'crypto';
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
