import React, { useState, useEffect } from 'react';
import type { ScreenProps, Portfolio } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { motion } from 'framer-motion';

export const DashboardScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [cryptoSummary, setCryptoSummary] = useState<any>(null);
  const [investmentOpportunities, setInvestmentOpportunities] = useState<any[]>([]);
  const { t } = useLanguage();
  
  const { 
    portfolio, 
    fetchPortfolio, 
    membershipStatus, 
    fetchMembershipStatus, 
    user,
    connected_wallets,
    primary_wallet
  } = useApp();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPortfolio(),
        fetchMembershipStatus(),
        loadCryptoSummary(),
        loadInvestmentOpportunities()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCryptoSummary = async () => {
    try {
      // Simulate connected wallet data (in production, fetch from connected wallets)
      if (user?.crypto_connected) {
        const summary = {
          totalBalance: user?.total_crypto_value || 0,
          walletCount: user?.connected_wallets_count || 0,
          topToken: 'USDC',
          readyToInvest: user?.total_crypto_value || 0
        };
        setCryptoSummary(summary);
      }
    } catch (error) {
      console.error('Error loading crypto summary:', error);
    }
  };

  const loadInvestmentOpportunities = async () => {
    try {
      // CORRECTED: Use user's current membership level for opportunities
      const currentMembershipLevel = membershipStatus?.level_name?.toLowerCase() || 'basic';
      const currentMembershipAPY = membershipStatus?.current_apy || 3;
      const totalAvailable = (user?.total_crypto_value || 0) + (portfolio?.available_funds || 0);
      
      const opportunities = [];
      
      // Always show current membership benefits if they have available funds
      if (totalAvailable >= 100) {
        const membershipEmoji = membershipStatus?.emoji || '🌱';
        opportunities.push({
          id: 'current_tier',
          title: `${membershipStatus?.level_name || 'Basic'} Member Investment`,
          description: `Add to your portfolio with ${currentMembershipAPY}% APY`,
          apy: `${currentMembershipAPY}%`,
          action: 'Invest Now',
          highlight: true,
          membershipBased: true
        });
      }
      
      // Show upgrade opportunity if next tier is available
      if (membershipStatus?.next_level && membershipStatus?.amount_to_next) {
        const nextTierAPY = membershipStatus.next_level_apy || (currentMembershipAPY + 2);
        opportunities.push({
          id: 'tier_upgrade',
          title: `Upgrade to ${membershipStatus.next_level_name}`,
          description: `Invest $${membershipStatus.amount_to_next.toLocaleString()} more to unlock ${nextTierAPY}% APY`,
          apy: `${nextTierAPY}%`,
          action: 'Upgrade',
          highlight: false,
          membershipBased: true
        });
      }
      
      // Show crypto connection opportunity if no crypto connected
      if (!user?.crypto_connected && totalAvailable < 100) {
        opportunities.push({
          id: 'connect_crypto',
          title: 'Connect Crypto Wallets',
          description: 'Transfer from your crypto wallets for instant investments',
          apy: `${currentMembershipAPY}%+ APY`,
          action: 'Connect Now',
          highlight: false,
          membershipBased: true
        });
      }
      
      setInvestmentOpportunities(opportunities);
    } catch (error) {
      console.error('Error loading investment opportunities:', error);
    }
  };

  if (loading) {
    return <FullScreenLoader text="Loading dashboard..." />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-2">
          {t('dashboard.welcome', 'Welcome back')}{user?.firstName ? `, ${user.firstName}` : ''}
        </h1>
        <p className="text-gray-400 text-sm">
          {t('dashboard.subtitle', 'Manage your DeFi portfolio and investments')}
        </p>
      </motion.div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 gap-4">
        {/* Total Portfolio Value */}
        {portfolio && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/30 text-center">
              <div className="text-3xl font-bold text-purple-300 mb-2">
                ${portfolio.total_portfolio?.toLocaleString() || '0'}
              </div>
              <div className="text-gray-400 text-sm mb-3">
                {t('dashboard.portfolioValue', 'Total Portfolio Value')}
              </div>
              
              {portfolio.total_profit !== undefined && (
                <div className={`text-sm ${portfolio.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {portfolio.total_profit >= 0 ? '+' : ''}${portfolio.total_profit.toLocaleString()} 
                  ({portfolio.total_profit >= 0 ? '+' : ''}{((portfolio.total_profit / (portfolio.total_portfolio - portfolio.total_profit)) * 100).toFixed(1)}%)
                </div>
              )}
            </Card>
          </motion.div>
        )}

        {/* Crypto Wallet Summary */}
        {user?.crypto_connected && cryptoSummary && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-green-400">
                    💰 Connected Crypto Wallets
                  </h3>
                  <div className="text-sm text-gray-400">
                    {cryptoSummary.walletCount} wallet{cryptoSummary.walletCount !== 1 ? 's' : ''} connected
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-green-400">
                    ${cryptoSummary.totalBalance.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400">Ready to invest</div>
                </div>
              </div>
              
              <Button
                onClick={() => onNavigate?.('new-investment')}
                fullWidth
                className="bg-green-600 hover:bg-green-700 h-10"
              >
                🚀 Transfer & Invest Now
              </Button>
            </Card>
          </motion.div>
        )}
      </div>

      {/* Investment Opportunities */}
      {investmentOpportunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h2 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
            <span>✨</span>
            {t('dashboard.opportunities', 'Investment Opportunities')}
          </h2>
          
          <div className="space-y-3">
            {investmentOpportunities.map((opportunity, index) => (
              <motion.div
                key={opportunity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card 
                  className={`cursor-pointer transition-all hover:scale-[1.02] ${
                    opportunity.highlight 
                      ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/50' 
                      : 'bg-gray-800/50 border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => onNavigate?.('new-investment')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {opportunity.title}
                      </h3>
                      <p className="text-sm text-gray-400 mb-2">
                        {opportunity.description}
                      </p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                          {opportunity.apy} APY
                        </span>
                        {opportunity.highlight && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={opportunity.highlight ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'}
                    >
                      {opportunity.action}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-gray-300">
          {t('dashboard.quickActions', 'Quick Actions')}
        </h2>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onNavigate?.('new-investment')}
            className="h-16 bg-purple-600 hover:bg-purple-700 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">💰</span>
            <span className="text-sm">{t('dashboard.invest', 'New Investment')}</span>
          </Button>
          
          <Button
            onClick={() => onNavigate?.('investments')}
            variant="outline"
            className="h-16 border-gray-600 flex flex-col items-center justify-center"
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-sm">{t('dashboard.portfolio', 'My Investments')}</span>
          </Button>
        </div>

        {/* Crypto Wallet Management */}
        <Button
          onClick={() => onNavigate?.(user?.crypto_connected ? 'crypto' : 'connect-crypto')}
          variant="outline"
          className={`w-full h-12 transition-all ${
            user?.crypto_connected 
              ? 'border-green-500 text-green-400 hover:bg-green-500/10' 
              : 'border-orange-500 text-orange-400 hover:bg-orange-500/10'
          }`}
        >
          {user?.crypto_connected ? (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span>💼</span>
                <span>{t('dashboard.manageCryptoWallets', 'Manage Crypto Wallets')}</span>
                {user?.connected_wallets_count && (
                  <span className="text-xs bg-green-500/20 px-2 py-1 rounded-full">
                    {user.connected_wallets_count}
                  </span>
                )}
              </div>
              {user?.total_crypto_value && (
                <span className="text-sm font-medium">
                  ${user.total_crypto_value.toLocaleString()}
                </span>
              )}
            </div>
          ) : (
            <>
              🔗 {t('dashboard.connectWallet', 'Connect Crypto Wallet')}
            </>
          )}
        </Button>
      </motion.div>

      {/* Enhanced Membership Status */}
      {membershipStatus && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-r from-gray-900/50 to-purple-900/30 border-purple-500/30">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">
                      {membershipStatus.emoji || '🌱'}
                    </span>
                    <span className="font-semibold text-purple-300">
                      {membershipStatus.level_name || 'Basic'} Member
                    </span>
                  </div>
                  <div className="text-sm text-gray-400">
                    ${membershipStatus.total_invested?.toLocaleString() || '0'} invested
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate?.('membership-status')}
                  size="sm"
                  variant="outline"
                  className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                >
                  {t('dashboard.viewDetails', 'View Details')}
                </Button>
              </div>

              {/* Progress to Next Tier */}
              {membershipStatus.next_level && membershipStatus.amount_to_next && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Progress to {membershipStatus.next_level_name}
                    </span>
                    <span className="text-purple-400">
                      ${membershipStatus.amount_to_next.toLocaleString()} to go
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min(((membershipStatus.total_invested || 0) / ((membershipStatus.total_invested || 0) + (membershipStatus.amount_to_next || 1))) * 100, 90)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Crypto Wallet Integration Call-to-Action */}
      {!user?.crypto_connected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border-orange-500/30">
            <div className="text-center space-y-4">
              <div className="text-4xl">🚀</div>
              <div>
                <h3 className="font-semibold text-orange-400 mb-2">
                  {t('dashboard.unlockCrypto', 'Unlock Crypto Investment Power')}
                </h3>
                <p className="text-sm text-orange-200 mb-4">
                  {t('dashboard.cryptoDesc', 'Connect your crypto wallets to transfer funds directly to VonVault investments')}
                </p>
                <div className="flex items-center justify-center gap-4 text-xs text-orange-300 mb-4">
                  <span>🦊 MetaMask</span>
                  <span>🛡️ Trust Wallet</span>
                  <span>🔗 500+ Wallets</span>
                </div>
              </div>
              <Button
                onClick={() => onNavigate?.('connect-crypto')}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {t('dashboard.connectNow', 'Connect Crypto Wallets')}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};