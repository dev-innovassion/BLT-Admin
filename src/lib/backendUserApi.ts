import { backendRequest } from "./backendApi";

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: "super_admin" | "admin" | "operator" | "agent" | "user";
}

export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export const backendUserApi = {
  async createUser(data: CreateUserRequest, token: string): Promise<UserResponse> {
    const response = await backendRequest("POST", "/api/v1/admin/users", data, token);
    const result = await response.json();
    return result.user;
  },

  async getUsers(token: string, offset: number = 0, limit: number = 100, filterByCreator?: string | null): Promise<{ users: UserResponse[]; total: number }> {
    let url = `/api/v1/admin/users?offset=${offset}&limit=${limit}`;
    if (filterByCreator) {
      url += `&filter_by_creator=${filterByCreator}`;
    }
    const response = await backendRequest("GET", url, undefined, token);
    return await response.json();
  },

  async updateUser(userId: string, data: Partial<CreateUserRequest> & { is_active?: boolean; is_verified?: boolean }, token: string): Promise<UserResponse> {
    const response = await backendRequest("PUT", `/api/v1/admin/users/${userId}`, data, token);
    const result = await response.json();
    return result.user;
  },
};

