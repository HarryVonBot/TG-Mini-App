import React, { useState, useEffect } from 'react';
import type { ScreenProps, Portfolio } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { FullScreenLoader } from '../common/LoadingSpinner';
import { MembershipBadge } from '../common/MembershipBadge';
import { EnhancedProgressBar } from '../common/EnhancedProgressBar';
import { useApp } from '../../context/AppContext';

export const DashboardScreen: React.FC<ScreenProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const { portfolio, fetchPortfolio, membershipStatus, fetchMembershipStatus } = useApp();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPortfolio(),
        fetchMembershipStatus()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const getProgressToNext = () => {
    if (!membershipStatus?.amount_to_next) return 100;
    const current = membershipStatus.total_invested;
    const target = current + membershipStatus.amount_to_next;
    return (current / target) * 100;
  };

  if (loading) {
    return <FullScreenLoader text="Loading dashboard..." />;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Welcome back to VonVault</p>
        </div>
        <Button
          onClick={() => onNavigate?.('profile')}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <span>👤</span>
          Profile
        </Button>
      </div>

      {/* Enhanced Membership Status Card */}
      {membershipStatus && (
        <Card 
          className="mb-6 bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 border-purple-500/30 cursor-pointer card-hover-effect animate-fade-in-up"
          onClick={() => onNavigate?.('membership-status')}
          hover
        >
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center gap-4">
              <div className="animate-float">
                <MembershipBadge 
                  level={membershipStatus.level} 
                  size="lg" 
                  showRing={true}
                  className="tier-badge-shadow"
                />
              </div>
              
              <div>
                <div className="font-bold text-xl text-white mb-1">
                  {membershipStatus.level_name}
                </div>
                <div className="text-purple-200 text-sm">
                  {formatAmount(membershipStatus.total_invested)} invested
                </div>
                
                {/* Progress to next level */}
                {membershipStatus.next_level && (
                  <div className="mt-3 w-64">
                    <EnhancedProgressBar
                      progress={getProgressToNext()}
                      level={membershipStatus.next_level}
                      label={`${formatAmount(membershipStatus.amount_to_next || 0)} to ${membershipStatus.next_level_name}`}
                      animated={true}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-purple-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Portfolio Summary */}
      {portfolio && (
        <Card className="mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700 card-hover-effect animate-slide-in-left">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-2xl">💼</span>
            Portfolio Summary
          </h2>
          
          {/* Total Portfolio Value */}
          <div className="text-center mb-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg">
            <div className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              {formatAmount(portfolio.total_portfolio)}
            </div>
            <div className="text-gray-400">Total Portfolio Value</div>
          </div>
          
          {/* Portfolio Breakdown */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center group">
              <p className="text-gray-400 text-sm">Investments</p>
              <p className="font-bold text-lg text-green-400 transition-transform duration-300 group-hover:scale-110">
                {formatAmount(portfolio.investments.total)}
              </p>
              <p className="text-xs text-gray-500">{portfolio.investments.count} active</p>
            </div>
            <div className="text-center group">
              <p className="text-gray-400 text-sm">Crypto</p>
              <p className="font-bold text-lg text-orange-400 transition-transform duration-300 group-hover:scale-110">
                {formatAmount(portfolio.crypto.total)}
              </p>
            </div>
            <div className="text-center group">
              <p className="text-gray-400 text-sm">Cash</p>
              <p className="font-bold text-lg text-blue-400 transition-transform duration-300 group-hover:scale-110">
                {formatAmount(portfolio.bank.total)}
              </p>
            </div>
          </div>

          {/* Enhanced Portfolio Breakdown Visualization */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Investments
              </span>
              <span className="font-medium">{portfolio.breakdown.investments_percentage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div className="flex h-full">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${portfolio.breakdown.investments_percentage}%` }}
                ></div>
                <div 
                  className="bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${portfolio.breakdown.crypto_percentage}%` }}
                ></div>
                <div 
                  className="bg-gradient-to-r from-blue-400 to-blue-500 transition-all duration-1000 ease-out" 
                  style={{ width: `${portfolio.breakdown.cash_percentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex justify-between text-xs text-gray-400">
              <span>💰 Crypto: {portfolio.breakdown.crypto_percentage.toFixed(1)}%</span>
              <span>💵 Cash: {portfolio.breakdown.cash_percentage.toFixed(1)}%</span>
            </div>
          </div>
        </Card>
      )}

      {/* Enhanced Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          onClick={() => onNavigate?.('investments')}
          className="h-28 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 card-hover-effect animate-slide-in-left"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span className="font-medium">My Investments</span>
        </Button>

        <Button
          onClick={() => onNavigate?.('new-investment')}
          className="h-28 flex flex-col items-center justify-center space-y-2 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 card-hover-effect animate-slide-in-right"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium">New Investment</span>
        </Button>
      </div>

      {/* Secondary Actions Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          onClick={() => onNavigate?.('crypto')}
          variant="secondary"
          className="h-20 flex flex-col items-center justify-center space-y-1 card-hover-effect bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span className="text-sm font-medium">Crypto Wallet</span>
        </Button>

        <Button
          onClick={() => onNavigate?.('funds')}
          variant="secondary"
          className="h-20 flex flex-col items-center justify-center space-y-1 card-hover-effect bg-gradient-to-br from-gray-800 to-gray-900 hover:from-gray-700 hover:to-gray-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
          <span className="text-sm font-medium">Available Funds</span>
        </Button>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="text-center p-4 bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">
            {membershipStatus?.available_plans.length || 0}
          </div>
          <div className="text-sm text-blue-300">Available Plans</div>
        </Card>
        
        <Card className="text-center p-4 bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500/30">
          <div className="text-2xl font-bold text-green-400">
            {portfolio?.investments.count || 0}
          </div>
          <div className="text-sm text-green-300">Active Investments</div>
        </Card>
      </div>
    </div>
  );
};