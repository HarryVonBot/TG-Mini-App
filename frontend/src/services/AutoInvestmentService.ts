// Auto-investment service for VonVault
import type { User } from '../types';

export interface AutoInvestRule {
  id: string;
  userId: string;
  type: 'recurring' | 'threshold';
  name: string;
  isActive: boolean;
  
  // Recurring investment settings
  amount?: number;
  frequency?: 'daily' | 'weekly' | 'monthly';
  nextExecution?: string;
  
  // Threshold-based settings
  triggerAmount?: number;
  investmentPercentage?: number;
  lastChecked?: string;
  
  // Common settings
  targetMembership?: string;
  maxInvestment?: number;
  
  // Statistics
  createdAt: string;
  lastTriggered?: string;
  totalInvested: number;
  totalExecutions: number;
  
  // Conditions
  pauseConditions?: {
    maxMonthlyAmount?: number;
    pauseOnMembershipReached?: boolean;
    pauseOnTargetReached?: boolean;
  };
}

export interface AutoInvestExecution {
  id: string;
  ruleId: string;
  amount: number;
  executedAt: string;
  success: boolean;
  reason?: string;
  membershipBefore?: string;
  membershipAfter?: string;
}

class AutoInvestmentService {
  private readonly STORAGE_KEY = 'autoInvestRules';
  private readonly EXECUTIONS_KEY = 'autoInvestExecutions';

  // Create a new auto-investment rule
  public createRule(rule: Omit<AutoInvestRule, 'id' | 'createdAt' | 'totalInvested' | 'totalExecutions'>): AutoInvestRule {
    const newRule: AutoInvestRule = {
      ...rule,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      totalInvested: 0,
      totalExecutions: 0,
      nextExecution: rule.type === 'recurring' ? this.calculateNextExecution(rule.frequency!) : undefined
    };

    const rules = this.getRules();
    rules.push(newRule);
    this.saveRules(rules);
    
    return newRule;
  }

  // Get all rules for a user
  public getRules(userId?: string): AutoInvestRule[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    const rules = stored ? JSON.parse(stored) : [];
    return userId ? rules.filter((rule: AutoInvestRule) => rule.userId === userId) : rules;
  }

  // Update a rule
  public updateRule(ruleId: string, updates: Partial<AutoInvestRule>): boolean {
    const rules = this.getRules();
    const index = rules.findIndex(rule => rule.id === ruleId);
    
    if (index === -1) return false;
    
    rules[index] = { ...rules[index], ...updates };
    this.saveRules(rules);
    return true;
  }

  // Delete a rule
  public deleteRule(ruleId: string): boolean {
    const rules = this.getRules();
    const filteredRules = rules.filter(rule => rule.id !== ruleId);
    
    if (filteredRules.length === rules.length) return false;
    
    this.saveRules(filteredRules);
    return true;
  }

  // Check and execute auto-investment rules
  public async checkAndExecuteRules(user: User, cryptoBalance: number = 0): Promise<AutoInvestExecution[]> {
    const rules = this.getRules(user.id).filter(rule => rule.isActive);
    const executions: AutoInvestExecution[] = [];

    for (const rule of rules) {
      try {
        const execution = await this.executeRuleIfReady(rule, user, cryptoBalance);
        if (execution) {
          executions.push(execution);
          this.updateRuleAfterExecution(rule, execution);
        }
      } catch (error) {
        console.error(`Error executing rule ${rule.id}:`, error);
      }
    }

    return executions;
  }

  // Execute a specific rule if conditions are met
  private async executeRuleIfReady(
    rule: AutoInvestRule, 
    user: User, 
    cryptoBalance: number
  ): Promise<AutoInvestExecution | null> {
    const now = new Date();

    // Check recurring rules
    if (rule.type === 'recurring') {
      if (!rule.nextExecution || new Date(rule.nextExecution) > now) {
        return null; // Not time yet
      }

      const amount = rule.amount!;
      if (cryptoBalance < amount) {
        return this.createFailedExecution(rule.id, amount, 'Insufficient crypto balance');
      }

      return this.createInvestment(rule, amount, user);
    }

    // Check threshold rules
    if (rule.type === 'threshold') {
      if (cryptoBalance < rule.triggerAmount!) {
        return null; // Threshold not met
      }

      const amount = Math.floor(cryptoBalance * (rule.investmentPercentage! / 100));
      if (amount < 100) { // Minimum investment threshold
        return null;
      }

      return this.createInvestment(rule, amount, user);
    }

    return null;
  }

  // Create the actual investment
  private async createInvestment(
    rule: AutoInvestRule, 
    amount: number, 
    user: User
  ): Promise<AutoInvestExecution> {
    try {
      // In production, this would call the actual investment API
      const investmentResult = await this.simulateInvestment(amount, user);
      
      return {
        id: Date.now().toString(),
        ruleId: rule.id,
        amount,
        executedAt: new Date().toISOString(),
        success: investmentResult.success,
        reason: investmentResult.reason,
        membershipBefore: investmentResult.membershipBefore,
        membershipAfter: investmentResult.membershipAfter
      };
    } catch (error) {
      return this.createFailedExecution(rule.id, amount, 'Investment API error');
    }
  }

