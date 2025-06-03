// src/lib/hooks/useQuizzes.ts
import { useState, useCallback, useEffect } from 'react';
import { 
  fetchQuizzes, 
  createQuiz, 
  updateQuiz, 
  deleteQuiz, 
  getQuizById,
  ServerQuiz, 
  CreateQuizDto, 
  UpdateQuizDto 
} from '../api/quizzes';
import { toast } from 'sonner';

interface QuizWithQuestions {
  id?: number;
  title: string;
  duration: number;
  isFinal: boolean;
  questions: {
    id?: number;
    text: string;
    options: {
      id?: number;
      text: string;
      is_correct: boolean;
    }[];
  }[];
}

export const useQuizzes = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [quizzes, setQuizzes] = useState<ServerQuiz[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetchQuizzes();
      if (response.success) {
        setQuizzes(response.data);
      }
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      toast.error('Failed to load quizzes. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createQuizHandler = useCallback(async (quizData: CreateQuizDto) => {
    setIsMutating(true);
    try {
      const response = await createQuiz(quizData);
      if (response.success) {
        await fetchData();
        toast.success('Quiz created successfully');
      }
      return response;
    } catch (error) {
      console.error('Error creating quiz:', error);
      toast.error('Failed to create quiz. Please try again.');
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [fetchData]);

  const updateQuizHandler = useCallback(async (id: number, quizData: UpdateQuizDto) => {
    setIsMutating(true);
    try {
      const processedData = {
        ...quizData,
        questions: quizData.questions?.map(question => ({
          id: question.id !== undefined 
            ? (typeof question.id === 'string' ? parseInt(question.id) : question.id)
            : undefined,
          text: question.text,
          options: question.options.map(option => ({
            id: option.id !== undefined 
              ? (typeof option.id === 'string' ? parseInt(option.id) : option.id)
              : undefined,
            text: option.text,
            is_correct: option.is_correct
          }))
        }))
      };

      const response = await updateQuiz(id, processedData);
      if (response.success) {
        await fetchData();
        toast.success('Quiz updated successfully');
      }
      return response;
    } catch (error) {
      console.error('Error updating quiz:', error);
      toast.error('Failed to update quiz. Please try again.');
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [fetchData]);

  const deleteQuizHandler = useCallback(async (id: number) => {
    setIsMutating(true);
    try {
      const response = await deleteQuiz(id);
      if (response.success) {
        await fetchData();
        toast.success('Quiz deleted successfully');
      }
      return response;
    } catch (error) {
      console.error('Error deleting quiz:', error);
      toast.error('Failed to delete quiz. Please try again.');
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [fetchData]);

  const getQuizWithQuestionsHandler = useCallback(async (id: number) => {
    setIsMutating(true);
    try {
      const response = await getQuizById(id);
      return response;
    } catch (error) {
      console.error('Error fetching quiz details:', error);
      toast.error('Failed to load quiz details. Please try again.');
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, []);

  const handleEditQuiz = useCallback(async (id: number, updatedQuiz: QuizWithQuestions) => {
    setIsMutating(true);
    try {
      const apiData = {
        title: updatedQuiz.title,
        duration_time: updatedQuiz.duration,
        isFinal: updatedQuiz.isFinal,
        questions: updatedQuiz.questions.map(question => ({
          id: question.id,
          text: question.text,
          options: question.options.map(option => ({
            id: option.id,
            text: option.text,
            is_correct: option.is_correct
          }))
        }))
      };
      const response = await updateQuiz(id, apiData);
      await fetchData();
      return response;
    } catch (error) {
      console.error("Update quiz error:", error);
      throw error;
    } finally {
      setIsMutating(false);
    }
  }, [fetchData]);

  return {
    quizzes,
    loading,
    isMutating,
    createQuiz: createQuizHandler,
    updateQuiz: updateQuizHandler,
    deleteQuiz: deleteQuizHandler,
    refreshQuizzes: fetchData,
    getQuizWithQuestions: getQuizWithQuestionsHandler,
    handleEditQuiz
  };
};