import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';
import { useLanguage } from '../../hooks/useLanguage';
import { type Web3ModalConnection } from '../../services/Web3ModalService';

interface WalletBalance {
  walletName: string;
  walletIcon: string;
  address: string;
  usdt: number;
  usdc: number;
  total: number;
}

interface InvestmentTier {
  name: string;
  emoji: string;
  minAmount: number;
  maxAmount: number;
  apy: number;
  description: string;
}

interface MultiWalletPortfolioProps {
  connectedWallets: Web3ModalConnection[];
  onMakeInvestment: () => void;
}

export const MultiWalletPortfolio: React.FC<MultiWalletPortfolioProps> = ({
  connectedWallets,
  onMakeInvestment
}) => {
  const { t } = useLanguage();
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);

  // Investment tiers from VonVault membership system (CORRECTED)
  const investmentTiers: InvestmentTier[] = [
    {
      name: 'Basic',
      emoji: '🌱',
      minAmount: 100,
      maxAmount: 4999,
      apy: 3.0,
      description: 'Start your investment journey with low minimums'
    },
    {
      name: 'Club',
      emoji: '🥉',
      minAmount: 20000,
      maxAmount: 49999,
      apy: 6.0,
      description: 'Entry-level membership with solid returns'
    },
    {
      name: 'Premium',
      emoji: '🥈',
      minAmount: 50000,
      maxAmount: 99999,
      apy: 10.0,
      description: 'Enhanced returns with flexible lock periods'
    },
    {
      name: 'VIP',
      emoji: '🥇',
      minAmount: 100000,
      maxAmount: 249999,
      apy: 14.0,
      description: 'Premium rates with exclusive VIP treatment'
    },
    {
      name: 'Elite',
      emoji: '💎',
      minAmount: 250000,
      maxAmount: Infinity,
      apy: 20.0,
      description: 'Highest rates with unlimited investment capacity'
    }
  ];

  useEffect(() => {
    fetchWalletBalances();
  }, [connectedWallets]);

  const fetchWalletBalances = async () => {
    setLoading(true);
    
    try {
      // For now, simulate USDT/USDC balances
      // In production, you'd fetch real balances from blockchain
      const balances: WalletBalance[] = await Promise.all(
        connectedWallets.map(async (wallet) => {
          // Simulate realistic balances for demo
          const baseAmount = Math.random() * 10000 + 1000; // $1K - $11K
          const usdt = Math.round(baseAmount * 0.6 * 100) / 100;
          const usdc = Math.round(baseAmount * 0.4 * 100) / 100;
          
          return {
            walletName: wallet.walletInfo?.name || 'Connected Wallet',
            walletIcon: wallet.walletInfo?.icon || '🔗',
            address: wallet.address,
            usdt,
            usdc,
            total: usdt + usdc
          };
        })
      );

      setWalletBalances(balances);
      setTotalAvailable(balances.reduce((sum, wallet) => sum + wallet.total, 0));
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQualifiedTier = () => {
    return investmentTiers.find(tier => totalAvailable >= tier.minAmount);
  };

  const getNextTier = () => {
    const currentTier = getQualifiedTier();
    if (!currentTier) return investmentTiers[0]; // Club tier
    
    const currentIndex = investmentTiers.findIndex(tier => tier.name === currentTier.name);
    return investmentTiers[currentIndex + 1] || null;
  };

  const getInvestmentGuidance = () => {
    const qualifiedTier = getQualifiedTier();
    const nextTier = getNextTier();

    if (!qualifiedTier) {
      // This shouldn't happen since Basic starts at $100, but handle gracefully
      return {
        status: 'needMore',
        message: `Add $${(100 - totalAvailable).toLocaleString()} more to start investing`,
        tier: investmentTiers[0], // Basic tier
        canInvest: false
      };
    }

    // Special handling for Basic tier (users can always invest something)
    if (qualifiedTier.name === 'Basic' && totalAvailable >= 100) {
      return {
        status: 'canInvest',
        message: `You can invest up to $${Math.min(totalAvailable, 4999).toLocaleString()}`,
        tier: qualifiedTier,
        nextTier,
        canInvest: true
      };
    }

    return {
      status: 'canInvest',
      message: `You can invest up to $${totalAvailable.toLocaleString()}`,
      tier: qualifiedTier,
      nextTier,
      canInvest: true
    };
  };

  const guidance = getInvestmentGuidance();

  if (loading) {
    return (
      <Card className="bg-gray-800/50 border-gray-600">
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-300">Loading wallet balances...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connected Wallets Portfolio */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-2">
              📱 {t('portfolio.connectedWallets', 'Connected Wallets')} ({walletBalances.length})
            </h2>
          </div>

          {/* Individual Wallets */}
          <div className="space-y-4">
            {walletBalances.map((wallet, index) => (
              <motion.div
                key={wallet.address}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/30 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{wallet.walletIcon}</span>
                    <div>
                      <div className="font-semibold text-white">{wallet.walletName}</div>
                      <div className="text-xs text-gray-400 font-mono">
                        {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">USDT</div>
                    <div className="font-semibold text-green-400">
                      ${wallet.usdt.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">USDC</div>
                    <div className="font-semibold text-blue-400">
                      ${wallet.usdc.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Total</div>
                    <div className="font-semibold text-white">
                      ${wallet.total.toLocaleString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Total Available */}
          <div className="border-t border-gray-600 pt-4">
            <div className="text-center">
              <div className="text-gray-400 mb-1">Total Available for Investment</div>
              <div className="text-3xl font-bold text-purple-400">
                💎 ${totalAvailable.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Investment Guidance Banner */}
      <Card className={`border-2 ${
        guidance.canInvest 
          ? 'bg-green-900/20 border-green-500/50' 
          : 'bg-orange-900/20 border-orange-500/50'
      }`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <h3 className="text-lg font-bold text-white">
              {t('portfolio.investmentOptions', 'Available Investment Options')}
            </h3>
          </div>
          
          <div className="text-sm text-gray-300">
            {t('portfolio.basedOnBalance', 'Based on Your Connected Wallet Balances')}
          </div>

          {guidance.canInvest ? (
            <div className="space-y-4">
              {/* Current Tier */}
              <div className="bg-green-800/20 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{guidance.tier.emoji}</span>
                    <span className="font-semibold text-green-400">
                      {guidance.tier.name} Tier Available
                    </span>
                  </div>
                  <div className="text-green-400 font-bold">
                    {guidance.tier.apy}% APY
                  </div>
                </div>
                
                <div className="text-sm text-green-200 mb-3">
                  {guidance.tier.description}
                </div>
                
                <div className="text-sm text-gray-300">
                  💰 {guidance.message} • Minimum: ${guidance.tier.minAmount.toLocaleString()}
                </div>
              </div>

              {/* Next Tier Preview */}
              {guidance.nextTier && (
                <div className="bg-purple-800/20 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{guidance.nextTier.emoji}</span>
                      <span className="font-semibold text-purple-400">
                        Upgrade to {guidance.nextTier.name} Tier
                      </span>
                    </div>
                    <div className="text-purple-400 font-bold">
                      {guidance.nextTier.apy}% APY
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-300">
                    🎯 Add ${(guidance.nextTier.minAmount - totalAvailable).toLocaleString()} more to unlock {guidance.nextTier.apy}% APY
                  </div>
                </div>
              )}

              {/* Potential Returns Calculator */}
              <div className="bg-blue-800/20 rounded-lg p-4">
                <div className="text-center">
                  <div className="text-blue-400 font-semibold mb-1">
                    💵 Potential Annual Returns
                  </div>
                  <div className="text-2xl font-bold text-white">
                    ${(totalAvailable * guidance.tier.apy / 100).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-200">
                    If you invest ${totalAvailable.toLocaleString()} at {guidance.tier.apy}% APY
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-orange-800/20 rounded-lg p-4">
              <div className="text-orange-400 font-semibold mb-2">
                {guidance.message}
              </div>
              <div className="text-sm text-orange-200">
                Minimum investment: ${guidance.tier.minAmount.toLocaleString()} for {guidance.tier.name} tier ({guidance.tier.apy}% APY)
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={onMakeInvestment}
          disabled={!guidance.canInvest}
          className={`h-14 text-lg font-semibold px-8 ${
            guidance.canInvest
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {guidance.canInvest ? (
            <>🚀 {t('portfolio.makeInvestment', 'Make New Investment')}</>
          ) : (
            <>📝 {t('portfolio.addFunds', 'Add More Funds to Invest')}</>
          )}
        </Button>
        
        {guidance.canInvest && (
          <div className="mt-2 text-sm text-gray-400">
            Ready to earn {guidance.tier.apy}% APY • Start with any amount up to ${totalAvailable.toLocaleString()}
          </div>
        )}
      </div>
    </div>
  );
};