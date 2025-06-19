import axios from 'axios';
import type { 
  Investment, 
  InvestmentPlan,
  InvestmentPlansResponse,
  InvestmentsResponse,
  MembershipStatus,
  MembershipTiersResponse
} from '../types';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

class ApiService {
  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Authentication
  async telegramAuth(userData: any) {
    const response = await axios.post(`${API_BASE}/auth/telegram`, userData);
    return response.data;
  }

  async telegramWebAppAuth(data: { initData: string }) {
    const response = await axios.post(`${API_BASE}/auth/telegram/webapp`, data);
    return response.data;
  }

  // Membership
  async getMembershipStatus(token: string): Promise<MembershipStatus> {
    const response = await axios.get(`${API_BASE}/membership/status`, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  async getMembershipTiers(): Promise<MembershipTiersResponse> {
    const response = await axios.get(`${API_BASE}/membership/tiers`);
    return response.data;
  }

  // Investment Plans
  async getInvestmentPlans(token: string): Promise<InvestmentPlansResponse> {
    const response = await axios.get(`${API_BASE}/investment-plans`, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  async getAllInvestmentPlans(): Promise<{ plans: InvestmentPlan[] }> {
    const response = await axios.get(`${API_BASE}/investment-plans/all`);
    return response.data;
  }

  async createInvestmentPlan(planData: any, token: string) {
    const response = await axios.post(`${API_BASE}/investment-plans`, planData, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  async updateInvestmentPlan(planId: string, planData: any, token: string) {
    const response = await axios.put(`${API_BASE}/investment-plans/${planId}`, planData, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  async deleteInvestmentPlan(planId: string, token: string) {
    const response = await axios.delete(`${API_BASE}/investment-plans/${planId}`, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  // Investments
  async getInvestments(token: string): Promise<InvestmentsResponse> {
    const response = await axios.get(`${API_BASE}/investments`, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  async createInvestment(investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'status'>, token: string) {
    const response = await axios.post(`${API_BASE}/investments`, investment, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  // Crypto & Wallet
  async verifyWalletSignature(payload: { message: string; signature: string; address: string }) {
    const response = await axios.post(`${API_BASE}/wallet/verify-signature`, payload);
    return response.data;
  }

  async getCryptoBalance(address: string) {
    const response = await axios.get(`${API_BASE}/wallet/balance/${address}`);
    return response.data;
  }

  // Bank
  async getBankAccounts(userId: string) {
    const response = await axios.get(`${API_BASE}/bank/accounts`, {
      headers: { 'X-User-ID': userId }
    });
    return response.data;
  }

  async getBankBalance(userId: string) {
    const response = await axios.get(`${API_BASE}/bank/balance`, {
      headers: { 'X-User-ID': userId }
    });
    return response.data;
  }

  // Portfolio
  async getPortfolio(token: string) {
    const response = await axios.get(`${API_BASE}/portfolio`, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  // Crypto Prices
  async getCryptoPrices() {
    const response = await axios.get(`${API_BASE}/prices`);
    return response.data;
  }

  // Profile
  async saveProfile(preferences: any, token: string) {
    const response = await axios.post(`${API_BASE}/profile`, preferences, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }

  async getProfile(userId: string, token: string) {
    const response = await axios.get(`${API_BASE}/profile/${userId}`, {
      headers: this.getAuthHeaders(token)
    });
    return response.data;
  }
}

export const apiService = new ApiService();