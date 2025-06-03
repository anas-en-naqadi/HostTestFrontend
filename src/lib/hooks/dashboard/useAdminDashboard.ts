// lib/hooks/dashboard/useAdminDashboard.ts
import { useState, useEffect } from 'react';
import { 
  fetchDashboardData, 
  DashboardResponse, 
  DashboardStatsResponse,
  PerformanceData,
  PopularCourse
} from '@/lib/api/dashboard/adminDashboard';

export const useAdminDashboard = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DashboardResponse | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const dashboardData = await fetchDashboardData();
      setData(dashboardData);
      console.log(dashboardData)
    } catch (err) {
      setError('Failed to load dashboard data. Please try again later.');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Function to refresh the data manually
  const refreshData = () => {
    fetchData();
  };

  return {
    loading,
    error,
    data,
    refreshData,
    stats: data?.stats as DashboardStatsResponse,
    performanceData: data?.performanceData as PerformanceData[],
    popularCourses: data?.popularCourses as PopularCourse[]
  };
};

export default useAdminDashboard;