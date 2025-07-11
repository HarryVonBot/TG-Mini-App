import React, { useState } from 'react';
import type { ScreenProps } from '../../types';
import { Button } from '../common/Button';
import { LanguageSelector } from '../common/LanguageSelector';
import { AvatarSelector } from '../common/AvatarSelector';
import { useTheme } from '../../contexts/ThemeContext'; // Fixed: direct import from contexts
import { ThemeToggle } from '../../hooks/useTheme'; // ThemeToggle still in hooks file
import { useSettings } from '../../hooks/useSettings';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../hooks/useAuth';
// REMOVED: framer-motion dependency
import { apiService } from '../../services/api';

export const ProfileScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const { user, setUser } = useApp();
  const { t, currentLanguage } = useLanguage(); // Add currentLanguage to force re-render
  const { logout } = useAuth();
  const { theme } = useTheme();
  const { settings, loading, error, actions } = useSettings();
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);
  const [avatarUpdating, setAvatarUpdating] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  // Handle avatar selection
  const handleAvatarSelect = async (avatarId: string) => {
    console.log('ProfileScreen: Starting avatar selection');
    console.log('ProfileScreen: Current user:', user);
    console.log('ProfileScreen: Avatar updating state:', avatarUpdating);
    
    setAvatarUpdating(true);
    try {
      const response = await apiService.selectAvatar(avatarId);
      console.log('ProfileScreen: API response:', response);
      
      // Update user in context
      if (user) {
        const updatedUser = {
          ...user,
          avatar_id: avatarId
        };
        console.log('ProfileScreen: Updating user with new avatar:', updatedUser);
        setUser(updatedUser);
      } else {
        console.warn('ProfileScreen: No user found in context');
      }
      
      return response;
    } catch (error) {
      console.error('ProfileScreen: Failed to select avatar:', error);
      throw error;
    } finally {
      setAvatarUpdating(false);
    }
  };
  // Handle notification toggle
  const handleNotificationToggle = async () => {
    const success = await actions.toggleNotifications();
    if (!success && error) {
      alert(error); // In production, use proper toast/modal
    }
  };

  // Handle achievement notification toggle
  const handleAchievementNotificationToggle = async () => {
    // Store achievement notifications preference with vonvault prefix (per API standardization)
    const currentSetting = localStorage.getItem('vonvault-achievement-notifications') !== 'false';
    localStorage.setItem('vonvault-achievement-notifications', (!currentSetting).toString());
  };

  // Handle biometric toggle
  const handleBiometricToggle = async () => {
    if (!settings.biometric.setup) {
      setShowBiometricSetup(true);
      return;
    }
    
    const success = await actions.toggleBiometric();
    if (!success && error) {
      alert(error); // In production, use proper toast/modal
    }
  };

  // Handle biometric setup
  const handleBiometricSetup = async () => {
    if (!user?.email) {
      alert('User email not available');
      return;
    }

    const success = await actions.setupBiometric(user.id || 'user123', user.email);
    if (success) {
      setShowBiometricSetup(false);
      alert('Biometric authentication setup successful!');
    } else if (error) {
      alert(error);
    }
  };

  // Check if user is admin
  const isAdmin = user?.is_admin || (user?.email && ['admin@vonartis.com', 'security@vonartis.com'].includes(user.email));

  const profileSections = [
    // Admin section - only show for admin users
    ...(isAdmin ? [{
      title: 'Administration',
      items: [
        { label: 'Admin Dashboard', icon: '⚡', action: 'admin-dashboard' },
        { label: 'User Management', icon: '👥', action: 'admin-users' },
        { label: 'Investment Analytics', icon: '📊', action: 'admin-investments' },
        { label: 'Crypto Analytics', icon: '₿', action: 'admin-crypto' },
        { label: 'System Plans', icon: '📋', action: 'admin-plans' }
      ]
    }] : []),
    {
      title: t('profile:sections.personalInfo.title', 'Account'),
      items: [
        { label: t('profile:editProfile', 'Edit Profile'), icon: '👤', action: 'edit-profile' },
        { label: t('profile:sections.membership.title', 'Membership Status'), icon: '⭐', action: 'membership-status' },
        { label: t('profile:sections.enhanced2fa.title', '2FA Security'), icon: '🔐', action: '2fa-setup' }
      ]
    },
    {
      title: t('profile:financial', 'Financial'),
      items: [
        { label: t('profile:funds', 'Available Funds'), icon: '💰', action: 'funds' },
        { label: t('profile:walletManager', 'Wallet Manager'), icon: '👛', action: 'wallet-manager' },
        { label: t('profile:transfer', 'Transfer Funds'), icon: '💸', action: 'transfer-funds' }
      ]
    },
    {
      title: t('profile:achievements', 'Achievements & Rewards'),
      items: [
        { label: t('profile:viewAchievements', 'View Achievements'), icon: '🏆', action: 'achievements' },
        { label: t('profile:achievementNotifications', 'Achievement Notifications'), icon: '🎉', component: 'achievement-notifications' }
      ]
    },
    {
      title: 'Support & Help',
      items: [
        { label: 'Submit Support Ticket', icon: '🎫', action: 'create-ticket' },
        { label: 'My Support Tickets', icon: '📋', action: 'my-tickets' }
      ]
    },
    {
      title: t('profile:preferences', 'Preferences'),
      items: [
        { label: t('profile:sections.language.title', 'Language'), icon: '🌐', component: 'language' },
        { label: t('profile:theme', 'Dark/Light Mode'), icon: '🌙', component: 'theme' },
        { label: t('profile:notifications', 'Push Notifications'), icon: '🔔', component: 'notifications' },
        { label: t('profile:biometric', 'Biometric Auth'), icon: '👆', component: 'biometric' },
        { label: t('profile:terms', 'Terms of Service'), icon: '📄', action: 'terms-of-service' },
        { label: t('profile:privacy', 'Privacy Policy'), icon: '🔒', action: 'privacy-policy' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <AvatarSelector
          currentAvatarId={user?.avatar_id}
          onAvatarSelect={handleAvatarSelect}
          loading={avatarUpdating}
        />
      </div>

      {/* Profile Sections */}
      {profileSections.map((section, index) => (
        <div key={index} className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-300">
            {section.title}
          </h2>
          
          <div className="space-y-2">
            {section.items.map((item, itemIndex) => (
              <div
                key={itemIndex}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-white">{item.label}</span>
                </div>
                
                {item.component === 'language' ? (
                  <LanguageSelector variant="compact" />
                ) : item.component === 'theme' ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">{theme === 'dark' ? 'Dark' : 'Light'}</span>
                    <ThemeToggle />
                  </div>
                ) : item.component === 'notifications' ? (
                  <div className="flex items-center gap-2">
                    {!settings.notifications.supported && (
                      <span className="text-xs text-gray-400">Not supported</span>
                    )}
                    <button
                      onClick={handleNotificationToggle}
                      disabled={!settings.notifications.supported || loading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.enabled ? 'bg-purple-600' : 'bg-gray-600'
                      } ${!settings.notifications.supported ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ) : item.component === 'achievement-notifications' ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAchievementNotificationToggle}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localStorage.getItem('vonvault-achievement-notifications') !== 'false' ? 'bg-purple-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localStorage.getItem('vonvault-achievement-notifications') !== 'false' ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ) : item.component === 'biometric' ? (
                  <div className="flex items-center gap-2">
                    {!settings.biometric.supported && (
                      <span className="text-xs text-gray-400">Not supported</span>
                    )}
                    {!settings.biometric.available && settings.biometric.supported && (
                      <span className="text-xs text-gray-400">Not available</span>
                    )}
                    <button
                      onClick={handleBiometricToggle}
                      disabled={!settings.biometric.supported || !settings.biometric.available || loading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.biometric.enabled ? 'bg-purple-600' : 'bg-gray-600'
                      } ${(!settings.biometric.supported || !settings.biometric.available) ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.biometric.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => item.action && onNavigate?.(item.action as any)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Logout Button */}
      <div className="pt-6 border-t border-gray-700">
        <Button
          onClick={handleLogout}
          variant="outline"
          fullWidth
          className="border-red-500 text-red-400 hover:bg-red-500/10"
        >
          {t('profile:logout', 'Sign Out')}
        </Button>
      </div>

      {/* Biometric Setup Modal */}
      
        {showBiometricSetup && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <div
              className="bg-gray-800 rounded-lg p-6 max-w-sm w-full"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">👆</div>
                <h2 className="text-xl font-bold mb-2">Setup Biometric Auth</h2>
                <p className="text-sm text-gray-400">
                  Use your fingerprint or face to securely access your account and authorize transactions.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleBiometricSetup}
                  fullWidth
                  disabled={loading}
                  loading={loading}
                >
                  Setup Biometric Auth
                </Button>
                
                <Button
                  onClick={() => setShowBiometricSetup(false)}
                  variant="outline"
                  fullWidth
                >
                  Cancel
                </Button>
              </div>

              <div className="mt-4 text-xs text-gray-500 text-center">
                Your biometric data stays secure on your device and is never shared.
              </div>
            </div>
          </div>
        )}
      
    </div>
  );
};