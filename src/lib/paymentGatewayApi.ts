import type { Withdrawal, UpdateWithdrawal, Deposit } from "@shared/schema";

const PAYMENT_GATEWAY_API_URL =
  import.meta.env.VITE_PAYMENT_GATEWAY_URL || "http://localhost:8081";

function getAuthToken(): string {
  return localStorage.getItem("access_token") || "";
}

export type GatewayWithdrawal = Withdrawal & {
  rawStatus: string;
  userEmail?: string;
};

export type GatewayDeposit = Deposit & {
  rawStatus: string;
  userEmail?: string;
};

function mapWithdrawal(w: any): GatewayWithdrawal {
  return {
    id: w.id,
    userId: w.user_id,
    userName: w.user_name || w.user_id,
    userEmail: w.user_email,
    amount: parseFloat(w.amount),
    method: "e_wallet",
    status: mapStatus(w.status),
    timestamp: w.created_at,
    processedBy: w.admin_approved_by || undefined,
    processedAt: w.admin_approved_at || undefined,
    notes: w.gateway_response || undefined,
    rawStatus: w.status,
  };
}

function mapDeposit(w: any): GatewayDeposit {
  return {
    id: w.id,
    userId: w.user_id,
    userName: w.user_name || w.user_id,
    userEmail: w.user_email,
    amount: parseFloat(w.amount),
    method: "e_wallet",
    status: mapStatus(w.status),
    timestamp: w.created_at,
    processedBy: w.admin_approved_by || undefined,
    processedAt: w.admin_approved_at || undefined,
    notes: w.gateway_response || undefined,
    rawStatus: w.status,
  };
}

function mapStatus(status: string): "pending" | "approved" | "rejected" {
  switch (status) {
    case "pending":
      return "pending";
    case "completed":
    case "processing":
      return "approved";
    case "failed":
    case "cancelled":
      return "rejected";
    default:
      return "pending";
  }
}

export const paymentGatewayApi = {
  async fetchWithdrawals(status: string = "all"): Promise<GatewayWithdrawal[]> {
    const token = getAuthToken();
    const res = await fetch(
      `${PAYMENT_GATEWAY_API_URL}/api/v1/admin/withdrawals?status=${status}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to fetch withdrawals (${res.status})`);
    }

    const data = await res.json();
    return (data.withdrawals || []).map(mapWithdrawal);
  },

  async fetchDeposits(status: string = "all"): Promise<GatewayDeposit[]> {
    const token = getAuthToken();
    const res = await fetch(
      `${PAYMENT_GATEWAY_API_URL}/api/v1/admin/deposits?status=${status}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to fetch deposits (${res.status})`);
    }

    const data = await res.json();
    return (data.deposits || []).map(mapDeposit);
  },

  async approveWithdrawal(id: string): Promise<void> {
    const token = getAuthToken();
    const res = await fetch(
      `${PAYMENT_GATEWAY_API_URL}/api/v1/admin/withdrawals/${id}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to approve withdrawal (${res.status})`);
    }
  },

  async rejectWithdrawal(id: string, data: UpdateWithdrawal): Promise<void> {
    const token = getAuthToken();
    const res = await fetch(
      `${PAYMENT_GATEWAY_API_URL}/api/v1/admin/withdrawals/${id}/reject`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: data.notes || "Rejected by admin" }),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Failed to reject withdrawal (${res.status})`);
    }
  },
};
