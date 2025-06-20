// src/lib/hooks/useQuizAttempts.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuizAttemptPayload,QuizAttemptResponse,storeQuizAttempt } from "../api/storeQuiz_attempt";

export function useStoreQuizAttempt(slug:string) {
  const queryClient = useQueryClient();

  return useMutation<QuizAttemptResponse, Error, QuizAttemptPayload>({
    mutationFn: storeQuizAttempt,
    onSuccess: () => {
        queryClient.invalidateQueries({
            queryKey: ['course-to-learn',slug],
          });    },
  });
}
