// lib/api/course/Allcourses.ts
import axiosClient from "@/lib/axios";
import { CourseResponse } from "@/types/course.types";

export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface PaginatedCoursesResponse {
  courses: CourseResponse[];
  pagination: PaginationInfo;
  query?:string;
}
// lib/api/course/Allcourses.ts
export const getAllCourses = async (
  page = 1,
  limit = 6,
  query: string | null = null,
  filters?: {
    durations?: string[];
    topics?: string[];
    levels?: string[];
  }
): Promise<PaginatedCoursesResponse> => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (query) {
      params.append('query', query);
    }

    if (filters?.durations) {
      filters.durations.forEach(d => params.append('durations', d));
    }

    if (filters?.topics) {
      filters.topics.forEach(t => params.append('topics', t));
    }

    if (filters?.levels) {
      filters.levels.forEach(l => params.append('levels', l));
    }

    const response = await axiosClient.get(`/courses?${params.toString()}`);
    
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    } else {
      console.error("Unexpected API response format:", response.data);
      return {
        courses: [],
        pagination: {
          totalCount: 0,
          totalPages: 0,
          currentPage: page,
          limit
        }
      };
    }
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    throw error;
  }
};