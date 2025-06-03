// src/lib/hooks/useQuizAttempts.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeUser } from "@/lib/api/user-management/storeUser";


export function useStoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeUser,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["users"],
      });
    },
  });
}
