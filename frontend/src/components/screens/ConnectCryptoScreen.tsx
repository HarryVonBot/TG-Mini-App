import React, { useState } from 'react';
import type { ConnectionScreenProps } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

export const ConnectCryptoScreen: React.FC<ConnectionScreenProps> = ({ onConnect, onBack }) => {
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      // Check if MetaMask is installed
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          // Simulate signature verification
          await new Promise(resolve => setTimeout(resolve, 1500));
          onConnect?.();
        }
      } else {
        alert('Please install MetaMask to connect your wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      alert('Failed to connect wallet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      <ScreenHeader title="Connect Wallet" onBack={onBack} />

      <Card padding="lg" className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 9.75c-.465 2.023-1.688 2.023-1.688 2.023l1.688-7.523s-7.125 0-7.125 3.375c0 1.125.75 1.5.75 1.5s-1.5.75-1.5 2.625c0 2.625 3 2.625 3 2.625s-1.5 1.125-1.5 2.625c0 2.25 3.375 2.25 3.375 2.25h3z"/>
            </svg>
          </div>
          <h2 className="text-lg font-semibold mb-2">Connect Your Wallet</h2>
        </div>
        
        <p className="text-sm text-gray-400 text-center mb-4">
          Connect your crypto wallet to access DeFi features and manage your digital assets.
        </p>
        
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>Self-custody wallet support</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>MetaMask & WalletConnect</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
            <span>Signature-based authentication</span>
          </div>
        </div>
        
        <Button
          onClick={handleConnect}
          loading={loading}
          fullWidth
          size="lg"
          className="bg-orange-500 hover:bg-orange-600"
        >
          Connect MetaMask
        </Button>
      </Card>
    </div>
  );
};