// lib/api/enrollments.ts

import axiosClient from '../axios';
import { EnrollmentsResponse, PaginatedEnrollmentsResponse } from '../../types/enrollment.types';


export const getEnrollments = async (page = 1, limit = 6): Promise<PaginatedEnrollmentsResponse> => {
  try {
    const response = await axiosClient.get<PaginatedEnrollmentsResponse>(`/enrollments?page=${page}&limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateEnrollmentProgress = async (
  id: number, 
  data: { 
    progress_percent: number,
    last_accessed_module_id?: number,
    last_accessed_lesson_id?: number,
    completed_at?: string | null
  }
): Promise<EnrollmentsResponse> => {
  try {
    const response = await axiosClient.put(`/enrollments/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const storeEnrollment = async (id_data:{courseId:number}) => {
  try {
    const {data,status}= await axiosClient.post(`/enrollments`,id_data);
    if(status===200){
      return data;
    }
  } catch (error) {
    throw error;
  }
};
