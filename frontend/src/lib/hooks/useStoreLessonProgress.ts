// src/lib/hooks/useQuizAttempts.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { storeLessonProgress } from "../api/storeLessonProgress";
export function useStoreLessonProgress(slug:string) {
 const queryClient = useQueryClient();

  return useMutation({
    mutationFn: storeLessonProgress,
    onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: ['course-to-learn',slug],
          });  
          },
  });
}
