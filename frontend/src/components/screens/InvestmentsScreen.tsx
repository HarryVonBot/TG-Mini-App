import React, { useState, useEffect } from 'react';
import type { ScreenProps, Investment } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { AchievementBadge } from '../common/AchievementBadge';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { apiService } from '../../services/api';
import { useLoadingState, LOADING_KEYS } from '../../hooks/useLoadingState';
import { achievementService, type Achievement } from '../../services/AchievementService';
// REMOVED: framer-motion dependency

export const InvestmentsScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [recentAchievements, setRecentAchievements] = useState<Achievement[]>([]);
  const { user, membershipStatus } = useApp();
  const { t } = useLanguage();
  
  // === STANDARDIZED LOADING STATE MANAGEMENT ===
  const { withLoading, isLoading } = useLoadingState();

  useEffect(() => {
    fetchInvestments();
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    if (user && membershipStatus) {
      try {
        const achievements = achievementService.checkAchievements(user, investments, membershipStatus);
        setRecentAchievements(achievements.slice(0, 2)); // Show 2 most recent
      } catch (error) {
        console.error('Error loading achievements for Portfolio:', error);
      }
    }
  };

  const fetchInvestments = async () => {
    await withLoading(LOADING_KEYS.INVESTMENTS, async () => {
      try {
        if (!user?.token) {
          console.log('No user token available for investments');
          return;
        }
        
        const data = await apiService.getInvestments(user.token);
        setInvestments(data.investments || []);
      } catch (error) {
        console.error('Error fetching investments:', error);
        // CORRECTED: Demo data now uses default APY rates
        const currentAPY = 5; // Default APY since property doesn't exist in interface
        const membershipName = membershipStatus?.level_name || 'Basic';
        
        setInvestments([
          {
            id: 'demo-1',
            user_id: 'demo-user',
            name: `${membershipName} Member - 1 Year`,
            amount: 5000,
            rate: currentAPY,
            term: 365,
            membership_level: membershipName.toLowerCase(),
            status: 'active',
            created_at: '2024-01-15',
          },
          {
            id: 'demo-2', 
            user_id: 'demo-user',
            name: `${membershipName} Member - 6 Months`,
            amount: 3000,
            rate: currentAPY,
            term: 180,
            membership_level: membershipName.toLowerCase(),
            status: 'active',
            created_at: '2024-03-01',
          }
        ]);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateProgress = (startDate: string, maturityDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(maturityDate).getTime();
    const now = new Date().getTime();
    
    if (now <= start) return 0;
    if (now >= end) return 100;
    
    return ((now - start) / (end - start)) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'completed': return 'text-blue-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '🔄';
      case 'completed': return '✅';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
  // Calculate estimated current value based on investment progress
  const totalCurrentValue = investments.reduce((sum, inv) => {
    const daysSinceStart = inv.created_at ? 
      Math.floor((Date.now() - new Date(inv.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const progressFactor = Math.min(daysSinceStart / inv.term, 1);
    const estimatedValue = inv.amount + (inv.amount * inv.rate / 100 * progressFactor);
    return sum + estimatedValue;
  }, 0);
  const totalProfit = totalCurrentValue - totalInvested;

  if (isLoading(LOADING_KEYS.INVESTMENTS)) {
    return <FullScreenLoader text="Loading your investments..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          {t('investments.title', 'Investment Portfolio')}
        </h1>
        <p className="text-gray-400 text-sm">
          {t('investments.subtitle', 'Track your DeFi investments')}
        </p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-purple-300">
            {formatCurrency(totalInvested)}
          </div>
          <div className="text-xs text-gray-400">
            {t('investments.invested', 'Invested')}
          </div>
        </div>
        
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="text-lg font-bold text-green-300">
            {formatCurrency(totalCurrentValue)}
          </div>
          <div className="text-xs text-gray-400">
            {t('investments.current', 'Current')}
          </div>
        </div>
        
        <div className={`border rounded-lg p-4 text-center ${
          totalProfit >= 0 
            ? 'bg-blue-900/20 border-blue-500/30' 
            : 'bg-red-900/20 border-red-500/30'
        }`}>
          <div className={`text-lg font-bold ${
            totalProfit >= 0 ? 'text-blue-300' : 'text-red-300'
          }`}>
            {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
          </div>
          <div className="text-xs text-gray-400">
            {t('investments.profit', 'Profit')}
          </div>
        </div>
      </div>

      {/* New Investment Button */}
      <Button
        onClick={() => onNavigate?.('new-investment')}
        fullWidth
        className="h-12 bg-purple-600 hover:bg-purple-700"
      >
        + {t('investments.newInvestment', 'New Investment')}
      </Button>

      {/* Investments List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-300">
          {t('investments.active', 'Active Investments')}
        </h2>
        
        {investments.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">
              {t('investments.noInvestments', 'No investments yet')}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {t('investments.startInvesting', 'Start your DeFi journey today')}
            </p>
            <Button
              onClick={() => onNavigate?.('new-investment')}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {t('investments.makeFirst', 'Make Your First Investment')}
            </Button>
          </div>
        ) : (
          investments.map((investment) => (
            <div
              key={investment.id}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getStatusIcon(investment.status)}</span>
                  <div>
                    <div className="font-semibold text-white">
                      {investment.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatDate(investment.created_at || '')} - Active ({investment.term} days)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-purple-300">
                    {formatCurrency(
                      investment.amount + (investment.amount * investment.rate / 100 * 
                      Math.min((Date.now() - new Date(investment.created_at || Date.now()).getTime()) / 
                      (1000 * 60 * 60 * 24) / investment.term, 1))
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {investment.rate}% APY
                  </div>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{t('investments.progress', 'Progress')}</span>
                  <span>{Math.round(((Date.now() - new Date(investment.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) / investment.term * 100)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min(((Date.now() - new Date(investment.created_at || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) / investment.term * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(investment.status)} bg-gray-800`}>
                  {investment.status.toUpperCase()}
                </span>
                <div className="text-xs text-gray-400">
                  +{formatCurrency(
                    (investment.amount * investment.rate / 100 * 
                    Math.min((Date.now() - new Date(investment.created_at || Date.now()).getTime()) / 
                    (1000 * 60 * 60 * 24) / investment.term, 1))
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Achievements - MOVED from Dashboard */}
      {recentAchievements.length > 0 && (
        <div className="achievements-section mt-6">
          <Card className="bg-gradient-to-r from-purple-900/30 to-purple-900/20 border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-400 flex items-center gap-2">
                <span>🏆</span>
                {t('portfolio.recentAchievements', 'Recent Achievements')}
              </h3>
              <Button
                onClick={() => onNavigate?.('achievements')}
                size="sm"
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                View All
              </Button>
            </div>
            
            <div className="flex gap-3">
              {recentAchievements.map((achievement, index) => (
                <div
                  key={achievement.id}
                  className="achievement-badge-wrapper"
                >
                  <AchievementBadge achievement={achievement} size="md" />
                </div>
              ))}
              
              {recentAchievements.length < 3 && (
                <div className="more-achievements w-16 h-16 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">More</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};