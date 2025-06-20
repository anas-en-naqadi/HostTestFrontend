import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateRoleDto, Role } from '@/types/role.types';
import { createRole } from '@/lib/api';

interface CreateRoleResponse {
  success: boolean;
  message: string;
  data: Role;
}

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  return useMutation<CreateRoleResponse, Error, CreateRoleDto>({
    mutationFn: createRole,
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
