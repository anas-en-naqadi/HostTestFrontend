import { useMutation } from '@tanstack/react-query';
import { fetchFewEnrollments } from '@/lib/api/dashboard/fewEnrollments';

// Custom hook for login using React Query
export const useFetchFewEnrollments = () => {
  return useMutation({
    mutationFn: fetchFewEnrollments
  });
};