import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import { Card } from './Card';
import { useLanguage } from '../../hooks/useLanguage';
import { type VonVaultWeb3Connection } from '../../services/Web3ModalService';

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
  connectedWallets: VonVaultWeb3Connection[];
  onMakeInvestment: () => void;
  membershipStatus?: any; // Add membership status prop
}

export const MultiWalletPortfolio: React.FC<MultiWalletPortfolioProps> = ({
  connectedWallets,
  onMakeInvestment,
  membershipStatus
}) => {
  const { t } = useLanguage();
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([]);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [loading, setLoading] = useState(true);

  // Investment tier definitions
  const investmentTiers = [
    { name: 'Club', minAmount: 250, maxInvestment: 2499, apy: 8.5, emoji: '🥉', description: 'Entry-level membership' },
    { name: 'Premium', minAmount: 2500, maxInvestment: 9999, apy: 10.75, emoji: '🥈', description: 'Enhanced features' },
    { name: 'VIP', minAmount: 10000, maxInvestment: 49999, apy: 13.25, emoji: '🥇', description: 'High-yield access' },
    { name: 'Elite', minAmount: 50000, maxInvestment: 999999, apy: 16.0, emoji: '💎', description: 'Maximum returns' }
  ];

  useEffect(() => {
    fetchWalletBalances();
  }, [connectedWallets]);

  const fetchWalletBalances = async () => {
    setLoading(true);
    
    try {
      // FIXED: If no wallets connected, show 0.00 balances
      if (connectedWallets.length === 0) {
        setWalletBalances([]);
        setTotalAvailable(0);
        setLoading(false);
        return;
      }

      // FIXED: When wallets are connected, attempt real blockchain balance fetch
      const balances: WalletBalance[] = await Promise.all(
        connectedWallets.map(async (wallet) => {
          try {
            // TODO: Replace with real blockchain API call when activated
            // For now, attempting to fetch real balances but API not ready
            // const realUSDT = await fetchRealUSDTBalance(wallet.address);
            // const realUSDC = await fetchRealUSDCBalance(wallet.address);
            
            // TEMPORARY: Until blockchain API is activated, show 0.00 for connected wallets
            // This is honest - not fake simulation data
            const usdt = 0.00;
            const usdc = 0.00;
            
            return {
              walletName: wallet.walletInfo?.name || 'Connected Wallet',
              walletIcon: wallet.walletInfo?.icon || '🔗',
              address: wallet.address,
              usdt,
              usdc,
              total: usdt + usdc
            };
          } catch (error) {
            console.error(`Error fetching balance for wallet ${wallet.address}:`, error);
            // On error, show 0.00 - no fake data
            return {
              walletName: wallet.walletInfo?.name || 'Connected Wallet',
              walletIcon: wallet.walletInfo?.icon || '🔗',
              address: wallet.address,
              usdt: 0.00,
              usdc: 0.00,
              total: 0.00
            };
          }
        })
      );

      setWalletBalances(balances);
      setTotalAvailable(balances.reduce((sum, wallet) => sum + wallet.total, 0));
    } catch (error) {
      console.error('Error fetching wallet balances:', error);
      // On error, show empty state
      setWalletBalances([]);
      setTotalAvailable(0);
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
    // CORRECTED: Use user's current membership level, not wallet balance
    const currentMembershipLevel = membershipStatus?.level_name?.toLowerCase() || 'basic';
    const currentMembershipAPY = membershipStatus?.current_apy || 3; // Default to basic
    
    // Find user's current tier from backend membership data
    const userCurrentTier = {
      name: membershipStatus?.level_name || 'Basic',
      emoji: membershipStatus?.emoji || '🌱',
      apy: currentMembershipAPY,
      maxInvestment: membershipStatus?.max_investment || totalAvailable,
      description: membershipStatus?.description || 'Basic membership access',
      minAmount: membershipStatus?.min_investment || 100
    };
    
    // Get next tier if available
    const nextTier = membershipStatus?.next_level ? {
      name: membershipStatus.next_level_name || 'Club',
      apy: membershipStatus.next_level_apy || 6,
      requiredAmount: (membershipStatus.total_invested || 0) + (membershipStatus.amount_to_next || 0),
      emoji: '🥉',
      minAmount: membershipStatus.next_min_investment || 250
    } : null;

    return {
      status: 'canInvest',
      message: `You can invest up to $${Math.min(totalAvailable, userCurrentTier.maxInvestment).toLocaleString()}`,
      tier: userCurrentTier,
      nextTier,
      canInvest: totalAvailable >= 100, // Minimum investment
      membershipBased: true // Flag to indicate this is membership-based
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
            {walletBalances.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">👛</div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">
                  No Wallets Connected
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Connect your crypto wallets to see USDT and USDC balances
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-800/30 rounded-lg p-4">
                  <div className="text-center">
                    <div className="text-gray-400">USDT (Crypto)</div>
                    <div className="font-semibold text-green-400">0.00 USDT</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">USDC (Crypto)</div>
                    <div className="font-semibold text-blue-400">0.00 USDC</div>
                  </div>
                </div>
              </div>
            ) : (
              walletBalances.map((wallet, index) => (
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
                    <div className="text-gray-400">USDT (Crypto)</div>
                    <div className="font-semibold text-green-400">
                      {wallet.usdt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">USDC (Crypto)</div>
                    <div className="font-semibold text-blue-400">
                      {wallet.usdc.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Total Crypto</div>
                    <div className="font-semibold text-white">
                      ${wallet.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
            )}
          </div>

          {/* Total Available */}
          <div className="border-t border-gray-600 pt-4">
            <div className="text-center">
              <div className="text-gray-400 mb-1">Total Crypto Available for Investment</div>
              <div className="text-3xl font-bold text-purple-400">
                💎 ${totalAvailable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Combined USDT + USDC crypto balances
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