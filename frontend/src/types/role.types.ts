export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: RolePermission[];
}

export interface ApiRole {
  id: number;
  name: string;
  description?: string;
  permissions: RolePermission[];
}

export interface RolePermission {
  id:number;
  name: string;
}

export interface Permission {
  id?: number;
  name: string;
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

export interface AssignPermissionDto {
  role_id: number;
  permission_id: number;
}
