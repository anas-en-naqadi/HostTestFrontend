import axiosClient from "@/lib/axios";
import { ApiRole, CreateRoleDto, UpdateRoleDto } from "@/types/role.types";

// Response types
interface RoleResponse {
  success: boolean;
  message: string;
  data: ApiRole;
}

interface RolesListResponse {
  success: boolean;
  message: string;
  data: ApiRole[];
}

// Fetch all roles
export const fetchRoles = async (): Promise<RolesListResponse> => {
  const { data } = await axiosClient.get('/roles');
  return data;
};

// Get a single role by ID
export const getRole = async (roleId: number): Promise<RoleResponse> => {
  const { data } = await axiosClient.get(`/roles/${roleId}`);
  return data;
};

// Create a new role
export const createRole = async (roleData: CreateRoleDto): Promise<RoleResponse> => {
  const { data } = await axiosClient.post('/roles', roleData);
  return data;
};

// Update an existing role
export const updateRole = async (roleId: number, roleData: UpdateRoleDto): Promise<RoleResponse> => {
  const { data } = await axiosClient.put(`/roles/${roleId}`, roleData);
  return data;
};

// Delete a role
export const removeRole = async (roleId: number): Promise<{ success: boolean; message: string }> => {
  const { data } = await axiosClient.delete(`/roles/${roleId}`);
  return data;
};

// Assign permissions to a role
export const assignPermissions = async (roleId: number, permissionIds: number[]): Promise<{ success: boolean; message: string }> => {
  const payload = permissionIds.map(permissionId => ({
    role_id: roleId,
    permission_id: permissionId
  }));
  
  const { data } = await axiosClient.post('/roles/assign-permissions', payload);
  return data;
};

// Revoke permissions from a role
export const revokePermissions = async (roleId: number, permissionIds: number[]): Promise<{ success: boolean; message: string }> => {
  const payload = permissionIds.map(permissionId => ({
    role_id: roleId,
    permission_id: permissionId
  }));
  
  const { data } = await axiosClient.post('/roles/revoke-permissions', payload);
  return data;
};
