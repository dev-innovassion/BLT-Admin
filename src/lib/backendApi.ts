import { BACKEND_BASE_URL } from "./constants";

export async function backendRequest(
  method: string,
  endpoint: string,
  data?: unknown,
  token?: string
): Promise<Response> {
  const url = `${BACKEND_BASE_URL}${endpoint}`;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (response.status === 401) {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    } catch {}
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(errorData.error || errorData.message || `HTTP ${response.status}`);
  }

  return response;
}

export const backendAuthApi = {
  async login(email: string, password: string, platformCode?: string) {
    const payload: Record<string, unknown> = { email, password };
    if (platformCode && platformCode.trim() !== "") {
      payload.platform_code = platformCode.trim();
    }

    const response = await backendRequest("POST", "/api/v1/auth/login", payload);
    const data = await response.json();
    
    return {
      id: data.user.id,
      email: data.user.email,
      name: `${data.user.first_name} ${data.user.last_name}`,
      role: data.user.role,
      permissions: data.permissions || [],
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      createdAt: data.user.created_at,
      platform_code: data.user.platform_code,
      assigned_platform_code: data.user.assigned_platform_code,
    };
  },

  async logout(token: string) {
    await backendRequest("POST", "/api/v1/auth/logout", undefined, token);
  },

  async getCurrentUser(token: string) {
    const response = await backendRequest("GET", "/api/v1/user/profile", undefined, token);
    const data = await response.json();
    return {
      id: data.id,
      email: data.email,
      name: `${data.first_name} ${data.last_name}`,
      role: data.role,
      createdAt: data.created_at,
      platform_code: data.platform_code,
      assigned_platform_code: data.assigned_platform_code,
    };
  },
};

export const backendPermissionApi = {
  async getAllModules(token: string) {
    const response = await backendRequest("GET", "/api/v1/permissions/modules", undefined, token);
    return await response.json();
  },

  async getRolePermissions(role: string, token: string) {
    const response = await backendRequest(
      "GET",
      `/api/v1/permissions/role/${role}`,
      undefined,
      token
    );
    return await response.json();
  },

  async getModulePermissions(role: string, token: string) {
    const response = await backendRequest(
      "GET",
      `/api/v1/permissions/role/${role}/modules`,
      undefined,
      token
    );
    return await response.json();
  },

  async assignPermissions(role: string, permissions: string[], token: string) {
    const response = await backendRequest(
      "POST",
      "/api/v1/permissions/assign",
      { role, permissions },
      token
    );
    return await response.json();
  },
};

