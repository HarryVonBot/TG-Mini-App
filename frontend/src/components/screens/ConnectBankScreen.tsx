import React, { useState } from 'react';
import type { ConnectionScreenProps } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export const ConnectBankScreen: React.FC<ConnectionScreenProps> = ({ onConnect, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'start' | 'connecting' | 'success'>('start');

  const handleConnect = async () => {
    if (!onConnect) {
      console.error('onConnect prop is missing');
      return;
    }
    
    setLoading(true);
    setStep('connecting');
    
    try {
      // Simulate API call with progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('success');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Call the parent's connect handler
      await onConnect();
    } catch (error) {
      console.error('Bank connection error:', error);
      alert('Connection failed. Please try again.');
      setStep('start');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Skip to dashboard or next screen
    onBack?.(); // This will be handled by parent to navigate appropriately
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      <ScreenHeader title="Connect Bank" onBack={onBack} />

      <Card padding="lg" className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Secure Bank Linking</h2>
        </div>
        
        <p className="text-sm text-gray-400 text-center mb-4">
          Securely link your bank account to transfer and withdraw funds. Your data is encrypted and protected.
        </p>
        
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>Bank-level security encryption</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>Read-only access to balance</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>Powered by Teller API</span>
          </div>
        </div>
        
        <Button
          onClick={handleConnect}
          loading={loading}
          disabled={loading}
          fullWidth
          size="lg"
        >
          {step === 'connecting' ? 'Connecting to Bank...' : 
           step === 'success' ? 'Connected! ✓' : 
           'Link Bank Account'}
        </Button>
      </Card>
    </div>
  );
};