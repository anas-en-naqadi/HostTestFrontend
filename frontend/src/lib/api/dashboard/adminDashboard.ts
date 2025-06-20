// lib/api/dashboard/adminDashboard.ts
import axios from "@/lib/axios";
import { AxiosResponse } from "axios";

export interface DashboardStatsResponse {
  trainers: number;
  instructors: number;
  courses: number;
  categories: number;
  activeInterns: number;
  activeInstructors: number;
}

export interface PerformanceData {
  week: string;
  trainers: number;
  instructors: number;
}

export interface PopularCourse {
  id: string;
  thumbnail: string;
  title: string;
  slug: string;
  participants: number;
}

export interface DashboardResponse {
  stats: DashboardStatsResponse;
  performanceData: PerformanceData[];
  popularCourses: PopularCourse[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Fetch all dashboard data (stats, performance, popular courses) at once
 */
export const fetchDashboardData = async (): Promise<DashboardResponse> => {
  try {
    const response: AxiosResponse<ApiResponse<DashboardResponse>> = await axios.get('/AdminDashboard/data');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};

/**
 * Fetch just the dashboard stats
 */
export const fetchDashboardStats = async (): Promise<DashboardStatsResponse> => {
  try {
    const response: AxiosResponse<ApiResponse<DashboardStatsResponse>> = await axios.get('/AdminDashboard/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch just the performance data
 */
export const fetchPerformanceData = async (): Promise<PerformanceData[]> => {
  try {
    const response: AxiosResponse<ApiResponse<PerformanceData[]>> = await axios.get('/AdminDashboard/performance');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw error;
  }
};

/**
 * Fetch just the popular courses
 */
export const fetchPopularCourses = async (limit: number = 4): Promise<PopularCourse[]> => {
  try {
    const response: AxiosResponse<ApiResponse<PopularCourse[]>> = await axios.get(`/AdminDashboard/popular-courses?limit=${limit}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    throw error;
  }
};