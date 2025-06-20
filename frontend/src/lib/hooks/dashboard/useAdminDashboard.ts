// lib/hooks/dashboard/useAdminDashboard.ts
import { useQuery } from '@tanstack/react-query';
import { 
  fetchDashboardData, 
  DashboardResponse, 
  DashboardStatsResponse,
  PerformanceData,
  PopularCourse
} from '@/lib/api/dashboard/adminDashboard';

export const useAdminDashboard = () => {
  const {
    data,
    isLoading,
    isError,
    refetch
  } = useQuery<DashboardResponse, Error>({
    queryKey: ['adminDashboardData'],
    queryFn: fetchDashboardData,
  });

  return {
    loading: isLoading,
    error: isError ? 'Failed to load dashboard data. Please try again later.' : null,
    data,
    refetch,
    stats: data?.stats,
    performanceData: data?.performanceData,
    popularCourses: data?.popularCourses
  };
};