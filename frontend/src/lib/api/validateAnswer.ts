import axiosClient from "../axios";

// Interface for single answer validation
export interface ValidateAnswerPayload {
  quizId: number;
  questionId: number;
  optionId: number;
}

export interface ValidateAnswerResponse {
  isCorrect: boolean;
}

// Interface for batch answer validation
export interface AnswerSubmission {
  questionId: number;
  optionId: number;
}

export interface ValidationResult {
  questionId: number;
  optionId: number;
  isCorrect: boolean;
}

export interface ValidateAnswersResponse {
  success: boolean;
  results: ValidationResult[];
  score: number;
  total: number;
}



// Batch answer validation - submit all answers at once
export const validateAnswers = async (
  quizId: number,
  answers: AnswerSubmission[]
): Promise<ValidateAnswersResponse> => {
  const response = await axiosClient.post<ValidateAnswersResponse>(
    "/quizzes/validate-answers",
    { quizId, answers }
  );
  return response.data;
};
