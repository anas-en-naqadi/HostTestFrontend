import { useQuery } from '@tanstack/react-query';
import { ApiRole } from '@/types/role.types';
import { getRole } from '@/lib/api';

interface GetRoleResponse {
  success: boolean;
  message: string;
  data: ApiRole;
}

export const useGetRole = (roleId: number) => {
  return useQuery<GetRoleResponse>({
    queryKey: ['role', roleId],
    queryFn: () => getRole(roleId),
    enabled: !!roleId,
  });
};
