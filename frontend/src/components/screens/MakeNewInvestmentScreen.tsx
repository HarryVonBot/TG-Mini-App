import React, { useState, useEffect } from 'react';
import { MobileLayout } from '../layout/MobileLayout';
import { Button } from '../common/Button';
import { useLanguage } from '../../hooks/useLanguage';

interface MakeNewInvestmentScreenProps {
  onBack: () => void;
  onNavigate?: any;
}

export const MakeNewInvestmentScreen: React.FC<MakeNewInvestmentScreenProps> = ({ onBack, onNavigate }) => {
  const { t } = useLanguage();

  return (
    <MobileLayout centered maxWidth="xs">
      {/* Back Button */}
      <div className="absolute top-4 left-4">
        <button 
          onClick={onBack} 
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800"
        >
          ←
        </button>
      </div>

      {/* Content */}
      <div className="text-center space-y-6">
        <h1 className="text-2xl font-bold text-white">
          {t('investment.makeNew', 'Make New Investment')}
        </h1>
        
        <p className="text-gray-400">
          {t('investment.description', 'Choose your investment plan and start earning returns.')}
        </p>

        <div className="space-y-4">
          <Button
            onClick={() => {}}
            variant="primary"
            fullWidth
            className="h-12"
          >
            {t('investment.selectPlan', 'Select Investment Plan')}
          </Button>
          
          <Button
            onClick={onBack}
            variant="outline"
            fullWidth
            className="h-12 border-gray-600"
          >
            {t('common.back', 'Back')}
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
};