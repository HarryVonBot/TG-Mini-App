// Core type definitions for VonVault DeFi App

export type ScreenType = 
  | 'welcome' 
  | 'login' 
  | 'signup'
  | 'email-verification'
  | 'sms-verification'
  | '2fa-setup'
  | 'two-factor-setup'
  | '2fa-authenticator-setup'
  | 'authenticator-setup'
  | 'enhanced-2fa-setup'
  | '2fa-sms-setup'
  | 'verification-success'
  | 'connect-bank'
  | 'connect-crypto'
  | 'dashboard'
  | 'analytics'
  | 'achievements'
  | 'auto-investment'
  | 'investments'
  | 'new-investment'
  | 'investment-completion'
  | 'crypto'
  | 'crypto-deposit'
  | 'wallet-manager'
  | 'funds'
  | 'transfer'
  | 'transfer-funds'
  | 'withdraw'
  | 'withdrawal'
  | 'profile'
  | 'ui-catalog'
  | 'admin-plans'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-user-details'
  | 'admin-investments'
  | 'admin-crypto'
  | 'membership-status'
  | 'privacy-policy'
  | 'terms-of-service'
  | 'edit-profile'
  | 'create-ticket'
  | 'my-tickets'
  | 'test-wallet-connections';

// === PHASE 2: MULTI-WALLET TYPE DEFINITIONS (EXACT SPECIFICATION) ===

export interface ConnectedWallet {
  id: string;
  type: 'metamask' | 'trustwallet' | 'walletconnect' | 'coinbase' | 'other';
  address: string;
  name?: string;
  is_primary: boolean;
  networks: string[];
  connected_at: string;
  last_used?: string;
  balance_cache?: {
    [network: string]: {
      [token: string]: number;
    };
  };
}

export interface User {
  id?: string;
  user_id?: string; // For backward compatibility
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  token?: string;
  avatar_id?: string; // Simple avatar selection
  
  // === PHASE 2: MULTI-WALLET SUPPORT ===
  connected_wallets?: ConnectedWallet[];
  primary_wallet_id?: string;
  
  // === PHASE 2A: ENHANCED 2FA SUPPORT ===
  biometric_2fa_enabled?: boolean;
  push_2fa_enabled?: boolean;
  
  // === LEGACY FIELDS (MAINTAINED FOR BACKWARD COMPATIBILITY) ===
  wallet_address?: string; // DEPRECATED
  wallet_type?: string; // DEPRECATED
  
  // === EXISTING FIELDS ===
  bank_connected?: boolean;
  crypto_connected?: boolean;
  connected_wallets_count?: number;
  total_crypto_value?: number;
  
  // === VERIFICATION STATUS ===
  email_verified?: boolean;
  phone_verified?: boolean;
  
  // === INVESTMENT & MEMBERSHIP ===
  investment_tier?: string;
  total_investment?: number;
  
  // === ADMIN ===
  is_admin?: boolean;
  
  type?: 'bank' | 'crypto' | 'login' | 'signup' | 'email';
  auth_type?: string;
  created_at?: string;
}

export interface Investment {
  id: string;
  user_id: string;
  plan_id?: string;                      // Backend: plan_id (NEW)
  plan_name: string;                     // Backend: plan_name (was "name")
  name?: string;                         // Legacy field for backward compatibility
  amount: number;
  rate: number;
  term_days: number;                     // Backend: term_days (was "term")
  term?: number;                         // Legacy field: term in months (backward compatibility)
  start_date?: string;                   // Backend: start_date (NEW)
  end_date?: string;                     // Backend: end_date (NEW)
  membership_level?: string;
  status: 'active' | 'completed' | 'pending';
  payment_method?: string;               // Backend: payment_method (NEW)
  crypto_token?: string;                 // Backend: crypto_token (NEW)
  crypto_amount?: number;                // Backend: crypto_amount (NEW)
  crypto_network?: string;               // Backend: crypto_network (NEW)
  crypto_tx_hash?: string;               // Backend: crypto_tx_hash (NEW)
  contract_address?: string;             // Backend: contract_address (NEW)
  blockchain_network?: string;           // Backend: blockchain_network (NEW)
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

export interface InvestmentPlanCreate {
  name: string;
  description: string;
  membership_level?: string;
  rate: number;
  term_days: number;
  min_amount: number;
  max_amount?: number;
  is_active?: boolean;
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
  progress_percentage?: number;          // Backend: progress_percentage (MISSING)
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
  total_invested: number;                // Backend: total_invested
  current_value: number;                 // Backend: current_value (NEW)
  total_returns: number;                 // Backend: total_returns (NEW)
  returns_percentage: number;            // Backend: returns_percentage (NEW)
  active_investments_count: number;      // Backend: active_investments_count
  total_investments_count: number;       // Backend: total_investments_count
  crypto_balances: {                     // Backend: crypto_balances (NEW)
    USDC: number;
    USDT: number;
  };
  investments: Investment[];             // Backend: investments (array, not object)
  portfolio_breakdown: {                 // Backend: portfolio_breakdown (NEW)
    [planName: string]: {
      total_invested: number;
      current_value: number;
      count: number;
    };
  };
  last_updated: string;                  // Backend: last_updated (NEW)
  error?: string;                        // Backend: error (optional)
}

// Legacy Portfolio interface (DEPRECATED - for backward compatibility)
export interface LegacyPortfolio {
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
  onNavigate?: (screen: ScreenType, params?: any) => void;
}

export interface AuthScreenProps extends ScreenProps {
  onLogin?: (user: User) => void;
  onContinue?: (user: User) => void;
  onCreateAccount?: () => void;
  onGoToLogin?: () => void;
  onSignIn?: () => void;
}

export interface ConnectionScreenProps extends ScreenProps {
  onConnected?: () => void;
  onConnect?: () => Promise<void>;
}

// Context types
export interface AppContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  setUser: (user: User | null) => void;
  authenticateBank: () => Promise<User | null>;
  authenticateCrypto: () => Promise<User | null>;
  portfolio: Portfolio | null;
  loading: boolean;
  fetchPortfolio: () => Promise<void>;
  membershipStatus: MembershipStatus | null;
  fetchMembershipStatus: () => Promise<void>;
  
  // === PHASE 2: MULTI-WALLET CONTEXT (EXACT SPECIFICATION) ===
  connected_wallets: ConnectedWallet[];
  primary_wallet: ConnectedWallet | null;
  
  // Multi-wallet functions
  connectWallet: (type: string, address: string, networks: string[]) => Promise<void>;
  disconnectWallet: (walletId: string) => Promise<void>;
  setPrimaryWallet: (walletId: string) => Promise<void>;
  renameWallet: (walletId: string, name: string) => Promise<void>;
  refreshWalletBalances: () => Promise<void>;
  getWalletByNetwork: (network: string) => ConnectedWallet | null;
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

export interface PortfolioResponse extends Portfolio {
  // Portfolio response is the same as Portfolio interface
}

export interface InvestmentResponse {
  message: string;
  investment: Investment;
}

// Authentication Response types
export interface AuthResponse {
  message: string;
  user: User;
  token: string;
  authenticated: boolean;
}

export interface LoginResponse extends AuthResponse {}
export interface SignupResponse extends AuthResponse {}

// Enhanced Error types
export interface ApiError extends Error {
  code: string;
  details: Record<string, any>;
  status?: number;
}

export interface StandardError {
  code: string;
  message: string;
  details: Record<string, any>;
  timestamp: string;
}

export interface ErrorResponse {
  error: StandardError;
}