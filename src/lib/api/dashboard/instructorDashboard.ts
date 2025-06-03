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
  participants: number;
}



export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}


/**
 * Fetch just the dashboard stats
 */
export const fetchInstructorDashboardStats = async (): Promise<DashboardStatsResponse> => {
  try {
    const response: AxiosResponse<ApiResponse<DashboardStatsResponse>> = await axios.get('/instructor/dashboard/stats');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Fetch just the performance data
 */
export const fetchInstructorPerformanceData = async (): Promise<PerformanceData[]> => {
  try {
    const response: AxiosResponse<ApiResponse<PerformanceData[]>> = await axios.get('/instructor/dashboard/performance');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching performance data:', error);
    throw error;
  }
};

/**
 * Fetch just the popular courses
 */
export const fetchInstructorPopularCourses = async (): Promise<PopularCourse[]> => {
  try {
    const response: AxiosResponse<ApiResponse<PopularCourse[]>> = await axios.get(`/instructor/dashboard/popular-courses`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching popular courses:', error);
    throw error;
  }
};