// api/dashboardStats.ts
import axiosClient from "@/lib/axios";

export const fetchUserDashboardStats = async () => {
  const { data } = await axiosClient.get('/dashboard/stats');
  return data;
};

// Add more dashboard API functions as needed
export const fetchNextLearningCourses = async () => {
  const { data } = await axiosClient.get('/dashboard/next-learning');
  return data;
};

export const fetchFieldSuggestions = async () => {
  const { data } = await axiosClient.get('/dashboard/field-suggestions');
  return data;
};

export const fetchDashboardChartData = async () => {
  const { data } = await axiosClient.get(
    `/dashboard/charts`
  );
  console.log("data",data)
  return data.data;
};

