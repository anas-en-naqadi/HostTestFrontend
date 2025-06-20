// src/lib/api/quizzes.ts
import axios from "../axios";

export interface ServerQuiz {
  id: number;
  title: string;
  duration_time: number;
  created_by: number;
  question_count: number;
  isFinal?: boolean;
}

export interface CreateQuizDto {
  title: string;
  duration_time: number; // in minutes
  isFinal?: boolean;
  questions: QuestionInput[];
}

export interface QuestionInput {
  id?: number;
  text: string;
  options: OptionInput[];
}

export interface OptionInput {
  id?: number;
  text: string;
  is_correct: boolean;
}

export interface UpdateQuizDto {
  title?: string;
  duration_time?: number;
  isFinal?: boolean;
  questions?: QuestionInput[];
}

export interface QuizResponse {
  success: boolean;
  message: string;
  data: ServerQuiz[];
}

export interface QuizPaginationResponse {
  success: boolean;
  message: string;
  data: ServerQuiz[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface QuizWithDetails extends ServerQuiz {
  questions?: {
    id?: number;
    text: string;
    options: {
      id?: string;
      text: string;
      is_correct: boolean;
    }[];
  }[];
}

// Fetch quizzes with pagination
export const fetchQuizzes = async () => {
  const response = await axios.get<QuizResponse>('/quizzes/quizzes');
  return response.data;
};

// Create a new quiz
export const createQuiz = async (quizData: CreateQuizDto) => {
  const response = await axios.post("/quizzes", quizData);
  return response.data;
};

// Update an existing quiz
export const updateQuiz = async (id: number, quizData: UpdateQuizDto) => {
  const response = await axios.put(`/quizzes/${id}`, quizData);
  return response.data;
};

// Delete a quiz
export const deleteQuiz = async (id: number) => {
  const response = await axios.delete(`/quizzes/${id}`);
  return response.data;
};

// Get a specific quiz by ID
export const getQuizById = async (
  id: number
): Promise<{
  success: boolean;
  data: QuizWithDetails;
}> => {
  const response = await axios.get(`/quizzes/${id}`);
  return response.data;
};
