import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AchievementBadge } from '../common/AchievementBadge';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
// REMOVED: framer-motion dependency

interface CompletionData {
  investmentId: string;
  amount: number;
  plan: string;
  expectedReturn: number;
  completionDate: string;
  actualReturn: number;
  achievements?: any[];
}

export const InvestmentCompletionScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const { t } = useLanguage();
  const { user } = useApp();
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading completion data
    setTimeout(() => {
      setCompletionData({
        investmentId: '12345',
        amount: 1000,
        plan: 'Premium DeFi',
        expectedReturn: 1200,
        completionDate: new Date().toISOString(),
        actualReturn: 1250,
        achievements: [
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="loading-spinner animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!completionData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Error loading completion data</div>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  const profitAmount = completionData.actualReturn - completionData.amount;
  const profitPercentage = ((profitAmount / completionData.amount) * 100).toFixed(1);

  return (
    <div className="investment-completion-screen h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="success-icon text-8xl mb-4">🎉</div>
          <div className="text-3xl font-bold text-green-400 mb-2">
            {t('investment.completion.title', 'Investment Completed!')}
          </div>
          <div className="text-gray-400 text-sm">
            {t('investment.completion.subtitle', 'Your investment has matured successfully')}
          </div>
        </div>

        {/* Investment Summary */}
        <Card className="mb-6 p-6 bg-gradient-to-r from-green-900/20 to-green-900/10 border-green-500/30">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Investment Plan</span>
              <span className="font-semibold">{completionData.plan}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Initial Amount</span>
              <span className="font-semibold">${completionData.amount.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Final Amount</span>
              <span className="font-semibold text-green-400">${completionData.actualReturn.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Profit</span>
                <div className="text-right">
                  <div className="font-bold text-green-400 text-lg">
                    +${profitAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-300">
                    +{profitPercentage}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        {completionData.achievements && completionData.achievements.length > 0 && (
          <Card className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-purple-900/10 border-purple-500/30">
            <div className="text-center mb-4">
              <div className="text-lg font-semibold text-purple-400 mb-2">
                {t('investment.completion.achievements', 'New Achievements!')}
              </div>
              <div className="flex justify-center space-x-3">
                {completionData.achievements.map((achievement, index) => (
                  <div
                    key={achievement.id}
                    className="achievement-item"
                  >
                    <AchievementBadge achievement={achievement} size="large" />
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onNavigate?.('new-investment')}
            className="w-full h-12 bg-purple-600 hover:bg-purple-700"
          >
            {t('investment.completion.investAgain', 'Invest Again')}
          </Button>
          
          <Button
            onClick={() => onNavigate?.('dashboard')}
            variant="outline"
            className="w-full h-12"
          >
            {t('investment.completion.dashboard', 'View Dashboard')}
          </Button>
          
          <Button
            onClick={() => onNavigate?.('investments')}
            variant="outline"
            className="w-full h-12"
          >
            {t('investment.completion.portfolio', 'View Portfolio')}
          </Button>
        </div>

        {/* Completion Details */}
        <div className="text-center mt-6 text-xs text-gray-500">
          <div>Completed on {new Date(completionData.completionDate).toLocaleDateString()}</div>
          <div>Investment ID: {completionData.investmentId}</div>
        </div>
      </div>
    </div>
  );
};