// src/lib/api/instructor.ts
import axiosClient from "@/lib/axios";
import { InstructorResponse, ApiResponse } from "@/types/instructor.types";

export const fetchInstructorById = async (id: number): Promise<InstructorResponse> => {
  try {
    const response = await axiosClient.get<ApiResponse<InstructorResponse>>(`/instructors/${id}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch instructor");
  } catch (error) {
    console.error(`Error fetching instructor ${id}:`, error);
    throw error;
  }
};

// Optional: If you need to fetch multiple instructors
export const fetchInstructors = async (ids: number[]): Promise<InstructorResponse[]> => {
  try {
    // This assumes your backend has a route to fetch multiple instructors at once
    const response = await axiosClient.get<ApiResponse<InstructorResponse[]>>('/instructors', {
      params: { ids: ids.join(',') }
    });
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || "Failed to fetch instructors");
  } catch (error) {
    console.error("Error fetching instructors:", error);
    throw error;
  }
};