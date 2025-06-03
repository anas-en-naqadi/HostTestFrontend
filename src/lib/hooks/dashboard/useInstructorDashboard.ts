import { fetchInstructorPerformanceData ,fetchInstructorPopularCourses,fetchInstructorDashboardStats,PopularCourse,PerformanceData,DashboardStatsResponse} from './../../api/dashboard/instructorDashboard';
import { useMutation, useQueryClient } from '@tanstack/react-query';
// Types for our hook results
export interface InstructorDashboardData {
  stats?: DashboardStatsResponse;
  performance?: PerformanceData[];
  popularCourses?: PopularCourse[];
}

// Custom hook for instructor dashboard data using React Query
export const useInstructorDashboard = () => {
  const queryClient = useQueryClient();
  
  // Mutation for dashboard stats
  const statsMutation = useMutation({
    mutationFn: fetchInstructorDashboardStats,
    onSuccess: (data) => {
      queryClient.setQueryData(['instructorDashboard', 'stats'], data);
    }
  });
  
  // Mutation for performance data
  const performanceMutation = useMutation({
    mutationFn: fetchInstructorPerformanceData,
    onSuccess: (data) => {
      queryClient.setQueryData(['instructorDashboard', 'performance'], data);
    }
  });
  
  // Mutation for popular courses
  const popularCoursesMutation = useMutation({
    mutationFn: fetchInstructorPopularCourses,
    onSuccess: (data) => {
      queryClient.setQueryData(['instructorDashboard', 'popularCourses'], data);
    }
  });
  
  // Function to fetch all data at once
  const fetchAllDashboardData = async () => {
    statsMutation.mutate();
    performanceMutation.mutate();
    popularCoursesMutation.mutate();
  };
  
  // Function to get the current state of all data
  const getDashboardData = (): InstructorDashboardData => {
    return {
      stats: queryClient.getQueryData(['instructorDashboard', 'stats']) as DashboardStatsResponse | undefined,
      performance: queryClient.getQueryData(['instructorDashboard', 'performance']) as PerformanceData[] | undefined,
      popularCourses: queryClient.getQueryData(['instructorDashboard', 'popularCourses']) as PopularCourse[] | undefined
    };
  };
  
  // Combined loading state
  const isLoading = statsMutation.isPending || performanceMutation.isPending || popularCoursesMutation.isPending;
  
  // Combined error state
  const error = statsMutation.error || performanceMutation.error || popularCoursesMutation.error;
  
  return {
    fetchAllDashboardData,
    getDashboardData,
    isLoading,
    error,
    // Individual mutations for more granular control
    statsMutation,
    performanceMutation,
    popularCoursesMutation
  };
};