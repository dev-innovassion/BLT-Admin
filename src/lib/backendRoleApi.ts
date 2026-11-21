import { backendRequest } from "./backendApi";

export interface CreateRoleRequest {
  name: string;
  display_name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  display_name?: string;
  description?: string;
  permissions?: string[];
}

export interface RoleResponse {
  id: string;
  name: string;
  display_name: string;
  description: string;
  is_system_role: boolean;
  permissions: string[];
  created_at: string;
  updated_at: string;
}

export const backendRoleApi = {
  async getRoles(token: string): Promise<RoleResponse[]> {
    const response = await backendRequest("GET", "/api/v1/roles", undefined, token);
    const result = await response.json();
    return result.roles || [];
  },

  async getRole(id: string, token: string): Promise<RoleResponse> {
    const response = await backendRequest("GET", `/api/v1/roles/${id}`, undefined, token);
    return await response.json();
  },

  async createRole(data: CreateRoleRequest, token: string): Promise<RoleResponse> {
    const response = await backendRequest("POST", "/api/v1/roles", data, token);
    const result = await response.json();
    return result.role;
  },

  async updateRole(id: string, data: UpdateRoleRequest, token: string): Promise<RoleResponse> {
    const response = await backendRequest("PUT", `/api/v1/roles/${id}`, data, token);
    const result = await response.json();
    return result.role;
  },

  async deleteRole(id: string, token: string): Promise<void> {
    await backendRequest("DELETE", `/api/v1/roles/${id}`, undefined, token);
  },
};

