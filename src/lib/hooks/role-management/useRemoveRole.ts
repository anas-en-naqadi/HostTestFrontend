import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeRole } from '@/lib/api';

interface RemoveRoleResponse {
  success: boolean;
  message: string;
}

export const useRemoveRole = () => {
  const queryClient = useQueryClient();

  return useMutation<RemoveRoleResponse, Error, number>({
    mutationFn: removeRole,
    onSuccess: () => {
      // Invalidate and refetch roles list
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });
};
