import axios from "axios";
import { API_BASE_URL } from "./constants";

const getAuthToken = () => {
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

export interface LandingPageContentSection {
  section_key: string;
  content: Record<string, any>;
}

export interface LandingPageContentRequest {
  section_key: string;
  content: Record<string, any>;
}

export interface LandingPageContentResponse {
  section_key: string;
  content: Record<string, any>;
}

export interface LandingPageContentsResponse {
  sections: LandingPageContentResponse[];
}

export const landingPageContentApi = {
  async getContent(): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
    try {
      const response = await axios.get(`${API_BASE_URL}/landing-page/content`);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to get content",
      };
    }
  },

  async getAllSections(): Promise<{
    success: boolean;
    data?: LandingPageContentsResponse;
    error?: string;
  }> {
    try {
      const response = await api.get("/admin/landing-page/content");
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to get content sections",
      };
    }
  },

  async createSection(
    data: LandingPageContentRequest
  ): Promise<{ success: boolean; data?: LandingPageContentResponse; error?: string }> {
    try {
      const response = await api.post("/admin/landing-page/content", data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to create content section",
      };
    }
  },

  async updateSection(
    sectionKey: string,
    data: LandingPageContentRequest
  ): Promise<{ success: boolean; data?: LandingPageContentResponse; error?: string }> {
    try {
      const response = await api.put(`/admin/landing-page/content/${sectionKey}`, data);
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to update content section",
      };
    }
  },

  async deleteSection(sectionKey: string): Promise<{ success: boolean; error?: string }> {
    try {
      await api.delete(`/admin/landing-page/content/${sectionKey}`);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to delete content section",
      };
    }
  },

  async uploadImage(file: File): Promise<{ success: boolean; data?: { url: string; path: string }; error?: string }> {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const token = getAuthToken();

      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.post(
        `${API_BASE_URL}/admin/landing-page/upload-image`,
        formData,
        { headers }
      );
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error?.response?.data?.error || error?.message || "Failed to upload image",
      };
    }
  },
};

