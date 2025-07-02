import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MobileLayout } from '../layout/MobileLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';

interface AnalyticsData {
  totalInvested: number;
  currentValue: number;
  totalProfit: number;
  profitPercentage: number;
  membershipProgress: {
    currentTier: string;
    currentTierEmoji: string;
    nextTier?: string;
    progressPercentage: number;
    amountToNext?: number;
    currentAPY: number;
    nextAPY?: number;
  };
  monthlyData: Array<{
    month: string;
    invested: number;
    value: number;
    profit: number;
  }>;
}

export const InvestmentAnalyticsScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const { t } = useLanguage();
  const { user, membershipStatus, portfolio } = useApp();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Mock analytics data based on user's actual membership status
      const mockData: AnalyticsData = {
        totalInvested: portfolio?.total_invested || 25000,
        currentValue: portfolio?.total_portfolio || 26750,
        totalProfit: portfolio?.total_profit || 1750,
        profitPercentage: ((portfolio?.total_profit || 1750) / (portfolio?.total_invested || 25000)) * 100,
        membershipProgress: {
          currentTier: membershipStatus?.level_name || 'Club',
          currentTierEmoji: membershipStatus?.emoji || '🥉',
          nextTier: membershipStatus?.next_level_name || 'Premium',
          progressPercentage: membershipStatus?.progress_to_next || 50,
          amountToNext: membershipStatus?.amount_to_next || 25000,
          currentAPY: membershipStatus?.current_apy || 6,
          nextAPY: membershipStatus?.next_level_apy || 10
        },
        monthlyData: generateMockMonthlyData()
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMonthlyData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map((month, index) => {
      const baseInvestment = 5000 + (index * 3000);
      const monthlyReturn = baseInvestment * 0.005; // 0.5% monthly
      return {
        month,
        invested: baseInvestment,
        value: baseInvestment + (monthlyReturn * (index + 1)),
        profit: monthlyReturn * (index + 1)
      };
    });
  };

  if (loading) {
    return (
      <MobileLayout centered maxWidth="xs">
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-4">🔄</div>
          <p className="text-gray-300">Loading analytics...</p>
        </div>
      </MobileLayout>
    );
  }

  if (!analyticsData) {
    return (
      <MobileLayout centered maxWidth="xs">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-300">No analytics data available</p>
          <Button onClick={onBack} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout centered maxWidth="xs">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      
      <div className="mb-6">
        <motion.div 
          className="text-6xl mb-4 text-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          📈
        </motion.div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {t('analytics.title', 'Investment Analytics')}
        </h1>
        <p className="text-center text-sm text-gray-400">
          {t('analytics.subtitle', 'Track your performance and progress')}
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Portfolio Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-500/30">
            <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2">
              <span>💰</span>
              {t('analytics.portfolioOverview', 'Portfolio Overview')}
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-400 mb-1">Total Invested</div>
                <div className="text-xl font-bold text-white">
                  ${analyticsData.totalInvested.toLocaleString()}
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-gray-400 mb-1">Current Value</div>
                <div className="text-xl font-bold text-green-400">
                  ${analyticsData.currentValue.toLocaleString()}
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-green-500/20 text-center">
              <div className="text-gray-400 mb-1">Total Profit</div>
              <div className="text-2xl font-bold text-green-400">
                +${analyticsData.totalProfit.toLocaleString()}
              </div>
              <div className="text-sm text-green-300">
                (+{analyticsData.profitPercentage.toFixed(1)}%)
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Membership Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <h3 className="font-semibold text-purple-400 mb-4 flex items-center gap-2">
              <span>🏆</span>
              {t('analytics.membershipProgress', 'Membership Progress')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{analyticsData.membershipProgress.currentTierEmoji}</span>
                  <span className="font-semibold text-white">
                    {analyticsData.membershipProgress.currentTier} Member
                  </span>
                </div>
                <div className="text-purple-400 font-semibold">
                  {analyticsData.membershipProgress.currentAPY}% APY
                </div>
              </div>
              
              {analyticsData.membershipProgress.nextTier && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Progress to {analyticsData.membershipProgress.nextTier}
                    </span>
                    <span className="text-purple-400">
                      ${analyticsData.membershipProgress.amountToNext?.toLocaleString()} to go
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${analyticsData.membershipProgress.progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    Unlock {analyticsData.membershipProgress.nextAPY}% APY with {analyticsData.membershipProgress.nextTier} tier
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Performance Chart Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-800/50 border-gray-600">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              {t('analytics.performanceChart', 'Performance Chart')}
            </h3>
            
            <div className="bg-gray-900/50 rounded-lg p-4 h-32 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <div className="text-2xl mb-2">📈</div>
                <div className="text-sm">Performance chart coming soon</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3"
        >
          <Button
            onClick={() => onNavigate?.('new-investment')}
            className="h-12 bg-purple-600 hover:bg-purple-700"
          >
            💰 Invest More
          </Button>
          
          <Button
            onClick={() => onNavigate?.('investments')}
            variant="outline"
            className="h-12 border-gray-600"
          >
            📋 My Investments
          </Button>
        </motion.div>
      </div>
    </MobileLayout>
  );
};