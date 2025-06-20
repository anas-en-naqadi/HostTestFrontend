import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/lib/api/user-management/updateUser";
import { ApiUser } from "@/types/user.types";

type UpdateUserVariables = {
  userId: number;
  body: ApiUser;
};

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateUserVariables>({
    mutationFn: ({ userId, body }) => updateUser({userId, body}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
