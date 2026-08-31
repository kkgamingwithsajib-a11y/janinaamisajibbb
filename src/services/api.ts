import { 
  PaymentMethod, 
  InvestmentPlan, 
  PlatformConfig, 
  UserAccount, 
  AdminAuditLogItem, 
  AdminDepositItem, 
  AdminWithdrawalItem 
} from '../types';

const API_BASE = '/api';

export const api = {
  // Public
  async getSettings(): Promise<PlatformConfig> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to load settings');
    const data = await res.json();
    return data.settings;
  },

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const res = await fetch(`${API_BASE}/payment-methods`);
    if (!res.ok) throw new Error('Failed to load payment methods');
    const data = await res.json();
    return data.paymentMethods;
  },

  async getPlans(): Promise<InvestmentPlan[]> {
    const res = await fetch(`${API_BASE}/plans`);
    if (!res.ok) throw new Error('Failed to load plans');
    const data = await res.json();
    return data.plans;
  },

  // User Auth
  async register(body: { name: string; username?: string; email: string; password: string; confirmPassword?: string; referralCode?: string }): Promise<{ token: string; user: UserAccount }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async login(body: { identifier?: string; email?: string; password: string }): Promise<{ token: string; user: UserAccount }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async getMe(token: string): Promise<UserAccount> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Session expired');
    return data.user;
  },

  async logout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // ignore
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.message;
  },

  async changePassword(token: string, currentPassword: string, newPassword: string): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Password update failed');
    return data.message;
  },

  async submitDeposit(token: string, depositData: { amountUsd: number; paymentMethodId: string; txHash?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/user/deposits`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(depositData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Deposit submission failed');
    return data;
  },

  async submitWithdrawal(token: string, withdrawalData: { amountUsd: number; destinationAddress: string; currency?: string; network?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/user/withdrawals`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(withdrawalData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Withdrawal submission failed');
    return data;
  },

  // Admin Auth
  async adminLogin(body: { email?: string; username?: string; passkey?: string; password?: string; twoFactorCode?: string }): Promise<{ token: string; admin: any }> {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin login failed');
    return data;
  },

  async adminCheckToken(token: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Admin session expired');
    return data.admin;
  },

  async adminLogout(token: string): Promise<void> {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {
      // ignore
    }
  },

  async changeAdminCredentials(
    token: string,
    payload: { currentPassword?: string; newEmail?: string; newUsername?: string; newPassword?: string }
  ): Promise<{ message: string; admin: any }> {
    const res = await fetch(`${API_BASE}/admin/change-credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update admin credentials');
    return data;
  },

  // Admin Payment Methods
  async adminGetPaymentMethods(token: string): Promise<PaymentMethod[]> {
    const res = await fetch(`${API_BASE}/admin/payment-methods`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch payment methods');
    return data.paymentMethods;
  },

  async adminAddPaymentMethod(token: string, payload: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const res = await fetch(`${API_BASE}/admin/payment-methods`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add payment method');
    return data.paymentMethod;
  },

  async adminUpdatePaymentMethod(token: string, id: string, payload: Partial<PaymentMethod>): Promise<PaymentMethod> {
    const res = await fetch(`${API_BASE}/admin/payment-methods/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update payment method');
    return data.paymentMethod;
  },

  async adminDeletePaymentMethod(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/payment-methods/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete payment method');
  },

  // Admin Plans
  async adminGetPlans(token: string): Promise<InvestmentPlan[]> {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load plans');
    return data.plans;
  },

  async adminAddPlan(token: string, payload: Partial<InvestmentPlan>): Promise<InvestmentPlan> {
    const res = await fetch(`${API_BASE}/admin/plans`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add plan');
    return data.plan;
  },

  async adminUpdatePlan(token: string, id: string, payload: Partial<InvestmentPlan>): Promise<InvestmentPlan> {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update plan');
    return data.plan;
  },

  async adminDeletePlan(token: string, id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/plans/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete plan');
  },

  // Admin Settings
  async adminGetSettings(token: string): Promise<PlatformConfig> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load settings');
    return data.settings;
  },

  async adminUpdateSettings(token: string, payload: Partial<PlatformConfig>): Promise<PlatformConfig> {
    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data.settings;
  },

  // Admin Users
  async adminGetUsers(token: string, params?: { search?: string; role?: string; status?: string }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.role) query.set('role', params.role);
    if (params?.status) query.set('status', params.status);

    const res = await fetch(`${API_BASE}/admin/users?${query.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load users');
    return data.users;
  },

  async adminGetUser(token: string, id: string): Promise<UserAccount> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load user details');
    return data.user;
  },

  async adminUpdateUserStatus(token: string, id: string, status: string, role?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ status, role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update user status');
    return data.user;
  },

  async adminAdjustBalance(token: string, id: string, amount: number, actionType: 'credit' | 'debit' | 'set', note?: string): Promise<number> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/balance`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ amount, actionType, note }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to adjust balance');
    return data.newBalance;
  },

  async adminResetPassword(token: string, id: string, newPassword?: string): Promise<string> {
    const res = await fetch(`${API_BASE}/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data.temporaryPassword;
  },

  // Admin Deposits
  async adminGetDeposits(token: string): Promise<AdminDepositItem[]> {
    const res = await fetch(`${API_BASE}/admin/deposits`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load deposits');
    return data.deposits;
  },

  async adminApproveDeposit(token: string, id: string, adminNote?: string): Promise<AdminDepositItem> {
    const res = await fetch(`${API_BASE}/admin/deposits/${id}/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ adminNote }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve deposit');
    return data.deposit;
  },

  async adminRejectDeposit(token: string, id: string, adminNote?: string): Promise<AdminDepositItem> {
    const res = await fetch(`${API_BASE}/admin/deposits/${id}/reject`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ adminNote }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject deposit');
    return data.deposit;
  },

  // Admin Withdrawals
  async adminGetWithdrawals(token: string): Promise<AdminWithdrawalItem[]> {
    const res = await fetch(`${API_BASE}/admin/withdrawals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load withdrawals');
    return data.withdrawals;
  },

  async adminApproveWithdrawal(token: string, id: string, txHash?: string, adminNote?: string): Promise<AdminWithdrawalItem> {
    const res = await fetch(`${API_BASE}/admin/withdrawals/${id}/approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ txHash, adminNote }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to approve withdrawal');
    return data.withdrawal;
  },

  async adminRejectWithdrawal(token: string, id: string, adminNote?: string): Promise<AdminWithdrawalItem> {
    const res = await fetch(`${API_BASE}/admin/withdrawals/${id}/reject`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ adminNote }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reject withdrawal');
    return data.withdrawal;
  },

  async adminBatchApproveWithdrawals(token: string, withdrawalIds: string[]): Promise<string> {
    const res = await fetch(`${API_BASE}/admin/withdrawals/batch-approve`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}` 
      },
      body: JSON.stringify({ withdrawalIds }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to batch approve withdrawals');
    return data.message;
  },

  // Admin Audit Logs
  async adminGetAuditLogs(token: string): Promise<AdminAuditLogItem[]> {
    const res = await fetch(`${API_BASE}/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load audit logs');
    return data.auditLogs;
  }
};
