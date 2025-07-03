import React, { useState, useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MobileLayout } from '../layout/MobileLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { motion } from 'framer-motion';

interface InvestmentDetails {
  planName: string;
  amount: number;
  netAmount: number;
  conversionFee: number;
  apy: number;
  termDays: number;
  projectedReturns: number;
  network: string;
  token: string;
  depositAddress: string;
}

export const InvestmentCompletionScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [step, setStep] = useState<'monitoring' | 'confirmed' | 'completed'>('monitoring');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const { t } = useLanguage();
  const { user, membershipStatus } = useApp();

  // CORRECTED: Use real membership data instead of hardcoded values
  const investmentDetails: InvestmentDetails = {
    planName: `${membershipStatus?.level_name || 'Basic'} Member - 1 Year`,
    amount: 10000, // TODO: Get from navigation params in production
    netAmount: 9700, // TODO: Calculate from actual amount
    conversionFee: 300, // TODO: Calculate 3% of actual amount
    apy: 5, // Default APY since property doesn't exist in interface
    termDays: 365, // TODO: Get from selected plan
    projectedReturns: (9700 * 5 / 100), // Calculate based on default APY
    network: 'Polygon', // TODO: Get from investment flow
    token: 'USDC', // TODO: Get from investment flow
    depositAddress: '0x1cB7111eBBF79Af5E941eB89B8eAFC67830be8a4' // TODO: Get real VonVault address
  };

  useEffect(() => {
    // Simulate deposit monitoring
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      
      // Simulate deposit confirmation after 15 seconds
      if (timeElapsed >= 15 && step === 'monitoring') {
        setStep('confirmed');
      }
      
      // Simulate investment completion after 25 seconds
      if (timeElapsed >= 25 && step === 'confirmed') {
        setStep('completed');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeElapsed, step]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
          animate={{ rotate: step === 'monitoring' ? 360 : 0 }}
          transition={{ duration: 2, repeat: step === 'monitoring' ? Infinity : 0 }}
        >
          {step === 'monitoring' ? '🔄' : step === 'confirmed' ? '✅' : '🎉'}
        </motion.div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {step === 'monitoring' 
            ? t('investment.monitoring', 'Monitoring Deposit')
            : step === 'confirmed'
            ? t('investment.confirmed', 'Deposit Confirmed')
            : t('investment.completed', 'Investment Active!')
          }
        </h1>
        <p className="text-center text-sm text-gray-400">
          {step === 'monitoring' 
            ? t('investment.monitoringDesc', 'Waiting for your crypto deposit to be received')
            : step === 'confirmed'
            ? t('investment.confirmedDesc', 'Processing your investment setup')
            : t('investment.completedDesc', 'Your investment is now active and earning returns')
          }
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* Investment Summary */}
        <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span>{membershipStatus?.emoji || '💰'}</span>
            Investment Summary
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Plan:</span>
              <span className="text-white">{investmentDetails.planName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Deposit Amount:</span>
              <span className="text-white">${investmentDetails.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Conversion Fee:</span>
              <span className="text-red-400">-${investmentDetails.conversionFee.toLocaleString()}</span>
            </div>
            <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
              <span className="text-purple-400">Net Investment:</span>
              <span className="text-purple-400">${investmentDetails.netAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">APY:</span>
              <span className="text-green-400">{investmentDetails.apy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Term:</span>
              <span className="text-white">{investmentDetails.termDays} days</span>
            </div>
            <div className="border-t border-gray-600 pt-2 flex justify-between font-semibold">
              <span className="text-gray-400">Projected Returns:</span>
              <span className="text-green-400">${investmentDetails.projectedReturns.toLocaleString()}</span>
            </div>
          </div>
        </Card>

        {/* Status Steps */}
        <Card className="bg-gray-800/50 border-gray-600">
          <h3 className="font-semibold text-white mb-4">Progress</h3>
          
          <div className="space-y-4">
            {/* Step 1: Deposit */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step !== 'monitoring' ? 'bg-green-500' : 'bg-yellow-500'
              }`}>
                {step !== 'monitoring' ? '✓' : '⏳'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">
                  {step === 'monitoring' ? 'Waiting for deposit...' : 'Deposit received'}
                </div>
                <div className="text-sm text-gray-400">
                  {investmentDetails.token} on {investmentDetails.network}
                </div>
              </div>
              {step === 'monitoring' && (
                <div className="text-sm text-yellow-400">
                  {formatTime(timeElapsed)}
                </div>
              )}
            </div>

            {/* Step 2: Confirmation */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'completed' ? 'bg-green-500' : 
                step === 'confirmed' ? 'bg-yellow-500' : 'bg-gray-600'
              }`}>
                {step === 'completed' ? '✓' : 
                 step === 'confirmed' ? '⏳' : '○'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">
                  {step === 'completed' ? 'Investment activated' : 
                   step === 'confirmed' ? 'Processing investment...' : 'Pending confirmation'}
                </div>
                <div className="text-sm text-gray-400">
                  Setting up your investment plan
                </div>
              </div>
            </div>

            {/* Step 3: Active */}
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'completed' ? 'bg-green-500' : 'bg-gray-600'
              }`}>
                {step === 'completed' ? '✓' : '○'}
              </div>
              <div className="flex-1">
                <div className="font-medium text-white">
                  {step === 'completed' ? 'Earning returns' : 'Investment activation'}
                </div>
                <div className="text-sm text-gray-400">
                  {step === 'completed' 
                    ? `${investmentDetails.apy}% APY now active`
                    : 'Ready to start earning'
                  }
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Deposit Details */}
        {step === 'monitoring' && (
          <Card className="bg-blue-900/20 border-blue-500/30">
            <h3 className="font-semibold text-blue-400 mb-3">Deposit Details</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Network:</span>
                <span className="text-white">{investmentDetails.network}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Token:</span>
                <span className="text-white">{investmentDetails.token}</span>
              </div>
              <div>
                <div className="text-gray-400 mb-1">Address:</div>
                <div className="font-mono text-xs text-blue-300 break-all bg-gray-800 p-2 rounded">
                  {investmentDetails.depositAddress}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {step === 'completed' ? (
            <>
              <Button
                onClick={() => onNavigate?.('investments')}
                fullWidth
                className="h-12 bg-green-600 hover:bg-green-700"
              >
                {t('investment.viewInvestments', 'View My Investments')}
              </Button>
              
              <Button
                onClick={() => onNavigate?.('dashboard')}
                variant="outline"
                fullWidth
                className="h-10 border-gray-600"
              >
                {t('investment.backToDashboard', 'Back to Dashboard')}
              </Button>
            </>
          ) : (
            <>
              <div className="text-center text-sm text-gray-400">
                {step === 'monitoring' 
                  ? 'Please wait while we confirm your deposit...'
                  : 'Setting up your investment plan...'
                }
              </div>
              
              <Button
                onClick={() => onNavigate?.('crypto')}
                variant="outline"
                fullWidth
                className="h-10 border-gray-600"
              >
                {t('investment.backToCrypto', 'Back to Crypto Wallets')}
              </Button>
            </>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};