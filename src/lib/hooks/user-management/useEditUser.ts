// src/lib/hooks/useQuizAttempts.ts
import { useMutation } from "@tanstack/react-query";
import { editUser } from "@/lib/api/user-management/editUser";


export function useEditUser() {

  return useMutation({
    mutationFn: editUser,
   
  });
}
