// src/lib/hooks/useQuizAttempts.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeUserStatus } from "@/lib/api/user-management/changeStatus";

export function useChangeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
