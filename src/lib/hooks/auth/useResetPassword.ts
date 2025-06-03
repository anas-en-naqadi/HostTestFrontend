import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../api';

// Custom hook for login using React Query
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword
  });
};


