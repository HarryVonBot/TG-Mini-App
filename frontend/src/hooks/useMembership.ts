import { useState, useCallback, useEffect } from 'react';
import type { User, MembershipStatus } from '../types';
import { apiService } from '../services/api';

export const useMembership = (user: User | null) => {
  const [membershipStatus, setMembershipStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchMembershipStatus = useCallback(async () => {
    console.log('fetchMembershipStatus called');
    console.log('User provided to useMembership:', user);
    console.log('User token:', user?.token);
    
    if (!user?.token) {
      console.log('No token available, cannot fetch membership status');
      setMembershipStatus(null);
      return;
    }

    // SPECIAL HANDLING FOR HARDCODED ADMINS
    const isHardcodedAdmin = user.email && ['admin@vonartis.com', 'security@vonartis.com'].includes(user.email);
    
    if (isHardcodedAdmin) {
      console.log('fetchMembershipStatus: Hardcoded admin detected, providing Elite Member status');
      const adminMembershipStatus = {
        level: 'elite',
        level_name: 'Elite',
        emoji: '👑',
        total_invested: 1000000, // $1M for display
        current_min: 250000,
        current_max: null,
        next_level: null,
        next_level_name: null,
        amount_to_next: null,
        available_plans: []
      };
      setMembershipStatus(adminMembershipStatus);
      return;
    }

    // NORMAL USERS: Fetch from API
    try {
      setLoading(true);
      console.log('Attempting to fetch membership status...');
      const status = await apiService.getMembershipStatus(user.token);
      console.log('Membership status fetched:', status);
      setMembershipStatus(status);
    } catch (error) {
      console.error('Error fetching membership status:', error);
      setMembershipStatus(null);
    } finally {
      setLoading(false);
    }
  }, [user?.token, user?.email]);

  // Automatically fetch membership status when user becomes available
  useEffect(() => {
    console.log('useMembership useEffect triggered, user:', user);
    console.log('useMembership useEffect triggered, user?.token:', user?.token);
    
    if (!user?.token) {
      console.log('useMembership: No user token, clearing membership status');
      setMembershipStatus(null);
      setLoading(false);
      return;
    }

    // SPECIAL HANDLING FOR HARDCODED ADMINS
    const isHardcodedAdmin = user.email && ['admin@vonartis.com', 'security@vonartis.com'].includes(user.email);
    
    if (isHardcodedAdmin) {
      console.log('useMembership: Hardcoded admin detected, providing Elite Member status');
      const adminMembershipStatus = {
        level: 'elite',
        level_name: 'Elite',
        emoji: '👑',
        total_invested: 1000000, // $1M for display
        current_min: 250000,
        current_max: null,
        next_level: null,
        next_level_name: null,
        amount_to_next: null,
        available_plans: []
      };
      setMembershipStatus(adminMembershipStatus);
      setLoading(false);
      return;
    }

    // NORMAL USERS: Fetch membership status from API
    console.log('useMembership: Regular user token detected, fetching membership status');
    fetchMembershipStatus();
  }, [user?.token, user?.email, fetchMembershipStatus]);

  return {
    membershipStatus,
    fetchMembershipStatus,
    loading
  };
};