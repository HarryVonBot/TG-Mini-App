import React, { useState } from 'react';
import type { ScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { MobileLayout } from '../layout/MobileLayout';
import { useLanguage } from '../../hooks/useLanguage';
import { useLoadingState, LOADING_KEYS } from '../../hooks/useLoadingState';

export const AuthenticatorSetupScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const [code, setCode] = useState('');
  const { t } = useLanguage();
  
  // === STANDARDIZED LOADING STATE MANAGEMENT ===
  const { withLoading, isLoading } = useLoadingState();

  // QR Code configuration
  const QR_CODE_SIZE = '200x200';
  const QR_SERVICE_URL = 'https://chart.googleapis.com/chart';
  const DEMO_SECRET = 'JBSWY3DPEHPK3PXP'; // TODO: Replace with actual user secret
  const qrCodeUrl = `${QR_SERVICE_URL}?chs=${QR_CODE_SIZE}&cht=qr&chl=otpauth://totp/VonVault:user@example.com?secret=${DEMO_SECRET}&issuer=VonVault`;

  const handleVerify = async () => {
    await withLoading(LOADING_KEYS.AUTH, async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        onNavigate?.('verification-success');
      } catch (error) {
        console.error('Verification failed:', error);
      }
    });
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
        <div className="text-6xl mb-4 text-center">🔐</div>
        <h1 className="text-2xl font-bold text-center mb-2">
          {t('authenticator.title', 'Authenticator Setup')}
        </h1>
        <p className="text-center text-sm text-gray-400">
          {t('authenticator.subtitle', 'Scan QR code with your authenticator app')}
        </p>
      </div>

      <div className="w-full space-y-6">
        {/* QR Code */}
        <div className="text-center">
          <div className="bg-white p-4 rounded-lg inline-block">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-48 h-48"
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
          <h3 className="font-semibold text-blue-300 mb-2">
            {t('authenticator.instructions', 'Instructions')}
          </h3>
          <ol className="text-sm text-gray-300 space-y-2">
            <li>1. {t('authenticator.step1', 'Open your authenticator app')}</li>
            <li>2. {t('authenticator.step2', 'Scan the QR code above')}</li>
            <li>3. {t('authenticator.step3', 'Enter the 6-digit code below')}</li>
          </ol>
        </div>

        <Input
          label={t('authenticator.code', 'Verification Code')}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="000000"
          maxLength={6}
          inputMode="numeric"
          className="text-center text-lg"
        />

        <Button 
          onClick={handleVerify}
          disabled={isLoading(LOADING_KEYS.AUTH) || code.length !== 6}
          loading={loading}
          fullWidth
        >
          {t('authenticator.verify', 'Verify & Complete')}
        </Button>
      </div>
    </MobileLayout>
  );
};