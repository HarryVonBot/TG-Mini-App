import React, { useState } from 'react';
import type { ConnectionScreenProps } from '../../types';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { MobileLayoutWithTabs } from '../layout/MobileLayoutWithTabs';
import { CleanHeader } from '../layout/CleanHeader';
import { VonVaultWalletModal } from '../common/VonVaultWalletModal';
import { useLanguage } from '../../hooks/useLanguage';
import { type Web3ModalConnection } from '../../services/Web3ModalService';
import { motion, AnimatePresence } from 'framer-motion';

export const ConnectCryptoScreen: React.FC<ConnectionScreenProps> = ({ onBack, onNavigate, onConnect }) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Web3ModalConnection | null>(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const { t } = useLanguage();

  // Handle wallet connection from VonVault modal
  const handleWalletConnect = async (connection: Web3ModalConnection) => {
    setSuccess(connection);

    // Call parent onConnect if provided
    if (onConnect) {
      await onConnect();
    }

    // Delay then navigate to success
    setTimeout(() => {
      onNavigate?.('verification-success');
    }, 2000);
  };

  // Handle connection errors
  const handleConnectionError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <MobileLayoutWithTabs showTabs={false}>
      <CleanHeader title="🔗 Connect Crypto Wallet" onBack={onBack} />
      
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
                  disabled={!!success}
                  fullWidth
                  className="h-14 text-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  {success 
                    ? t('crypto.connected', 'Connected!') 
                    : t('crypto.connectButton', '🌐 Connect Your Wallet')
                  }
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="bg-red-900/20 border-red-500/30">
                <div className="flex items-start gap-3">
                  <div className="text-red-400 text-xl">❌</div>
                  <div>
                    <h4 className="text-red-400 font-semibold mb-1">
                      {t('crypto.connectionFailed', 'Connection Failed')}
                    </h4>
                    <p className="text-sm text-red-200">{error}</p>
                    <Button
                      onClick={() => setError(null)}
                      size="sm"
                      variant="outline"
                      className="mt-3 border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      {t('crypto.tryAgain', 'Try Again')}
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Success Animation */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <Card className="bg-green-900/20 border-green-500/30 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="text-green-400 text-6xl mb-4"
                >
                  ✅
                </motion.div>
                
                <h4 className="text-green-400 font-semibold text-lg mb-2">
                  {t('crypto.connectionSuccess', 'Wallet Connected!')}
                </h4>
                
                <div className="space-y-2 text-sm text-green-200">
                  <div>
                    <span className="text-gray-400">{t('crypto.wallet', 'Wallet')}: </span>
                    <span className="font-medium">{success.walletInfo?.name || 'Connected Wallet'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">{t('crypto.address', 'Address')}: </span>
                    <span className="font-mono text-xs">
                      {success.address.slice(0, 6)}...{success.address.slice(-4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400">{t('crypto.network', 'Network')}: </span>
                    <span className="font-medium">
                      {success.chainId === 1 ? 'Ethereum' : `Chain ${success.chainId}`}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-green-300">
                  {t('crypto.redirecting', 'Redirecting to dashboard...')}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Notice */}
        <Card className="bg-blue-900/20 border-blue-500/30">
          <div className="flex items-start gap-3">
            <div className="text-blue-400 text-xl">🔒</div>
            <div>
              <h4 className="text-blue-400 font-semibold mb-2">
                {t('crypto.security', 'Security & Privacy')}
              </h4>
              <p className="text-sm text-blue-200">
                {t('crypto.securityDesc', 'VonVault never has access to your private keys. Your wallet remains fully under your control at all times.')}
              </p>
            </div>
          </div>
        </Card>

        {/* Benefits */}
        <Card className="bg-green-900/20 border-green-500/30">
          <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
            <span>✨</span>
            {t('crypto.benefits', 'Crypto Connection Benefits')}
          </h4>
          <div className="text-sm text-green-200 space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{t('crypto.benefit1', 'Connect to 500+ wallets including hardware wallets')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{t('crypto.benefit2', 'Cross-device support (desktop ↔ mobile)')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{t('crypto.benefit3', 'Instant deposits and withdrawals')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">✓</span>
              <span>{t('crypto.benefit4', 'Multi-chain support (Ethereum, Polygon, Arbitrum)')}</span>
            </div>
          </div>
        </Card>
      </div>

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