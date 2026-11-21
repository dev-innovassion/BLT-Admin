import axios from "axios";
import { API_BASE_URL } from "./constants";

export interface BusinessOrder {
  id: string;
  user_id: string;
  country: string;
  country_code: string;
  flag: string;
  selected_plan: string;
  selected_plan_id: string;
  site_name: string;
  theme?: string;
  otp_code?: string;
  order_id: string;
  status: "draft" | "submitted" | "completed" | "cancelled";
  total_amount: number;
  currency: string;
  payment_status: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateOrderRequest {
  country: string;
  country_code: string;
  flag: string;
  selected_plan: string;
  selected_plan_id: string;
  site_name: string;
  theme?: string;
  otp_code?: string;
  notes?: string;
}

export interface UpdateOrderRequest {
  status?: "draft" | "submitted" | "completed" | "cancelled";
  payment_status?: string;
  payment_method?: string;
  payment_reference?: string;
  notes?: string;
}

export interface OrderResponse {
  order: BusinessOrder;
}

export interface OrdersResponse {
  orders: BusinessOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface ApiResponse<T> {
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
    headers: {
      "Content-Type": "application/json",
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
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

export const orderApi = {
  createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    const response = await api.post<OrderResponse>("/platform/orders", data);
    return {
      success: true,
      data: response.data,
    };
  },

  getUserOrders: async (page: number = 1, limit: number = 10): Promise<ApiResponse<OrdersResponse>> => {
    const response = await api.get<OrdersResponse>(`/platform/orders?page=${page}&limit=${limit}`);
    return {
      success: true,
      data: response.data,
    };
  },

  getOrder: async (orderId: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await api.get<OrderResponse>(`/platform/orders/${orderId}`);
    return {
      success: true,
      data: response.data,
    };
  },

  updateOrder: async (orderId: string, data: UpdateOrderRequest): Promise<ApiResponse<OrderResponse>> => {
    const response = await api.put<OrderResponse>(`/platform/orders/${orderId}`, data);
    return {
      success: true,
      data: response.data,
    };
  },

  submitOrder: async (orderId: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await api.post<OrderResponse>(`/platform/orders/${orderId}/submit`);
    return {
      success: true,
      data: response.data,
    };
  },

  completeOrder: async (orderId: string): Promise<ApiResponse<OrderResponse>> => {
    const response = await api.post<OrderResponse>(`/platform/orders/${orderId}/complete`);
    return {
      success: true,
      data: response.data,
    };
  },

  getAllOrders: async (
    page: number = 1,
    limit: number = 10,
    filters?: { status?: string; payment_status?: string; user_id?: string }
  ): Promise<ApiResponse<OrdersResponse>> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (filters?.status) params.append("status", filters.status);
      if (filters?.payment_status) params.append("payment_status", filters.payment_status);
      if (filters?.user_id) params.append("user_id", filters.user_id);

      const response = await api.get<OrdersResponse>(`/admin/orders?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch orders",
      };
    }
  },
};

