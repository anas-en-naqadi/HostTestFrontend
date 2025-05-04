// hooks/useDashboardHooks.ts
import { useQuery } from '@tanstack/react-query';
import { 
  fetchUserDashboardStats, 
  fetchNextLearningCourses,
  fetchFieldSuggestions,
  fetchDashboardChartData
} from '../../api/dashboard/dashboard';

// Hook for fetching user dashboard statistics
export const useUserDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchUserDashboardStats
  });
};

// Hook for fetching next learning courses
export const useNextLearningCourses = () => {
  return useQuery({
    queryKey: ['nextLearning'],
    queryFn: fetchNextLearningCourses
  });
};

// Hook for fetching field suggestions
export const useFieldSuggestions = () => {
  return useQuery({
    queryKey: ['fieldSuggestions'],
    queryFn: fetchFieldSuggestions
  });
};

export const useDashboardChartData = () => {
  return useQuery({
    queryKey: ['dashboardCharts'],
    queryFn: fetchDashboardChartData,
  });
};