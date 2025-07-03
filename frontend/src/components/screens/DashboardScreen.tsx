import React, { useState, useEffect } from 'react';
import type { ScreenProps, Portfolio } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { GestureNavigation } from '../common/GestureNavigation';
import { AchievementBadge, AchievementToast } from '../common/AchievementBadge';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { achievementService, type Achievement } from '../../services/AchievementService';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [cryptoSummary, setCryptoSummary] = useState<any>(null);
  const [investmentOpportunities, setInvestmentOpportunities] = useState<any[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const [showAchievementToast, setShowAchievementToast] = useState<Achievement | null>(null);
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
    checkForNewAchievements();
  }, []);

  const checkForNewAchievements = () => {
    if (user && membershipStatus) {
      // Mock investment data
      const mockInvestments = [
        { id: '1', user_id: user.id || '', name: 'Investment 1', amount: 25000, rate: 6, term: 12, status: 'active' as const, created_at: '2024-01-01' }
      ];

      const achievements = achievementService.checkAchievements(user, mockInvestments, membershipStatus);
      setRecentAchievements(achievements.slice(0, 3)); // Show latest 3

      // Check if we should show achievement toast
      const shouldShowToast = localStorage.getItem('achievementNotifications') !== 'false';
      if (shouldShowToast && achievements.length > 0) {
        // In production, you'd check which achievements are newly unlocked
        const newAchievement = achievements[0];
        if (newAchievement && !localStorage.getItem(`shown_${newAchievement.id}`)) {
          setShowAchievementToast(newAchievement);
          localStorage.setItem(`shown_${newAchievement.id}`, 'true');
        }
      }
    }
  };

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
      const currentMembershipAPY = 5; // Default APY since it's not in interface
      const totalAvailable = (user?.total_crypto_value || 0) + (portfolio?.total_portfolio || 0);
      
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
        const nextTierAPY = currentMembershipAPY + 2; // Estimated next tier APY
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
    <GestureNavigation
      onSwipeLeft={() => onNavigate?.('analytics')}
      onSwipeRight={() => onNavigate?.('investments')}
      onSwipeUp={() => onNavigate?.('new-investment')}
      onSwipeDown={() => onNavigate?.('crypto')}
    >
      <div className="space-y-6">
        {/* Gesture Hints */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed top-4 right-4 text-xs text-gray-500 bg-gray-800/80 rounded-lg p-2 z-40"
        >
          <div>← Analytics</div>
          <div>→ Investments</div>
          <div>↑ Quick Invest</div>
          <div>↓ Crypto Wallet</div>
        </motion.div>
      {/* Welcome Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold mb-2">
          {t('dashboard.welcome', 'Welcome back')}{user?.first_name ? `, ${user.first_name}` : ''}
        </h1>
        <p className="text-gray-400 text-sm">
          {t('dashboard.subtitle', 'Manage your DeFi portfolio and investments')}
        </p>
      </motion.div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-yellow-400 flex items-center gap-2">
                <span>🏆</span>
                {t('dashboard.recentAchievements', 'Recent Achievements')}
              </h3>
              <Button
                onClick={() => onNavigate?.('achievements')}
                size="sm"
                variant="outline"
                className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
              >
                View All
              </Button>
            </div>
            
            <div className="flex gap-3">
              {recentAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <AchievementBadge achievement={achievement} size="md" />
                </motion.div>
              ))}
              
              {recentAchievements.length < 3 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center"
                >
                  <span className="text-gray-500 text-sm">More</span>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Achievement Toast */}
      <AnimatePresence>
        {showAchievementToast && (
          <AchievementToast
            achievement={showAchievementToast}
            onClose={() => setShowAchievementToast(null)}
          />
        )}
      </AnimatePresence>

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
              
              {/* Portfolio growth calculation disabled - needs profit tracking in Portfolio interface */}
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

      {/* Enhanced Quick Actions with Quick Invest Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h2 className="text-lg font-semibold text-gray-300">
          {t('dashboard.quickActions', 'Quick Actions')}
        </h2>
        
        {/* Quick Invest Amount Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[1000, 5000, 10000].map((amount, index) => (
            <motion.div
              key={amount}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index }}
            >
              <Button
                onClick={() => onNavigate?.('new-investment', { quickAmount: amount })}
                className="h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex flex-col items-center justify-center text-xs"
              >
                <span className="font-bold">${amount.toLocaleString()}</span>
                <span className="opacity-80">Quick Invest</span>
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Smart Deposit Suggestions */}
        {membershipStatus?.next_level && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30"
          >
            <div className="text-sm text-purple-300 mb-2 flex items-center gap-2">
              <span>💡</span>
              <span>Smart Suggestion</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-white font-semibold">
                  Invest ${membershipStatus.amount_to_next?.toLocaleString()} more
                </div>
                <div className="text-xs text-gray-400">
                  Unlock {membershipStatus.next_level_name} tier (+2.0% APY boost)
                </div>
              </div>
              <Button
                onClick={() => onNavigate?.('new-investment', { quickAmount: membershipStatus.amount_to_next })}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                Upgrade Now
              </Button>
            </div>
          </motion.div>
        )}
        
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

        {/* Analytics Button - New Feature */}
        <Button
          onClick={() => onNavigate?.('analytics')}
          className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">📈</span>
          <div className="text-left">
            <div className="font-semibold">{t('dashboard.analytics', 'Investment Analytics')}</div>
            <div className="text-xs opacity-90">{t('dashboard.analyticsDesc', 'Track performance & progress')}</div>
          </div>
        </Button>

        {/* Auto-Investment Button - New Feature */}
        <Button
          onClick={() => onNavigate?.('auto-investment')}
          className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 flex items-center justify-center gap-3"
        >
          <span className="text-2xl">⚡</span>
          <div className="text-left">
            <div className="font-semibold">{t('dashboard.autoInvest', 'Auto-Investment')}</div>
            <div className="text-xs opacity-90">{t('dashboard.autoInvestDesc', 'Automate your strategy')}</div>
          </div>
        </Button>

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
    </GestureNavigation>
  );
};