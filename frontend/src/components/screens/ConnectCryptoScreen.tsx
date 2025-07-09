import React, { useState } from 'react';
import type { ConnectionScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { CleanHeader } from '../layout/CleanHeader';
import { VonVaultWalletModal } from '../common/VonVaultWalletModal';
import { MultiWalletPortfolio } from '../common/MultiWalletPortfolio';
import { useLanguage } from '../../hooks/useLanguage';
import { useApp } from '../../context/AppContext';
import { type VonVaultWeb3Connection } from '../../services/Web3ModalService';
// REMOVED: framer-motion dependency

export const ConnectCryptoScreen: React.FC<ConnectionScreenProps> = ({ onBack, onNavigate, onConnect }) => {
  const [error, setError] = useState<string | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<VonVaultWeb3Connection[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const { t } = useLanguage();
  const { membershipStatus } = useApp();

  // Handle wallet connection from VonVault modal
  const handleWalletConnect = async (connection: VonVaultWeb3Connection) => {
    // Add wallet to connected wallets list
    setConnectedWallets(prev => {
      const existing = prev.find(w => w.address.toLowerCase() === connection.address.toLowerCase());
      if (existing) {
        return prev; // Don't add duplicates
      }
      return [...prev, connection];
    });

    // Show portfolio view
    setShowPortfolio(true);

    // Call parent onConnect if provided
    if (onConnect) {
      await onConnect();
    }
  };

  // Handle connection errors
  const handleConnectionError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // Handle Make Investment button
  const handleMakeInvestment = () => {
    onNavigate?.('new-investment');
  };

  // Handle Add Another Wallet
  const handleAddAnotherWallet = () => {
    setShowWalletModal(true);
  };

  return (
    <MobileLayoutWithTabs 
      className="max-w-lg mx-auto"
    >
      <CleanHeader 
        title={showPortfolio 
          ? t('portfolio.title', 'Your Crypto Portfolio') 
          : t('crypto.title', 'Connect Crypto Wallet')
        }
        onBack={onBack}
      />

      {/* Error Display */}
      {/* Error Display */}
      {error && (
        <div className="error-display mb-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-400 font-medium">Connection Error</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-red-300 mt-2">{error}</p>
          <div className="mt-3">
            <Button
              onClick={() => setError(null)}
              variant="outline"
              className="text-red-400 border-red-500/50 hover:bg-red-500/10"
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {showPortfolio && connectedWallets.length > 0 ? (
        /* Portfolio View */
        <div className="space-y-6">
          <MultiWalletPortfolio
            connectedWallets={connectedWallets}
            onMakeInvestment={handleMakeInvestment}
            membershipStatus={membershipStatus}
          />
          
          {/* Add Another Wallet Option */}
          <Card className="bg-gray-800/30 border-gray-600">
            <div className="text-center space-y-3">
              <h3 className="font-semibold text-white">
                {t('portfolio.addAnother', 'Connect Another Wallet')}
              </h3>
              <p className="text-sm text-gray-400">
                {t('portfolio.addAnotherDesc', 'Diversify your portfolio by connecting multiple wallets')}
              </p>
              <Button
                onClick={handleAddAnotherWallet}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:border-purple-500"
              >
                {t('portfolio.addWallet', '+ Add Another Wallet')}
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* Initial Connection View */
        <div className="w-full space-y-6">
          {/* VonVault Custom Wallet Interface */}
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30 text-center">
              <div className="space-y-6">
                <div className="text-4xl">🔗</div>
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-3">
                    {t('crypto.connectTitle', 'Connect Your Crypto Wallet')}
                  </h2>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-center gap-3 text-green-400">
                      <span className="text-xl">✅</span>
                      <span className="font-medium">
                        {t('crypto.investmentReady', 'Investment Ready')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 text-green-400">
                      <span className="text-xl">✅</span>
                      <span className="font-medium">
                        {t('crypto.multipleWallets', 'Connect Multiple Wallets Simultaneously')}
                      </span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setShowWalletModal(true)}
                    disabled={showPortfolio}
                    fullWidth
                    className="h-14 text-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                  >
                    {showPortfolio 
                      ? t('crypto.connected', 'Connected!') 
                      : t('crypto.connectButton', '🌐 Connect Your Wallet')
                    }
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* VonVault Custom Wallet Selection Modal */}
      <VonVaultWalletModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onWalletConnect={handleWalletConnect}
        onError={handleConnectionError}
      />
    </MobileLayoutWithTabs>
  );
};