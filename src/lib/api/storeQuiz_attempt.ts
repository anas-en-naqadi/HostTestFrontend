// src/lib/api/quizAttempts.api.ts
import axiosClient from "../axios";

export interface QuizAttemptPayload {
  quiz_id:      number;
  started_at?:  string; // ISO timestamp, e.g. new Date().toISOString()
  completed_at?: string;
  score?:       number;
  passed?:      boolean;
  slug?:string;
}

export interface QuizAttemptResponse {
  id:           number;
  user_id:      number;
  quiz_id:      number;
  started_at:   string;
  completed_at: string | null;
  score:        number | null;
  passed:       boolean;
  updated_at:   string;
}

/**
 * POST /api/quiz_attempts
 */
export const storeQuizAttempt = async (
  payload: QuizAttemptPayload
): Promise<QuizAttemptResponse> => {
  const response = await axiosClient.post<QuizAttemptResponse>(
    "/quiz-attempts",
    payload
  );
  return response;
};
