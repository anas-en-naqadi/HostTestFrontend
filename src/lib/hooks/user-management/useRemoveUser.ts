// src/lib/hooks/useQuizAttempts.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeUser } from "@/lib/api/user-management/removeUser";

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
