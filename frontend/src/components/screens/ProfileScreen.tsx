import React, { useEffect } from 'react';
import type { ScreenProps } from '../../types';
import { ScreenHeader } from '../layout/ScreenHeader';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MembershipBadge } from '../common/MembershipBadge';
import { useApp } from '../../context/AppContext';
import { useMembership } from '../../hooks/useMembership';

export const ProfileScreen: React.FC<ScreenProps> = ({ onBack, onNavigate }) => {
  const { user, setUser } = useApp();
  const { membershipStatus, fetchMembershipStatus } = useMembership(user);
  
  useEffect(() => {
    fetchMembershipStatus();
  }, [fetchMembershipStatus]);

  const handleLogout = () => {
    setUser(null);
    alert('Logged out successfully');
    onBack?.();
  };

  const handleEditProfile = () => {
    // Navigate to edit profile screen (we'll implement this)
    alert('Edit profile functionality coming soon!');
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-12 pb-8">
      <ScreenHeader title="Profile & Settings" onBack={onBack} />

      <div className="space-y-4">
        {/* User Information */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Personal Information</h3>
            <Button onClick={handleEditProfile} size="sm" variant="secondary">
              Edit
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Name</p>
              <p className="text-white font-medium">{user?.name || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="text-white font-medium">{user?.email || 'Not provided'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">User ID</p>
              <p className="text-white font-medium text-sm">{user?.id || user?.user_id || 'Not available'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Phone</p>
              <p className="text-white font-medium">{user?.phone || 'Not provided'}</p>
            </div>
          </div>
        </Card>

        {/* Membership Status */}
        <Card className="border-purple-500/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Membership Status</h3>
            <Button 
              onClick={() => onNavigate?.('membership-status')} 
              size="sm" 
              variant="secondary"
            >
              View Details
            </Button>
          </div>
          
          {membershipStatus ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MembershipBadge level={membershipStatus.level} size="lg" />
                <div>
                  <p className="text-white font-semibold text-lg">
                    {membershipStatus.emoji} {membershipStatus.level_name}
                  </p>
                  <p className="text-gray-400 text-sm">Current membership tier</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Invested</p>
                  <p className="text-white font-semibold">{formatAmount(membershipStatus.total_invested)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Available Plans</p>
                  <p className="text-white font-semibold">{membershipStatus.available_plans?.length || 0}</p>
                </div>
              </div>
              
              {membershipStatus.next_level && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">Progress to {membershipStatus.next_level_name}</p>
                    <p className="text-sm text-purple-400 font-medium">
                      {membershipStatus.amount_to_next ? formatAmount(membershipStatus.amount_to_next) + ' to go' : 'Achieved!'}
                    </p>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${Math.min(100, (membershipStatus.total_invested / (membershipStatus.total_invested + (membershipStatus.amount_to_next || 0))) * 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MembershipBadge level="club" size="lg" />
                <div>
                  <p className="text-white font-semibold text-lg">
                    🥉 Club Member
                  </p>
                  <p className="text-gray-400 text-sm">Starting membership tier</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Total Invested</p>
                  <p className="text-white font-semibold">$0</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Available Plans</p>
                  <p className="text-white font-semibold">3</p>
                </div>
              </div>
              
              <div className="bg-gray-800/50 rounded-lg p-3">
                <p className="text-sm text-gray-400 mb-2">Ready to start investing</p>
                <p className="text-sm text-purple-400">Connect a bank account or crypto wallet to begin</p>
              </div>
            </div>
          )}
        </Card>

        {/* Account Status */}
        <Card>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-400">Account Type</p>
              <p className="text-white font-semibold">
                {user?.type === 'bank' ? 'Bank Connected' : 
                 user?.type === 'crypto' ? 'Crypto Connected' : 
                 'Standard Account'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Authentication Method</p>
              <p className="text-white font-medium">{user?.auth_type || 'Email'}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-400">Member Since</p>
              <p className="text-white font-medium">June 2025</p>
            </div>
          </div>
        </Card>

        {/* Connection Status */}
        <Card>
          <h3 className="text-lg font-semibold text-white mb-3">Connection Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Bank Account</span>
              <span className={`text-sm px-2 py-1 rounded ${user?.bank_connected ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                {user?.bank_connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Crypto Wallet</span>
              <span className={`text-sm px-2 py-1 rounded ${user?.crypto_connected ? 'bg-green-900 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                {user?.crypto_connected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
          </div>
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