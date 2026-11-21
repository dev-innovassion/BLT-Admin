import axios from "axios";
import { API_BASE_URL } from "./constants";

export interface CryptoPaymentNetwork {
  id: string;
  name: string;
  symbol: string;
  network: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CryptoPaymentAddress {
  id: string;
  network_id: string;
  address: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CryptoPaymentTip {
  id: string;
  network_id: string;
  amount: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  error?: string;
}

const getAuthToken = (): string | null => {
  return localStorage.getItem("access_token");
};

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
  });
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        try {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        } catch {}
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      return Promise.reject(error);
    }
  );
  return instance;
};

const api = createAxiosInstance();

export const cryptoApi = {
  getPaymentDetails: async (): Promise<ApiResponse<{ networks: CryptoPaymentNetwork[]; addresses: CryptoPaymentAddress[]; tips: CryptoPaymentTip[] }>> => {
    try {
      const res = await api.get("/crypto/payment-details");
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to fetch crypto payment details" };
    }
  },
  getNetworksPublic: async (): Promise<ApiResponse<CryptoPaymentNetwork[]>> => {
    try {
      const res = await api.get("/crypto/networks");
      return { success: true, data: res.data.networks || res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to fetch networks" };
    }
  },

  getNetworks: async (): Promise<ApiResponse<CryptoPaymentNetwork[]>> => {
    try {
      const res = await api.get("/admin/crypto/networks");
      return { success: true, data: res.data.data || res.data.networks || res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to fetch networks" };
    }
  },
  createNetwork: async (payload: { name: string; symbol: string; network: string; is_active: boolean; sort_order: number; }): Promise<ApiResponse<CryptoPaymentNetwork>> => {
    try {
      const res = await api.post("/admin/crypto/networks", payload);
      return { success: true, data: res.data.data || res.data.network };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to create network" };
    }
  },
  updateNetwork: async (id: string, payload: { name: string; symbol: string; network: string; is_active: boolean; sort_order: number; }): Promise<ApiResponse<CryptoPaymentNetwork>> => {
    try {
      const res = await api.put(`/admin/crypto/networks/${id}`, payload);
      return { success: true, data: res.data.data || res.data.network };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to update network" };
    }
  },
  deleteNetwork: async (id: string): Promise<ApiResponse> => {
    try {
      const res = await api.delete(`/admin/crypto/networks/${id}`);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to delete network" };
    }
  },

  getAddresses: async (): Promise<ApiResponse<CryptoPaymentAddress[]>> => {
    try {
      const res = await api.get("/admin/crypto/addresses");
      return { success: true, data: res.data.data || res.data.addresses || res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to fetch addresses" };
    }
  },
  createAddress: async (payload: { network_id: string; address: string; is_active: boolean; }): Promise<ApiResponse<CryptoPaymentAddress>> => {
    try {
      const res = await api.post("/admin/crypto/addresses", payload);
      return { success: true, data: res.data.data || res.data.address };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to create address" };
    }
  },
  updateAddress: async (id: string, payload: { network_id: string; address: string; is_active: boolean; }): Promise<ApiResponse<CryptoPaymentAddress>> => {
    try {
      const res = await api.put(`/admin/crypto/addresses/${id}`, payload);
      return { success: true, data: res.data.data || res.data.address };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to update address" };
    }
  },
  deleteAddress: async (id: string): Promise<ApiResponse> => {
    try {
      const res = await api.delete(`/admin/crypto/addresses/${id}`);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to delete address" };
    }
  },

  getTips: async (): Promise<ApiResponse<CryptoPaymentTip[]>> => {
    try {
      const res = await api.get("/admin/crypto/tips");
      return { success: true, data: res.data.data || res.data.tips || res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to fetch tips" };
    }
  },
  createTip: async (payload: { network_id: string; amount: string; currency: string; is_active: boolean; }): Promise<ApiResponse<CryptoPaymentTip>> => {
    try {
      const res = await api.post("/admin/crypto/tips", payload);
      return { success: true, data: res.data.data || res.data.tip };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to create tip" };
    }
  },
  updateTip: async (id: string, payload: { network_id: string; amount: string; currency: string; is_active: boolean; }): Promise<ApiResponse<CryptoPaymentTip>> => {
    try {
      const res = await api.put(`/admin/crypto/tips/${id}`, payload);
      return { success: true, data: res.data.data || res.data.tip };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to update tip" };
    }
  },
  deleteTip: async (id: string): Promise<ApiResponse> => {
    try {
      const res = await api.delete(`/admin/crypto/tips/${id}`);
      return { success: true, data: res.data };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || error.message || "Failed to delete tip" };
    }
  },
};


