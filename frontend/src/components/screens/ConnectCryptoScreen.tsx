import React, { useState } from 'react';
import type { ConnectionScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { CleanHeader } from '../layout/CleanHeader';
import { VonVaultWalletModal } from '../common/VonVaultWalletModal';
import { MultiWalletPortfolio } from '../common/MultiWalletPortfolio';
import { useLanguage } from '../../hooks/useLanguage';
import { type Web3ModalConnection } from '../../services/Web3ModalService';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectCryptoScreen: React.FC<ConnectionScreenProps> = ({ onBack, onNavigate, onConnect }) => {
  const [error, setError] = useState<string | null>(null);
  const [connectedWallets, setConnectedWallets] = useState<Web3ModalConnection[]>([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const { t } = useLanguage();

  // Handle wallet connection from VonVault modal
  const handleWalletConnect = async (connection: Web3ModalConnection) => {
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
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6"
          >
            <div className="flex items-start gap-3">
              <span className="text-red-400 text-xl">⚠️</span>
              <div>
                <h4 className="text-red-400 font-semibold mb-1">
                  {t('crypto.connectionError', 'Connection Error')}
                </h4>
                <p className="text-red-200 text-sm">{error}</p>
                <Button
                  onClick={() => setError(null)}
                  size="sm"
                  variant="outline"
                  className="mt-2 border-red-500/30 text-red-400"
                >
                  {t('crypto.dismiss', 'Dismiss')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      {showPortfolio && connectedWallets.length > 0 ? (
        /* Portfolio View */
        <div className="space-y-6">
          <MultiWalletPortfolio
            connectedWallets={connectedWallets}
            onMakeInvestment={handleMakeInvestment}
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