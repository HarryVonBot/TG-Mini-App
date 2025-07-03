import React, { useState, useEffect } from 'react';
import { MobileLayout } from '../layout/MobileLayout';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { useMembership } from '../../hooks/useMembership';
import { apiService } from '../../services/api';

interface InvestmentPlan {
  id: string;
  name: string;
  description: string;
  membership_level: string;
  rate: number;
  term_days: number;
  min_amount: number;
  max_amount: number;
  emoji: string;
}

interface VonVaultWallet {
  network: string;
  token: string;
  address: string;
  qr_code_data: string;
  network_info: {
    name: string;
    currency: string;
    avg_fee_usd: number;
  };
}

interface MakeNewInvestmentScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string) => void;
}

export const MakeNewInvestmentScreen: React.FC<MakeNewInvestmentScreenProps> = ({ onBack, onNavigate }) => {
  const [amount, setAmount] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('polygon');
  const [selectedToken, setSelectedToken] = useState<string>('usdc');
  const [investmentPlans, setInvestmentPlans] = useState<InvestmentPlan[]>([]);
  const [vonvaultWallets, setVonvaultWallets] = useState<{[key: string]: VonVaultWallet}>({});
  const [loading, setLoading] = useState(true);
  const [depositStep, setDepositStep] = useState(false);
  const { t } = useLanguage();
  const { user, membershipStatus } = useApp();
  const { membershipTier, availableFunds } = useMembership();

  useEffect(() => {
    loadInvestmentData();
  }, []);

  const loadInvestmentData = async () => {
    try {
      setLoading(true);
      
      // Load user's current membership status to get available plans
      // IMPORTANT: Investment rates are based on user's CURRENT membership tier
      // Once a user achieves a tier, ALL investments qualify for that tier's rates
      const membershipResponse = await apiService.getMembershipStatus(user?.token || '');
      
      // Get available plans for user's CURRENT membership level (not investment amount)
      const availablePlans = membershipResponse?.available_plans || [];
      
      // Convert to our format and add emojis - these are plans for user's current tier
      const formattedPlans: InvestmentPlan[] = availablePlans.map((plan: any) => ({
        ...plan,
        emoji: getMembershipEmoji(plan.membership_level)
      }));
      
      setInvestmentPlans(formattedPlans);
      
      // Set default plan if user has plans available
      if (formattedPlans.length > 0) {
        setSelectedPlan(formattedPlans[0].id);
      }
      
      // Load VonVault deposit addresses for multi-network support
      const addressesResponse = await apiService.getCryptoDepositAddresses(user?.token || '');
      const walletData: {[key: string]: VonVaultWallet} = {};
      
      // Process deposit addresses for each token and network
      for (const token of ['usdc', 'usdt']) {
        for (const network of ['ethereum', 'polygon', 'bsc']) {
          const key = `${token}_${network}`;
          if (addressesResponse?.addresses?.[token]?.[network]) {
            walletData[key] = addressesResponse.addresses[token][network];
          }
        }
      }
      
      setVonvaultWallets(walletData);
      
    } catch (error) {
      console.error('Error loading investment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMembershipEmoji = (level: string): string => {
    const emojiMap: {[key: string]: string} = {
      'basic': '🌱',
      'club': '🥉', 
      'premium': '🥈',
      'vip': '🥇',
      'elite': '💎'
    };
    return emojiMap[level] || '💰';
  };

  const getNetworkDisplayName = (network: string): string => {
    const names: {[key: string]: string} = {
      'ethereum': 'Ethereum',
      'polygon': 'Polygon',
      'bsc': 'BSC (BNB Chain)'
    };
    return names[network] || network;
  };

  const getCurrentVonVaultWallet = (): VonVaultWallet | null => {
    const key = `${selectedToken}_${selectedNetwork}`;
    return vonvaultWallets[key] || null;
  };

  const getSelectedPlanDetails = (): InvestmentPlan | null => {
    return investmentPlans.find(plan => plan.id === selectedPlan) || null;
  };

  const calculateProjectedReturns = (): number => {
    const plan = getSelectedPlanDetails();
    const investAmount = parseFloat(amount) || 0;
    if (!plan || !investAmount) return 0;
    
    return (investAmount * plan.rate / 100) * (plan.term_days / 365);
  };

  const calculateNetInvestmentAmount = (): number => {
    const grossAmount = parseFloat(amount) || 0;
    const conversionFee = grossAmount * 0.03; // 3% conversion fee for FIAT integration
    return grossAmount - conversionFee;
  };

  const calculateConversionFee = (): number => {
    const grossAmount = parseFloat(amount) || 0;
    return grossAmount * 0.03; // 3% conversion fee
  };

  const calculateNetProjectedReturns = (): number => {
    const plan = getSelectedPlanDetails();
    const netInvestmentAmount = calculateNetInvestmentAmount();
    if (!plan || !netInvestmentAmount) return 0;
    
    return (netInvestmentAmount * plan.rate / 100) * (plan.term_days / 365);
  };

  const validateInvestmentAmount = (): { isValid: boolean; message: string } => {
    const plan = getSelectedPlanDetails();
    const investAmount = parseFloat(amount) || 0;
    
    if (!plan) return { isValid: false, message: 'Please select an investment plan' };
    if (investAmount <= 0) return { isValid: false, message: 'Please enter a valid amount' };
    if (investAmount < plan.min_amount) {
      return { isValid: false, message: `Minimum investment: $${plan.min_amount.toLocaleString()}` };
    }
    if (investAmount > plan.max_amount) {
      return { isValid: false, message: `Maximum investment: $${plan.max_amount.toLocaleString()}` };
    }
    if (investAmount > availableFunds) {
      return { isValid: false, message: `Insufficient funds. Available: $${availableFunds.toLocaleString()}` };
    }
    
    return { isValid: true, message: '' };
  };

  const handleProceedToDeposit = () => {
    const validation = validateInvestmentAmount();
    if (!validation.isValid) return;
    setDepositStep(true);
  };

  const handleCompleteInvestment = async () => {
    try {
      // Create the investment with user's current membership tier rates
      const investmentData = {
        plan_id: selectedPlan,
        amount: parseFloat(amount),
        network: selectedNetwork,
        token: selectedToken,
        membership_tier: membershipTier // Use current membership tier for rates
      };
      
      // Call investment creation API
      await apiService.createInvestment(user?.token || '', investmentData);
      
      // Navigate to completion screen to monitor deposit
      onNavigate?.('investment-completion');
    } catch (error) {
      console.error('Error creating investment:', error);
    }
  };

  if (loading) {
    return (
      <MobileLayout centered maxWidth="xs">
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-300">{t('loading.investmentOptions', 'Loading investment options...')}</p>
        </div>
      </MobileLayout>
    );
  }

  const validation = validateInvestmentAmount();
  const selectedPlanDetails = getSelectedPlanDetails();

  return (
    <MobileLayout centered maxWidth="xs">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={depositStep ? () => setDepositStep(false) : onBack} 
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          ←
        </button>
      </div>
      
      {!depositStep ? (
        /* Investment Plan Selection & Amount Entry */
        <div>
          <div className="mb-6">
            <div className="text-6xl mb-4 text-center">💰</div>
            <h1 className="text-2xl font-bold text-center mb-2">
              {t('investment.title', 'New Investment')}
            </h1>
            <p className="text-gray-400 text-center text-sm">
              {t('investment.membershipRates', 'Rates based on your')} <span className="text-purple-400 font-medium">{membershipTier?.toUpperCase()} membership</span>
            </p>
          </div>

          {/* Investment Plans - Based on Current Membership Tier */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-medium text-white">
              {t('investment.availablePlans', 'Available Investment Plans')}
            </h3>
            
            {investmentPlans.length > 0 ? (
              investmentPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all ${
                    selectedPlan === plan.id 
                      ? 'ring-2 ring-purple-500 bg-purple-500/10' 
                      : 'hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{plan.emoji}</span>
                      <div>
                        <div className="font-medium text-white">{plan.name}</div>
                        <div className="text-sm text-gray-400">{plan.description}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold">{plan.rate}% APY</div>
                      <div className="text-xs text-gray-500">{plan.term_days} days</div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Min: ${plan.min_amount.toLocaleString()}</span>
                      <span className="text-gray-400">Max: ${plan.max_amount.toLocaleString()}</span>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card>
                <div className="text-center py-4">
                  <div className="text-yellow-500 text-2xl mb-2">⚠️</div>
                  <p className="text-gray-300">{t('investment.noPlansAvailable', 'No investment plans available for your membership tier.')}</p>
                </div>
              </Card>
            )}
          </div>

          {/* Investment Amount */}
          {selectedPlanDetails && (
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium text-white">
                {t('investment.enterAmount', 'Investment Amount')}
              </h3>
              
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-8 text-lg font-medium h-14"
                />
              </div>
              
              {!validation.isValid && amount && (
                <p className="text-red-400 text-sm">{validation.message}</p>
              )}

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[selectedPlanDetails.min_amount, selectedPlanDetails.min_amount * 2, selectedPlanDetails.min_amount * 5].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount.toString())}
                    className="py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm rounded-lg transition-colors"
                  >
                    ${quickAmount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projected Returns */}
          {selectedPlanDetails && amount && validation.isValid && (
            <Card className="mb-6 bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                📈 {t('investment.projectedReturns', 'Projected Returns')}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{t('investment.grossAmount', 'Gross Amount')}:</span>
                  <span className="text-white font-medium">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{t('investment.conversionFee', 'Conversion Fee (3%)')}:</span>
                  <span className="text-red-400">-${calculateConversionFee().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                  <span className="text-gray-400">{t('investment.netInvestment', 'Net Investment')}:</span>
                  <span className="text-blue-400 font-medium">${calculateNetInvestmentAmount().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{t('investment.projectedReturn', 'Projected Return')}:</span>
                  <span className="text-green-400 font-bold">+${calculateNetProjectedReturns().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center border-t border-gray-700 pt-2">
                  <span className="text-white font-medium">{t('investment.totalReturn', 'Total at Maturity')}:</span>
                  <span className="text-white font-bold">${(calculateNetInvestmentAmount() + calculateNetProjectedReturns()).toFixed(2)}</span>
                </div>
              </div>
            </Card>
          )}

          {/* Action Button */}
          <Button
            onClick={handleProceedToDeposit}
            disabled={!validation.isValid || !selectedPlan}
            fullWidth
            className="h-12"
          >
            {t('investment.proceedToDeposit', 'Proceed to Deposit')}
          </Button>
        </div>
      ) : (
        /* Deposit Step */
        <div>
          <div className="mb-6">
            <div className="text-6xl mb-4 text-center">🏦</div>
            <h1 className="text-2xl font-bold text-center mb-2">
              {t('investment.depositFunds', 'Deposit Funds')}
            </h1>
            <p className="text-gray-400 text-center text-sm">
              {t('investment.depositInstructions', 'Send your crypto to complete the investment')}
            </p>
          </div>

          {/* Network & Token Selection */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('investment.selectNetwork', 'Select Network')}
              </label>
              <select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500"
              >
                <option value="polygon">Polygon (MATIC) - Low Fees</option>
                <option value="ethereum">Ethereum (ETH) - Most Secure</option>
                <option value="bsc">BSC (BNB) - Fast & Cheap</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('investment.selectToken', 'Select Token')}
              </label>
              <select
                value={selectedToken}
                onChange={(e) => setSelectedToken(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-purple-500"
              >
                <option value="usdc">USDC - USD Coin</option>
                <option value="usdt">USDT - Tether</option>
              </select>
            </div>
          </div>

          {/* Investment Summary */}
          <Card className="mb-6">
            <h3 className="text-white font-medium mb-3">
              {t('investment.summary', 'Investment Summary')}
            </h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">{t('investment.plan', 'Plan')}:</span>
                <span className="text-white">{selectedPlanDetails?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('investment.amount', 'Amount')}:</span>
                <span className="text-white font-bold">${parseFloat(amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('investment.rate', 'Rate')}:</span>
                <span className="text-green-400">{selectedPlanDetails?.rate}% APY</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t('investment.network', 'Network')}:</span>
                <span className="text-purple-400">{getNetworkDisplayName(selectedNetwork)}</span>
              </div>
            </div>
          </Card>

          {/* Deposit Address */}
          {getCurrentVonVaultWallet() && (
            <Card className="mb-6 bg-yellow-500/10 border-yellow-500/20">
              <h3 className="text-yellow-400 font-medium mb-3 flex items-center gap-2">
                ⚠️ {t('investment.depositAddress', 'VonVault Deposit Address')}
              </h3>
              
              <div className="bg-gray-900 rounded-lg p-3 mb-3">
                <div className="text-xs text-gray-400 mb-1">
                  {selectedToken.toUpperCase()} Address ({getNetworkDisplayName(selectedNetwork)}):
                </div>
                <div className="font-mono text-sm text-purple-300 break-all">
                  {getCurrentVonVaultWallet()?.address}
                </div>
              </div>

              {/* QR Code Placeholder */}
              <div className="bg-white rounded-lg p-4 text-center mb-3">
                <div className="text-gray-800 text-sm font-medium">QR Code</div>
                <div className="text-xs text-gray-600 mt-1">
                  {getCurrentVonVaultWallet()?.qr_code_data}
                </div>
              </div>

              <div className="text-xs text-yellow-300">
                <strong>⚠️ Important:</strong> Only send {selectedToken.toUpperCase()} tokens on {getNetworkDisplayName(selectedNetwork)} network to this address. 
                A 3% conversion fee will be deducted for FIAT integration.
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleCompleteInvestment}
              fullWidth
              className="h-12 bg-green-600 hover:bg-green-700"
            >
              {t('investment.confirmDeposit', 'I have sent the deposit')}
            </Button>
            
            <Button
              onClick={() => setDepositStep(false)}
              variant="outline"
              fullWidth
              className="h-12 border-gray-600"
            >
              {t('investment.backToPlan', 'Back to Plan Selection')}
            </Button>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};