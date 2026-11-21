import axios from "axios";
import { API_BASE_URL } from "./constants";

export interface PackageFeature {
  id: string;
  package_id: string;
  text: string;
  sort_order: number;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  icon: string;
  is_popular: boolean;
  is_active: boolean;
  has_theme_studio: boolean;
  sort_order: number;
  additional_note?: string;
  button_text: string;
  button_variant: string;
  features: PackageFeature[];
  created_at: string;
  updated_at: string;
}

export interface PackageRequest {
  name: string;
  description: string;
  price: number;
  currency: string;
  icon: string;
  is_popular: boolean;
  is_active: boolean;
  has_theme_studio: boolean;
  sort_order: number;
  additional_note?: string;
  button_text: string;
  button_variant: string;
  features: string[];
}

export interface PackageResponse {
  package: Package;
}

export interface PackagesResponse {
  packages: Package[];
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

export const packageApi = {
  getActivePackages: async (): Promise<ApiResponse<Package[]>> => {
    try {
      const response = await api.get<Package[]>("/packages");
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch packages",
      };
    }
  },

  getPackages: async (page: number = 1, limit: number = 10): Promise<ApiResponse<PackagesResponse>> => {
    try {
      const response = await api.get<PackagesResponse>(`/admin/packages?page=${page}&limit=${limit}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch packages",
      };
    }
  },

  getPackage: async (packageId: string): Promise<ApiResponse<PackageResponse>> => {
    try {
      const response = await api.get<PackageResponse>(`/admin/packages/${packageId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to fetch package",
      };
    }
  },

  createPackage: async (data: PackageRequest): Promise<ApiResponse<PackageResponse>> => {
    try {
      const response = await api.post<PackageResponse>("/admin/packages", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to create package",
      };
    }
  },

  updatePackage: async (packageId: string, data: PackageRequest): Promise<ApiResponse<PackageResponse>> => {
    try {
      const response = await api.put<PackageResponse>(`/admin/packages/${packageId}`, data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to update package",
      };
    }
  },

  togglePackage: async (packageId: string, isActive: boolean): Promise<ApiResponse> => {
    try {
      const response = await api.patch(`/admin/packages/${packageId}/toggle`, { is_active: isActive });
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to toggle package",
      };
    }
  },

  deletePackage: async (packageId: string): Promise<ApiResponse> => {
    try {
      const response = await api.delete(`/admin/packages/${packageId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to delete package",
      };
    }
  },
};



