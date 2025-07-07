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
  }, [user?.token]);

  // Automatically fetch membership status when user becomes available
  useEffect(() => {
    console.log('useMembership useEffect triggered, user:', user);
    console.log('useMembership useEffect triggered, user?.token:', user?.token);
    
    if (user?.token) {
      console.log('useMembership: User token detected, fetching membership status');
      fetchMembershipStatus();
    } else {
      console.log('useMembership: No user token, clearing membership status');
      setMembershipStatus(null);
      setLoading(false);
    }
  }, [user?.token, fetchMembershipStatus]);

  return {
    membershipStatus,
    fetchMembershipStatus,
    loading
  };
};