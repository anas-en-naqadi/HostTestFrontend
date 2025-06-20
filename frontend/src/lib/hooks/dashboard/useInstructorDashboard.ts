import {
  fetchInstructorPerformanceData,
  fetchInstructorPopularCourses,
  fetchInstructorDashboardStats,
  PopularCourse,
  PerformanceData,
  DashboardStatsResponse
} from './../../api/dashboard/instructorDashboard';

import { useQuery } from '@tanstack/react-query';

export const useInstructorDashboard = () => {
  const statsQuery = useQuery<DashboardStatsResponse>({
    queryKey: ['instructorDashboard', 'stats'],
    queryFn: fetchInstructorDashboardStats,
  });

  const performanceQuery = useQuery<PerformanceData[]>({
    queryKey: ['instructorDashboard', 'performance'],
    queryFn: fetchInstructorPerformanceData,
  });

  const popularCoursesQuery = useQuery<PopularCourse[]>({
    queryKey: ['instructorDashboard', 'popularCourses'],
    queryFn: fetchInstructorPopularCourses,
  });

  return {
    stats: statsQuery.data,
    performance: performanceQuery.data,
    popularCourses: popularCoursesQuery.data,
    isLoading: statsQuery.isLoading || performanceQuery.isLoading || popularCoursesQuery.isLoading,
    error: statsQuery.error || performanceQuery.error || popularCoursesQuery.error,
    queries: {
      statsQuery,
      performanceQuery,
      popularCoursesQuery,
    },
  };
};
