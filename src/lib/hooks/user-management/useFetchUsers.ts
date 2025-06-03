// hooks/useDashboardHooks.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/lib/api/user-management/fetchUsers';

// Hook for fetching user dashboard statistics
export const useFetchUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers
  });
};
