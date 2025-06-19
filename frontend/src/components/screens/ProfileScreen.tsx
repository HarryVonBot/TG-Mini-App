import React from 'react';
import type { ScreenProps } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';

export const ProfileScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const { user, setUser } = useApp();
  const userEmail = user?.email || 'user@vonvault.com';

  const handleLogout = () => {
    setUser(null);
    alert('Logged out successfully');
    onBack?.();
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      <ScreenHeader title="Profile & Settings" onBack={onBack} />

      <div className="space-y-4">
        <Card>
          <p className="text-sm text-gray-400 mb-1">Logged in as</p>
          <p className="text-white font-semibold">{userEmail}</p>
        </Card>

        <Card>
          <p className="text-sm text-gray-400 mb-1">Account Type</p>
          <p className="text-white font-semibold">
            {user?.type === 'bank' ? 'Bank Connected' : 'Crypto Connected'}
          </p>
        </Card>

        <Card>
          <p className="text-sm text-gray-400 mb-1">Member Since</p>
          <p className="text-white font-semibold">June 2025</p>
        </Card>

        {/* Admin Section */}
        <Card className="border-purple-500/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Admin Panel</p>
              <p className="text-sm text-gray-400">Manage investment plans</p>
            </div>
            <Button
              onClick={() => onNavigate?.('admin-plans')}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Manage Plans
            </Button>
          </div>
        </Card>

        <Button
          onClick={handleLogout}
          variant="danger"
          fullWidth
          size="lg"
        >
          Log Out
        </Button>
      </div>
    </div>
  );
};