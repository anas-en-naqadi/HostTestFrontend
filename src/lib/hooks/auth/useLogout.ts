import { useMutation } from '@tanstack/react-query';
import { logout } from '../../api';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';


// Custom hook for logout
export const useLogout = () => {
    const router = useRouter();
    return useMutation({
      mutationFn: logout,
      onSuccess: () => {
       useAuthStore.getState().clearAuth();

        router.push('/login')
      },
    });
  };
  