import { useMutation } from '@tanstack/react-query';
import { storeEnrollment } from '../api/enrollments';
// Custom hook for login using React Query
export const useStoreEnrollment = () => {
  return useMutation({
    mutationFn: storeEnrollment
  });
};