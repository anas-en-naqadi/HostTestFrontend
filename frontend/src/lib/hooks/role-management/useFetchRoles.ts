import { useQuery } from '@tanstack/react-query';
import { Role } from '@/types/role.types';
import { fetchRoles } from '@/lib/api';

interface RolesResponse {
  success: boolean;
  message: string;
  data: Role[];
}

export const useFetchRoles = () => {
  return useQuery<RolesResponse>({
    queryKey: ['roles'],
    queryFn: fetchRoles,
  });
};
