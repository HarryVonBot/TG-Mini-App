// Core type definitions for VonVault DeFi App

export type ScreenType = 
  | 'welcome' 
  | 'login' 
  | 'signup'
  | 'connect-bank'
  | 'connect-crypto'
  | 'dashboard'
  | 'investments'
  | 'new-investment'
  | 'crypto'
  | 'funds'
  | 'transfer'
  | 'withdraw'
  | 'profile'
  | 'ui-catalog'
  | 'admin-plans'
  | 'membership-status';

export interface User {
  id: string;
  name?: string;
  email?: string;
  token?: string;
  wallet_address?: string;
  bank_connected?: boolean;
  crypto_connected?: boolean;
}

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  rate: number;
  term: number;
  membership_level?: string;
  status: 'active' | 'completed' | 'pending';
  created_at?: string;
}

export interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  membership_level?: string;
  rate: number;
  term_days: number;
  min_amount: number;
  max_amount: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Backward compatibility
  term?: number; // in months
}

export interface MembershipTier {
  name: string;
  min_amount: number;
  max_amount?: number;
  max_per_investment: number;
  emoji: string;
  benefits: string;
}

export interface MembershipStatus {
  level: string;
  level_name: string;
  emoji: string;
  total_invested: number;
  current_min: number;
  current_max?: number;
  next_level?: string;
  next_level_name?: string;
  amount_to_next?: number;
  available_plans: InvestmentPlan[];
}

export interface CryptoAsset {
  name: string;
  symbol: string;
  amount: number;
  usdValue: number;
}

export interface BankAccount {
  id: string;
  name: string;
  balance: {
    available: string;
  };
}

export interface Portfolio {
  user_id: string;
  membership: MembershipStatus;
  total_portfolio: number;
  investments: {
    total: number;
    count: number;
  };
  crypto: {
    total: number;
  };
  bank: {
    total: number;
  };
  breakdown: {
    investments_percentage: number;
    crypto_percentage: number;
    cash_percentage: number;
  };
}

// Screen component props
export interface ScreenProps {
  onBack?: () => void;
  onNavigate?: (screen: ScreenType) => void;
}

export interface AuthScreenProps extends ScreenProps {
  onLogin?: (user: User) => void;
  onContinue?: (user: User) => void;
  onCreateAccount?: () => void;
  onGoToLogin?: () => void;
}

// Context types
export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  portfolio: Portfolio | null;
  loading: boolean;
  fetchPortfolio: () => Promise<void>;
  membershipStatus: MembershipStatus | null;
  fetchMembershipStatus: () => Promise<void>;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface InvestmentPlansResponse {
  plans: InvestmentPlan[];
  membership: MembershipStatus;
}

export interface InvestmentsResponse {
  investments: Investment[];
}

export interface MembershipTiersResponse {
  tiers: Record<string, MembershipTier>;
}