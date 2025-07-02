import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card } from '../common/Card';
import { MobileLayout } from '../layout/MobileLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
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

export const MakeNewInvestmentScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
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

  useEffect(() => {
    loadInvestmentData();
  }, []);

  const loadInvestmentData = async () => {
    try {
      setLoading(true);
      
      // Load membership tiers and available plans
      const membershipResponse = await apiService.getMembershipStatus(user?.token || '');
      const plans = membershipResponse?.available_plans || [];
      
      // Convert to our format and add emojis
      const formattedPlans: InvestmentPlan[] = plans.map((plan: any) => ({
        ...plan,
        emoji: getMembershipEmoji(plan.membership_level)
      }));
      
      setInvestmentPlans(formattedPlans);
      
      // Set default plan if user has plans available
      if (formattedPlans.length > 0) {
        setSelectedPlan(formattedPlans[0].id);
      }
      
      // Load VonVault deposit addresses
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
    const conversionFee = grossAmount * 0.03; // 3% conversion fee
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

  const handleProceedToDeposit = () => {
    if (!amount || !selectedPlan) return;
    setDepositStep(true);
  };

  const handleCompleteInvestment = async () => {
    try {
      // Here you would call the investment creation API
      // For now, navigate back to investments screen
      onNavigate?.('investments');
    } catch (error) {
      console.error('Error creating investment:', error);
    }
  };

  if (loading) {
    return (
      <MobileLayout centered maxWidth="xs">
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-300">Loading investment options...</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout centered maxWidth="xs">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={depositStep ? () => setDepositStep(false) : onBack} 
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      {!depositStep ? (
        /* Investment Plan Selection */
        <div>
          <div className="mb-6">
            <div className="text-6xl mb-4 text-center">💰</div>
            <h1 className="text-2xl font-bold text-center mb-2">
              {t('investment.title', 'New Investment')}
            </h1>
            <p className="text-center text-sm text-gray-400">
              {t('investment.subtitle', 'Choose your investment plan and earn guaranteed returns')}
            </p>
          </div>

          <div className="w-full space-y-6">
            {/* Investment Plans */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-gray-300">
                {t('investment.availablePlans', 'Available Investment Plans')}
              </h2>

              {/* Important Notice - Stablecoins & Fees */}
              <Card className="bg-blue-900/20 border-blue-500/30">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400 text-xl">ℹ️</div>
                  <div>
                    <h4 className="text-blue-400 font-semibold mb-2">
                      {t('investment.importantNotice', 'Important Investment Information')}
                    </h4>
                    <div className="text-sm text-blue-200 space-y-1">
                      <div>• {t('investment.stablecoinsOnly', 'Only USDC or USDT stablecoins are accepted for investments')}</div>
                      <div>• {t('investment.conversionFee', 'All crypto deposits incur a 3% conversion fee to FIAT for investment integration')}</div>
                      <div>• {t('investment.finalAmount', 'Your final investment amount will be deposit amount minus 3% conversion fee')}</div>
                    </div>
                  </div>
                </div>
              </Card>
              
              {investmentPlans.length === 0 ? (
                <Card className="bg-orange-900/20 border-orange-500/30 text-center">
                  <div className="text-orange-400 mb-2">⚠️</div>
                  <p className="text-orange-200 text-sm">
                    {t('investment.noPlans', 'No investment plans available for your membership level. Please upgrade your membership or contact support.')}
                  </p>
                </Card>
              ) : (
                investmentPlans.map((plan) => (
                  <Card
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`cursor-pointer transition-all ${
                      selectedPlan === plan.id
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{plan.emoji}</span>
                          <span className="font-semibold text-white">{plan.name}</span>
                        </div>
                        <div className="text-sm text-gray-400 mb-2">{plan.description}</div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Min: ${plan.min_amount.toLocaleString()}</span>
                          <span>Max: ${plan.max_amount.toLocaleString()}</span>
                          <span>{plan.term_days} days</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">{plan.rate}% APY</div>
                        <div className="text-xs text-gray-500">
                          {plan.term_days === 365 ? '1 Year' : `${Math.round(plan.term_days/30)} Months`}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Investment Amount */}
            {investmentPlans.length > 0 && (
              <>
                <div className="space-y-3">
                  <Input
                    label={t('investment.amount', 'Investment Amount')}
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={getSelectedPlanDetails()?.min_amount.toString() || "0"}
                    prefix="$"
                  />
                  
                  {getSelectedPlanDetails() && amount && (
                    <Card className="bg-green-900/20 border-green-500/30">
                      <div className="text-center space-y-3">
                        <div className="text-green-400 font-semibold">
                          💵 Investment Breakdown
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Deposit Amount:</span>
                            <span className="text-white">${parseFloat(amount).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Conversion Fee (3%):</span>
                            <span className="text-red-400">-${calculateConversionFee().toLocaleString()}</span>
                          </div>
                          <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
                            <span className="text-green-400">Net Investment:</span>
                            <span className="text-green-400">${calculateNetInvestmentAmount().toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="border-t border-gray-600 pt-3">
                          <div className="text-lg font-bold text-white">
                            ${calculateNetProjectedReturns().toLocaleString()}
                          </div>
                          <div className="text-sm text-green-200">
                            Projected Returns • Total after {getSelectedPlanDetails()?.term_days} days: ${(calculateNetInvestmentAmount() + calculateNetProjectedReturns()).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}
                </div>

                <Button 
                  onClick={handleProceedToDeposit}
                  disabled={!amount || !selectedPlan || parseFloat(amount) < (getSelectedPlanDetails()?.min_amount || 0)}
                  fullWidth
                  className="h-12"
                >
                  {t('investment.proceedToDeposit', 'Proceed to Deposit')}
                </Button>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Deposit Step - Transfer to VonVault */
        <div>
          <div className="mb-6">
            <div className="text-6xl mb-4 text-center">📥</div>
            <h1 className="text-2xl font-bold text-center mb-2">
              {t('investment.depositTitle', 'Transfer to VonVault')}
            </h1>
            <p className="text-center text-sm text-gray-400">
              {t('investment.depositSubtitle', 'Send your crypto to VonVault to complete the investment')}
            </p>
          </div>

          <div className="w-full space-y-6">
            {/* Investment Summary */}
            <Card className="bg-purple-900/20 border-purple-500/30">
              <h3 className="font-semibold text-white mb-3">Investment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Plan:</span>
                  <span className="text-white">{getSelectedPlanDetails()?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Deposit Amount:</span>
                  <span className="text-white">${parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Conversion Fee (3%):</span>
                  <span className="text-red-400">-${calculateConversionFee().toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
                  <span className="text-gray-400">Net Investment:</span>
                  <span className="text-green-400">${calculateNetInvestmentAmount().toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">APY:</span>
                  <span className="text-green-400">{getSelectedPlanDetails()?.rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Projected Returns:</span>
                  <span className="text-green-400">${calculateNetProjectedReturns().toLocaleString()}</span>
                </div>
              </div>
            </Card>

            {/* Network Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-300">Choose Network</h3>
              <div className="grid grid-cols-1 gap-2">
                {['polygon', 'ethereum', 'bsc'].map((network) => (
                  <Card
                    key={network}
                    onClick={() => setSelectedNetwork(network)}
                    className={`cursor-pointer transition-all ${
                      selectedNetwork === network
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-white">{getNetworkDisplayName(network)}</span>
                      <span className="text-sm text-gray-400">
                        ~${vonvaultWallets[`usdc_${network}`]?.network_info?.avg_fee_usd || 'N/A'} fee
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Token Selection */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-300">Choose Token</h3>
              <div className="grid grid-cols-2 gap-2">
                {['usdc', 'usdt'].map((token) => (
                  <Card
                    key={token}
                    onClick={() => setSelectedToken(token)}
                    className={`cursor-pointer transition-all ${
                      selectedToken === token
                        ? 'border-purple-500 bg-purple-900/20'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-center">
                      <div className="font-medium text-white">{token.toUpperCase()}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* VonVault Deposit Address */}
            {getCurrentVonVaultWallet() && (
              <Card className="bg-gray-800/50 border-gray-600">
                <h3 className="font-semibold text-white mb-3">
                  VonVault {selectedToken.toUpperCase()} Address ({getNetworkDisplayName(selectedNetwork)})
                </h3>
                
                <div className="bg-gray-900 rounded-lg p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-1">Deposit Address:</div>
                  <div className="font-mono text-sm text-purple-300 break-all">
                    {getCurrentVonVaultWallet()?.address}
                  </div>
                </div>

                {/* QR Code would go here */}
                <div className="bg-white rounded-lg p-4 text-center mb-3">
                  <div className="text-gray-800 text-sm">QR Code</div>
                  <div className="text-xs text-gray-600">
                    {getCurrentVonVaultWallet()?.qr_code_data}
                  </div>
                </div>

                <div className="text-xs text-gray-400">
                  ⚠️ <strong>Important:</strong> Only send {selectedToken.toUpperCase()} tokens on {getNetworkDisplayName(selectedNetwork)} network to this address. 
                  A 3% conversion fee will be deducted from your deposit for FIAT integration into the investment system.
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
        </div>
      )}
    </MobileLayout>
  );
};