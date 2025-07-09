import React, { useState, useEffect } from 'react';
// REMOVED: framer-motion dependency
import { Card } from './Card';
import { Button } from './Button';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { apiService } from '../../services/api';

interface VonVaultWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateWallet: (walletData: any) => void;
}

export const VonVaultWalletModal: React.FC<VonVaultWalletModalProps> = ({
  isOpen,
  onClose,
  onCreateWallet
}) => {
  const { t } = useLanguage();
  const { user } = useApp();
  const [isCreating, setIsCreating] = useState(false);
  const [walletName, setWalletName] = useState('');
  const [securityPin, setSecurityPin] = useState('');

  useEffect(() => {
    if (isOpen) {
      setWalletName('');
      setSecurityPin('');
    }
  }, [isOpen]);

  const handleCreateWallet = async () => {
    if (!walletName || !securityPin) return;

    setIsCreating(true);
    try {
      const response = await apiService.createVonVaultWallet(user?.token, {
        name: walletName,
        securityPin: securityPin
      });

      if (response.success) {
        onCreateWallet(response.wallet);
        onClose();
      }
    } catch (error) {
      console.error('Error creating VonVault wallet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="vonvault-wallet-modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 bg-gradient-to-br from-purple-900/20 to-purple-900/10 border-purple-500/30">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">🏛️</div>
          <h2 className="text-2xl font-bold text-purple-400 mb-2">
            {t('wallet.vonvault.title', 'Create VonVault Wallet')}
          </h2>
          <p className="text-gray-400 text-sm">
            {t('wallet.vonvault.description', 'Your secure, built-in wallet solution')}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('wallet.vonvault.name', 'Wallet Name')}
            </label>
            <input
              type="text"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Enter wallet name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('wallet.vonvault.pin', 'Security PIN')}
            </label>
            <input
              type="password"
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
              placeholder="Enter 6-digit PIN"
              maxLength={6}
            />
          </div>

          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="text-blue-400 mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-blue-400 mb-1">
                  {t('wallet.vonvault.features.title', 'VonVault Features')}
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• {t('wallet.vonvault.features.secure', 'Bank-grade security')}</li>
                  <li>• {t('wallet.vonvault.features.integrated', 'Seamless integration')}</li>
                  <li>• {t('wallet.vonvault.features.backup', 'Automatic backup')}</li>
                  <li>• {t('wallet.vonvault.features.support', '24/7 support')}</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
              disabled={isCreating}
            >
              {t('wallet.vonvault.cancel', 'Cancel')}
            </Button>
            <Button
              onClick={handleCreateWallet}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
              disabled={isCreating || !walletName || !securityPin}
            >
              {isCreating 
                ? t('wallet.vonvault.creating', 'Creating...') 
                : t('wallet.vonvault.create', 'Create Wallet')
              }
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};