  // Simulate investment for demo purposes
  private async simulateInvestment(amount: number, user: User): Promise<{
    success: boolean;
    reason?: string;
    membershipBefore: string;
    membershipAfter: string;
  }> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const membershipBefore = user.investment_tier || 'basic';
    
    // Calculate new membership after investment
    const currentInvestment = user.total_investment || 0;
    const newTotal = currentInvestment + amount;
    
    let membershipAfter = membershipBefore;
    if (newTotal >= 250000) membershipAfter = 'elite';
    else if (newTotal >= 100000) membershipAfter = 'vip';
    else if (newTotal >= 50000) membershipAfter = 'premium';
    else if (newTotal >= 20000) membershipAfter = 'club';

    return {
      success: true,
      membershipBefore,
      membershipAfter
    };
  }

  // Create a failed execution record
  private createFailedExecution(ruleId: string, amount: number, reason: string): AutoInvestExecution {
    return {
      id: Date.now().toString(),
      ruleId,
      amount,
      executedAt: new Date().toISOString(),
      success: false,
      reason
    };
  }

  // Update rule statistics after execution
  private updateRuleAfterExecution(rule: AutoInvestRule, execution: AutoInvestExecution): void {
    const updates: Partial<AutoInvestRule> = {
      lastTriggered: execution.executedAt,
      totalExecutions: rule.totalExecutions + 1
    };

    if (execution.success) {
      updates.totalInvested = rule.totalInvested + execution.amount;
    }

    // Calculate next execution for recurring rules
    if (rule.type === 'recurring') {
      updates.nextExecution = this.calculateNextExecution(rule.frequency!);
    }

    this.updateRule(rule.id, updates);
  }

  // Calculate next execution time for recurring investments
  private calculateNextExecution(frequency: 'daily' | 'weekly' | 'monthly'): string {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        now.setDate(now.getDate() + 1);
        break;
      case 'weekly':
        now.setDate(now.getDate() + 7);
        break;
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
    }
    
    return now.toISOString();
  }

  // Get execution history
  public getExecutions(ruleId?: string): AutoInvestExecution[] {
    const stored = localStorage.getItem(this.EXECUTIONS_KEY);
    const executions = stored ? JSON.parse(stored) : [];
    return ruleId ? executions.filter((exec: AutoInvestExecution) => exec.ruleId === ruleId) : executions;
  }

  // Save executions to storage
  private saveExecutions(executions: AutoInvestExecution[]): void {
    localStorage.setItem(this.EXECUTIONS_KEY, JSON.stringify(executions));
  }

  // Save rules to storage
  private saveRules(rules: AutoInvestRule[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(rules));
  }

  // Get auto-investment statistics
  public getStatistics(userId: string): {
    totalRules: number;
    activeRules: number;
    totalInvested: number;
    totalExecutions: number;
    successRate: number;
    avgInvestmentAmount: number;
  } {
    const rules = this.getRules(userId);
    const executions = this.getExecutions();
    const userExecutions = executions.filter(exec => 
      rules.some(rule => rule.id === exec.ruleId)
    );

    const successfulExecutions = userExecutions.filter(exec => exec.success);
    const totalInvested = rules.reduce((sum, rule) => sum + rule.totalInvested, 0);
    const totalExecutions = userExecutions.length;

    return {
      totalRules: rules.length,
      activeRules: rules.filter(rule => rule.isActive).length,
      totalInvested,
      totalExecutions,
      successRate: totalExecutions > 0 ? (successfulExecutions.length / totalExecutions) * 100 : 0,
      avgInvestmentAmount: successfulExecutions.length > 0 
        ? successfulExecutions.reduce((sum, exec) => sum + exec.amount, 0) / successfulExecutions.length 
        : 0
    };
  }

  // Smart suggestions for auto-investment rules
  public getSuggestions(user: User, cryptoBalance: number, membershipStatus: any): {
    type: 'recurring' | 'threshold';
    name: string;
    description: string;
    settings: any;
    benefit: string;
  }[] {
    const suggestions = [];

    // Suggest recurring investment based on membership
    if (!this.getRules(user.id).some(rule => rule.type === 'recurring')) {
      const monthlyAmount = Math.min(cryptoBalance * 0.1, 2000);
      if (monthlyAmount >= 100) {
        suggestions.push({
          type: 'recurring' as const,
          name: 'Monthly Growth Plan',
          description: `Invest $${monthlyAmount.toFixed(0)} monthly for consistent growth`,
          settings: { amount: monthlyAmount, frequency: 'monthly' },
          benefit: 'Build wealth consistently with dollar-cost averaging'
        });
      }
    }

    // Suggest threshold-based investment for surplus funds
    if (!this.getRules(user.id).some(rule => rule.type === 'threshold')) {
      const threshold = Math.max(cryptoBalance * 0.5, 1000);
      suggestions.push({
        type: 'threshold' as const,
        name: 'Surplus Auto-Invest',
        description: `Auto-invest 60% when crypto balance exceeds $${threshold.toFixed(0)}`,
        settings: { triggerAmount: threshold, investmentPercentage: 60 },
        benefit: 'Automatically invest excess crypto for maximum returns'
      });
    }

    return suggestions;
  }
}

export const autoInvestmentService = new AutoInvestmentService();