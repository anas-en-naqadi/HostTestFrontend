import axiosClient from "@/lib/axios";
import { Permission } from "@/types/role.types";

// Response types
interface PermissionsResponse {
  success: boolean;
  message: string;
  data: Permission[];
}

// Fetch all permissions
export const fetchPermissions = async (): Promise<PermissionsResponse> => {
  const { data } = await axiosClient.get('/permissions');
  return data;
};

