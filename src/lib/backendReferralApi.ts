import { backendRequest } from "./backendApi";

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  is_active: boolean;
  total_uses: number;
  max_uses?: number;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referrer_name?: string;
  referred_id: string;
  referred_name?: string;
  referral_code_id?: string;
  status: string;
  level: number;
  reward_amount: string;
  reward_currency: string;
  reward_status: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralReward {
  id: string;
  referral_id: string;
  referrer_id: string;
  amount: string;
  currency: string;
  reward_type: string;
  transaction_id?: string;
  status: string;
  paid_at?: string;
  created_at: string;
}

export interface ReferralDashboard {
  total_referrals: number;
  active_referrals: number;
  total_rewards: string;
  paid_rewards: string;
  pending_rewards: string;
  recent_referrals: Referral[];
  top_referrers?: TopReferrer[];
}

export interface TopReferrer {
  user_id: string;
  user_name: string;
  total_referrals: number;
  total_rewards: string;
}

export interface CreateReferralCodeRequest {
  code?: string;
  max_uses?: number;
  expires_at?: string;
}

export interface UpdateReferralCodeRequest {
  is_active?: boolean;
  max_uses?: number;
  expires_at?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export const backendReferralApi = {
  async createReferralCode(data: CreateReferralCodeRequest, token: string): Promise<ReferralCode> {
    const response = await backendRequest("POST", "/api/v1/referrals/codes", data, token);
    return await response.json();
  },

  async getReferralCode(token: string): Promise<ReferralCode> {
    const response = await backendRequest("GET", "/api/v1/referrals/codes", undefined, token);
    return await response.json();
  },

  async updateReferralCode(codeId: string, data: UpdateReferralCodeRequest, token: string): Promise<ReferralCode> {
    const response = await backendRequest("PUT", `/api/v1/referrals/codes/${codeId}`, data, token);
    return await response.json();
  },

  async getReferrals(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      level?: number;
    },
    token: string
  ): Promise<PaginatedResponse<Referral>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.level) queryParams.append("level", params.level.toString());

    const url = `/api/v1/referrals${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await backendRequest("GET", url, undefined, token);
    return await response.json();
  },

  async getReferralDashboard(token: string): Promise<ReferralDashboard> {
    const response = await backendRequest("GET", "/api/v1/referrals/dashboard", undefined, token);
    return await response.json();
  },

  async getReferralRewards(
    params: {
      page?: number;
      limit?: number;
      status?: string;
      reward_type?: string;
    },
    token: string
  ): Promise<PaginatedResponse<ReferralReward>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.status) queryParams.append("status", params.status);
    if (params.reward_type) queryParams.append("reward_type", params.reward_type);

    const url = `/api/v1/referrals/rewards${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await backendRequest("GET", url, undefined, token);
    return await response.json();
  },

  async listAllReferrals(
    params: {
      page?: number;
      limit?: number;
      referrer_id?: string;
      referred_id?: string;
      status?: string;
      level?: number;
    },
    token: string
  ): Promise<PaginatedResponse<Referral>> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.referrer_id) queryParams.append("referrer_id", params.referrer_id);
    if (params.referred_id) queryParams.append("referred_id", params.referred_id);
    if (params.status) queryParams.append("status", params.status);
    if (params.level) queryParams.append("level", params.level.toString());

    const url = `/api/v1/referrals/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await backendRequest("GET", url, undefined, token);
    return await response.json();
  },

  async getTopReferrers(limit: number = 10, token: string): Promise<{ top_referrers: TopReferrer[] }> {
    const response = await backendRequest("GET", `/api/v1/referrals/admin/top?limit=${limit}`, undefined, token);
    return await response.json();
  },
};


