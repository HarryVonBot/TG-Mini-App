import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { MobileLayout } from '../layout/MobileLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

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
  tierComparison: Array<{
    name: string;
    emoji: string;
    minAmount: number;
    maxAmount?: number;
    apy: number;
    benefits: string[];
    isUnlocked: boolean;
    isCurrent: boolean;
  }>;
}

export const InvestmentAnalyticsScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [calculatorAmount, setCalculatorAmount] = useState<string>('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorResult, setCalculatorResult] = useState<any>(null);
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
        monthlyData: generateMockMonthlyData(),
        tierComparison: generateTierComparison()
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

  const generateTierComparison = () => {
    const currentInvested = portfolio?.total_invested || 25000;
    
    return [
      {
        name: 'Basic',
        emoji: '🌱',
        minAmount: 0,
        maxAmount: 19999,
        apy: 3,
        benefits: ['3% APY', 'Basic Access', 'Mobile App'],
        isUnlocked: true,
        isCurrent: currentInvested < 20000
      },
      {
        name: 'Club',
        emoji: '🥉',
        minAmount: 20000,
        maxAmount: 49999,
        apy: 6,
        benefits: ['6% APY', 'Basic Support', 'Mobile App'],
        isUnlocked: currentInvested >= 20000,
        isCurrent: currentInvested >= 20000 && currentInvested < 50000
      },
      {
        name: 'Premium',
        emoji: '🥈',
        minAmount: 50000,
        maxAmount: 99999,
        apy: 10,
        benefits: ['10% APY', 'Priority Support', 'Advanced Features'],
        isUnlocked: currentInvested >= 50000,
        isCurrent: currentInvested >= 50000 && currentInvested < 100000
      },
      {
        name: 'VIP',
        emoji: '🥇',
        minAmount: 100000,
        maxAmount: 249999,
        apy: 14,
        benefits: ['14% APY', 'Dedicated Manager', 'Exclusive Access'],
        isUnlocked: currentInvested >= 100000,
        isCurrent: currentInvested >= 100000 && currentInvested < 250000
      },
      {
        name: 'Elite',
        emoji: '💎',
        minAmount: 250000,
        apy: 20,
        benefits: ['20% APY', 'White Glove Service', 'All Features'],
        isUnlocked: currentInvested >= 250000,
        isCurrent: currentInvested >= 250000
      }
    ];
  };

  const calculateInvestmentProjection = (additionalAmount: number) => {
    if (!analyticsData) return null;
    
    const currentTotal = analyticsData.totalInvested;
    const newTotal = currentTotal + additionalAmount;
    
    // Determine new tier
    let newTier = analyticsData.tierComparison.find(tier => 
      newTotal >= tier.minAmount && (!tier.maxAmount || newTotal <= tier.maxAmount)
    );
    
    if (!newTier && newTotal >= 250000) {
      newTier = analyticsData.tierComparison.find(tier => tier.name === 'Elite');
    }
    
    const currentAPY = analyticsData.membershipProgress.currentAPY;
    const newAPY = newTier?.apy || currentAPY;
    
    const yearlyEarningsIncrease = additionalAmount * (newAPY / 100);
    const monthlyEarningsIncrease = yearlyEarningsIncrease / 12;
    
    return {
      additionalAmount,
      newTotal,
      currentTier: analyticsData.membershipProgress.currentTier,
      newTier: newTier?.name || analyticsData.membershipProgress.currentTier,
      newTierEmoji: newTier?.emoji || analyticsData.membershipProgress.currentTierEmoji,
      currentAPY,
      newAPY,
      apyIncrease: newAPY - currentAPY,
      yearlyEarningsIncrease,
      monthlyEarningsIncrease,
      tierUpgrade: newTier && newTier.name !== analyticsData.membershipProgress.currentTier
    };
  };

  const handleCalculatorSubmit = () => {
    const amount = parseFloat(calculatorAmount);
    if (amount && amount > 0) {
      const result = calculateInvestmentProjection(amount);
      setCalculatorResult(result);
    }
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

        {/* Enhanced Membership Progress with Interactive Elements */}
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
                  <motion.span 
                    className="text-xl"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3
                    }}
                  >
                    {analyticsData.membershipProgress.currentTierEmoji}
                  </motion.span>
                  <span className="font-semibold text-white">
                    {analyticsData.membershipProgress.currentTier} Member
                  </span>
                </div>
                <motion.div 
                  className="text-purple-400 font-semibold"
                  whileHover={{ scale: 1.05 }}
                >
                  {analyticsData.membershipProgress.currentAPY}% APY
                </motion.div>
              </div>
              
              {analyticsData.membershipProgress.nextTier && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">
                      Progress to {analyticsData.membershipProgress.nextTier}
                    </span>
                    <span className="text-purple-400">
                      ${analyticsData.membershipProgress.amountToNext?.toLocaleString()} to go
                    </span>
                  </div>
                  
                  {/* Enhanced Interactive Progress Bar */}
                  <div className="relative">
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                      <motion.div 
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-4 rounded-full relative"
                        initial={{ width: 0 }}
                        animate={{ width: `${analyticsData.membershipProgress.progressPercentage}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      >
                        {/* Animated shine effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                          animate={{ x: ['-100%', '100%'] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 3
                          }}
                        />
                      </motion.div>
                    </div>
                    <div className="text-xs text-center mt-1 text-purple-300">
                      {analyticsData.membershipProgress.progressPercentage.toFixed(1)}% complete
                    </div>
                  </div>
                  
                  <motion.div 
                    className="text-xs text-gray-400 text-center bg-purple-900/30 rounded-lg p-2"
                    whileHover={{ 
                      backgroundColor: 'rgba(147, 51, 234, 0.2)',
                      scale: 1.02
                    }}
                  >
                    Unlock {analyticsData.membershipProgress.nextAPY}% APY with {analyticsData.membershipProgress.nextTier} tier
                    <br />
                    <span className="text-green-400 font-semibold">
                      +{((analyticsData.membershipProgress.nextAPY || 0) - analyticsData.membershipProgress.currentAPY).toFixed(1)}% APY increase!
                    </span>
                  </motion.div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Membership Tier Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gray-800/50 border-gray-600">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>🎯</span>
              {t('analytics.tierComparison', 'Membership Tier Comparison')}
            </h3>
            
            <div className="space-y-3">
              {/* First row - Basic and Club */}
              <div className="grid grid-cols-2 gap-3">
                {analyticsData.tierComparison.slice(0, 2).map((tier, index) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      tier.isCurrent
                        ? 'border-purple-500 bg-purple-900/30'
                        : tier.isUnlocked
                        ? 'border-green-500/50 bg-green-900/20'
                        : 'border-gray-600 bg-gray-800/50'
                    }`}
                    whileHover={{ 
                      scale: 1.03,
                      borderColor: tier.isCurrent ? '#a855f7' : tier.isUnlocked ? '#10b981' : '#6b7280'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{tier.emoji}</div>
                      <div className="font-semibold text-sm text-white mb-1">
                        {tier.name}
                        {tier.isCurrent && <span className="text-purple-400 ml-1">✓</span>}
                      </div>
                      <div className="text-xs text-gray-400 mb-2">
                        ${tier.minAmount.toLocaleString()}
                        {tier.maxAmount && `- $${tier.maxAmount.toLocaleString()}`}
                      </div>
                      <div className={`text-lg font-bold ${
                        tier.isCurrent ? 'text-purple-400' : 
                        tier.isUnlocked ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {tier.apy}% APY
                      </div>
                      {!tier.isUnlocked && (
                        <div className="text-xs text-orange-400 mt-1">
                          🔒 Locked
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Second row - Premium, VIP, Elite */}
              <div className="grid grid-cols-3 gap-2">
                {analyticsData.tierComparison.slice(2, 5).map((tier, index) => (
                  <motion.div
                    key={tier.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * (index + 2) }}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      tier.isCurrent
                        ? 'border-purple-500 bg-purple-900/30'
                        : tier.isUnlocked
                        ? 'border-green-500/50 bg-green-900/20'
                        : 'border-gray-600 bg-gray-800/50'
                    }`}
                    whileHover={{ 
                      scale: 1.03,
                      borderColor: tier.isCurrent ? '#a855f7' : tier.isUnlocked ? '#10b981' : '#6b7280'
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xl mb-1">{tier.emoji}</div>
                      <div className="font-semibold text-xs text-white mb-1">
                        {tier.name}
                        {tier.isCurrent && <span className="text-purple-400 ml-1">✓</span>}
                      </div>
                      <div className="text-xs text-gray-400 mb-1">
                        ${tier.minAmount >= 1000 ? `${tier.minAmount/1000}K` : tier.minAmount}
                        {tier.maxAmount && `+`}
                      </div>
                      <div className={`text-sm font-bold ${
                        tier.isCurrent ? 'text-purple-400' : 
                        tier.isUnlocked ? 'text-green-400' : 'text-gray-400'
                      }`}>
                        {tier.apy}%
                      </div>
                      {!tier.isUnlocked && (
                        <div className="text-xs text-orange-400 mt-1">
                          🔒
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* "What if I invest $X more?" Calculator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-400 flex items-center gap-2">
                <span>🧮</span>
                {t('analytics.investmentCalculator', 'Investment Calculator')}
              </h3>
              <Button
                onClick={() => setShowCalculator(!showCalculator)}
                size="sm"
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10"
              >
                {showCalculator ? 'Hide' : 'Calculate'}
              </Button>
            </div>
            
            <AnimatePresence>
              {showCalculator && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Additional investment amount"
                      value={calculatorAmount}
                      onChange={(e) => setCalculatorAmount(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCalculatorSubmit}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={!calculatorAmount || parseFloat(calculatorAmount) <= 0}
                    >
                      Calculate
                    </Button>
                  </div>
                  
                  {calculatorResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-900/30 rounded-lg p-4 space-y-3"
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-300 mb-2">
                          Investment Projection
                        </div>
                        <div className="text-sm text-gray-300">
                          Adding ${calculatorResult.additionalAmount.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-gray-400">New Total</div>
                          <div className="font-bold text-white">
                            ${calculatorResult.newTotal.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-gray-400">
                            {calculatorResult.tierUpgrade ? 'New Tier' : 'Current Tier'}
                          </div>
                          <div className={`font-bold ${calculatorResult.tierUpgrade ? 'text-green-400' : 'text-white'}`}>
                            {calculatorResult.newTierEmoji} {calculatorResult.newTier}
                          </div>
                        </div>
                      </div>
                      
                      {calculatorResult.apyIncrease > 0 && (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="bg-green-900/30 rounded-lg p-3 text-center"
                        >
                          <div className="text-green-400 font-bold text-lg">
                            🎉 APY Upgrade!
                          </div>
                          <div className="text-sm text-gray-300">
                            {calculatorResult.currentAPY}% → {calculatorResult.newAPY}% 
                            (+{calculatorResult.apyIncrease.toFixed(1)}%)
                          </div>
                        </motion.div>
                      )}
                      
                      <div className="bg-cyan-900/30 rounded-lg p-3">
                        <div className="text-center text-sm">
                          <div className="text-gray-400 mb-1">Additional Monthly Earnings</div>
                          <div className="text-xl font-bold text-cyan-400">
                            +${calculatorResult.monthlyEarningsIncrease.toFixed(2)}/month
                          </div>
                          <div className="text-xs text-gray-400">
                            +${calculatorResult.yearlyEarningsIncrease.toFixed(2)}/year
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>

        {/* Enhanced Performance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gray-800/50 border-gray-600">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <span>📊</span>
              {t('analytics.performanceChart', 'Performance Chart')}
            </h3>
            
            {/* Chart Period Selector */}
            <div className="flex gap-2 mb-4">
              {['6M', '1Y'].map((period, index) => (
                <motion.button
                  key={period}
                  className={`px-3 py-1 rounded text-sm ${
                    index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {period}
                </motion.button>
              ))}
            </div>

            {/* Custom SVG Chart */}
            <div className="bg-gray-900/50 rounded-lg p-4">
              <div className="h-40 relative">
                <svg className="w-full h-full" viewBox="0 0 300 120" preserveAspectRatio="xMidYMid meet">
                  {/* Grid lines */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  
                  {/* Horizontal grid lines */}
                  {[0, 1, 2, 3, 4].map((line) => (
                    <motion.line
                      key={line}
                      x1="0"
                      y1={20 + line * 20}
                      x2="300"
                      y2={20 + line * 20}
                      stroke="#374151"
                      strokeWidth="0.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1, delay: line * 0.1 }}
                    />
                  ))}
                  
                  {/* Chart area */}
                  <motion.path
                    d="M 0 80 Q 50 70 100 65 T 200 45 T 300 35"
                    fill="url(#chartGradient)"
                    stroke="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                  
                  {/* Chart line */}
                  <motion.path
                    d="M 0 80 Q 50 70 100 65 T 200 45 T 300 35"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                  
                  {/* Data points */}
                  {analyticsData.monthlyData.map((point, index) => (
                    <motion.circle
                      key={index}
                      cx={index * 60}
                      cy={80 - (index * 8)}
                      r="3"
                      fill="#10b981"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}
                      whileHover={{ scale: 1.5, fill: "#34d399" }}
                    />
                  ))}
                </svg>
                
                {/* Performance Metrics Overlay */}
                <div className="absolute top-2 right-2 text-right">
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 }}
                    className="text-xs"
                  >
                    <div className="text-green-400 font-semibold">
                      +{analyticsData.profitPercentage.toFixed(1)}%
                    </div>
                    <div className="text-gray-400">Total Return</div>
                  </motion.div>
                </div>
              </div>
              
              {/* Month labels */}
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {analyticsData.monthlyData.map((data, index) => (
                  <motion.span
                    key={data.month}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 + (index * 0.1) }}
                  >
                    {data.month}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* ROI Tracking Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2 }}
              className="mt-4 grid grid-cols-3 gap-4 text-center text-sm"
            >
              <div className="bg-green-900/30 rounded-lg p-2">
                <div className="text-green-400 font-semibold">
                  {analyticsData.profitPercentage.toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Total ROI</div>
              </div>
              
              <div className="bg-blue-900/30 rounded-lg p-2">
                <div className="text-blue-400 font-semibold">
                  {(analyticsData.profitPercentage / 6).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Avg Monthly</div>
              </div>
              
              <div className="bg-purple-900/30 rounded-lg p-2">
                <div className="text-purple-400 font-semibold">
                  {(analyticsData.profitPercentage * 2).toFixed(1)}%
                </div>
                <div className="text-gray-400 text-xs">Projected Annual</div>
              </div>
            </motion.div>
          </Card>
        </motion.div>

        {/* Investment Projections & Earnings Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
            <h3 className="font-semibold text-yellow-400 mb-4 flex items-center gap-2">
              <span>💰</span>
              {t('analytics.earningsProjection', 'Earnings Projection')}
            </h3>
            
            {/* Future Earnings Timeline */}
            <div className="space-y-4">
              <div className="bg-yellow-900/30 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="text-lg font-bold text-yellow-300">
                    Next 12 Months Projection
                  </div>
                  <div className="text-sm text-gray-400">
                    Based on current {analyticsData.membershipProgress.currentAPY}% APY
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-400">Expected Monthly</div>
                    <motion.div 
                      className="text-xl font-bold text-yellow-400"
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      ${((analyticsData.totalInvested * analyticsData.membershipProgress.currentAPY / 100) / 12).toFixed(0)}
                    </motion.div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-gray-400">Total Year Projection</div>
                    <motion.div 
                      className="text-xl font-bold text-green-400"
                      animate={{ 
                        scale: [1, 1.05, 1],
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        delay: 0.5
                      }}
                    >
                      ${(analyticsData.totalInvested * analyticsData.membershipProgress.currentAPY / 100).toFixed(0)}
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="bg-orange-900/30 rounded-lg p-4">
                <div className="text-center mb-3">
                  <div className="font-semibold text-orange-400 mb-1">
                    📅 Payment Schedule
                  </div>
                  <div className="text-xs text-gray-400">
                    Monthly earnings distribution
                  </div>
                </div>
                
                <div className="space-y-2">
                  {['This Month', 'Next Month', 'Month 3'].map((period, index) => {
                    const baseEarning = (analyticsData.totalInvested * analyticsData.membershipProgress.currentAPY / 100) / 12;
                    const earnings = baseEarning * (1 + index * 0.02); // Slight compound growth
                    
                    return (
                      <motion.div
                        key={period}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 2.5 + (index * 0.2) }}
                        className="flex justify-between items-center p-2 bg-gray-800/50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            index === 0 ? 'bg-green-500' : 
                            index === 1 ? 'bg-yellow-500' : 'bg-gray-500'
                          }`} />
                          <span className="text-sm text-gray-300">{period}</span>
                        </div>
                        <span className="text-sm font-semibold text-orange-400">
                          ${earnings.toFixed(0)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Milestone Countdown */}
              {analyticsData.membershipProgress.nextTier && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 3 }}
                  className="bg-purple-900/30 rounded-lg p-4"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400 mb-2">
                      🎯 Next Milestone
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      {analyticsData.membershipProgress.nextTier} Member Upgrade
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Investment Needed</span>
                        <span className="text-purple-400 font-semibold">
                          ${analyticsData.membershipProgress.amountToNext?.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">APY Increase</span>
                        <span className="text-green-400 font-semibold">
                          +{((analyticsData.membershipProgress.nextAPY || 0) - analyticsData.membershipProgress.currentAPY).toFixed(1)}%
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Additional Monthly Earnings</span>
                        <span className="text-yellow-400 font-semibold">
                          +${(((analyticsData.membershipProgress.nextAPY || 0) - analyticsData.membershipProgress.currentAPY) * analyticsData.totalInvested / 100 / 12).toFixed(0)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Countdown Timer Effect */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 3.5 }}
                      className="mt-3 p-2 bg-purple-800/50 rounded-lg"
                    >
                      <div className="text-xs text-gray-400 mb-1">
                        Time to reach milestone*
                      </div>
                      <div className="text-lg font-bold text-purple-300">
                        {Math.ceil((analyticsData.membershipProgress.amountToNext || 0) / 5000)} months
                      </div>
                      <div className="text-xs text-gray-400">
                        *Assuming $5K monthly investment
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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