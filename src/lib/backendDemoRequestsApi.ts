import axios from "axios";
import { API_BASE_URL } from "./constants";

const getAuthToken = () => {
  return localStorage.getItem("access_token");
};

export interface DemoRequest {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  country?: string;
  message?: string;
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface DemoRequestListResponse {
  data: DemoRequest[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface UpdateStatusRequest {
  status: "pending" | "contacted" | "scheduled" | "completed" | "cancelled";
}

export const demoRequestsApi = {
  async getAllDemoRequests(
    page: number = 1,
    perPage: number = 20,
    filters?: { status?: string; search?: string }
  ): Promise<{ success: boolean; data?: DemoRequestListResponse; error?: string }> {
    try {
      const token = getAuthToken();
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: perPage.toString(),
      });

      if (filters?.status) {
        params.append("status", filters.status);
      }
      if (filters?.search) {
        params.append("search", filters.search);
      }

      const response = await axios.get<DemoRequestListResponse>(
        `${API_BASE_URL}/admin/demo-requests?${params.toString()}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to fetch demo requests",
      };
    }
  },

  async getDemoRequestById(id: string): Promise<{ success: boolean; data?: DemoRequest; error?: string }> {
    try {
      const token = getAuthToken();
      const response = await axios.get<DemoRequest>(`${API_BASE_URL}/admin/demo-requests/${id}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });

      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to fetch demo request",
      };
    }
  },

  async updateDemoRequestStatus(
    id: string,
    status: UpdateStatusRequest["status"]
  ): Promise<{ success: boolean; data?: DemoRequest; error?: string }> {
    try {
      const token = getAuthToken();
      const response = await axios.put<DemoRequest>(
        `${API_BASE_URL}/admin/demo-requests/${id}/status`,
        { status },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined,
          },
        }
      );

      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to update demo request status",
      };
    }
  },
};

