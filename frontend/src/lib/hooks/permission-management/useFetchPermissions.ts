import { useQuery } from '@tanstack/react-query';
import { Permission } from '@/types/role.types';
import { fetchPermissions } from '@/lib/api';

interface PermissionsResponse {
  success: boolean;
  message: string;
  data: Permission[];
}

export const useFetchPermissions = () => {
  return useQuery<PermissionsResponse>({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
    // Set staleTime to 0 to ensure data is always considered stale and needs refreshing
    staleTime: 0,
    // Always refetch on window focus
    refetchOnWindowFocus: true,
    // Always refetch when component mounts
    refetchOnMount: true,
    // Retry failed requests
    retry: 3,
    // Retry on mount
    retryOnMount: true,
    // Refetch on reconnect
    refetchOnReconnect: true,
    // Garbage collection time (how long to keep data in cache)
    gcTime: 1000 * 60 * 5 // 5 minutes
  });
};
