import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Role, UpdateRoleDto } from '@/types/role.types';
import { updateRole } from '@/lib/api';

interface UpdateRoleResponse {
  success: boolean;
  message: string;
  data: Role;
}

interface UpdateRoleVars {
  id: number;
  data: UpdateRoleDto;
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation<UpdateRoleResponse, Error, UpdateRoleVars>({
    mutationFn: ({ id, data }) => updateRole(id, data),
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
