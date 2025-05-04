// src/lib/api/enrollments.ts
import axiosClient from "@/lib/axios";
import { EnrollmentItem } from "@/types/enrollment.types";

/**
 * Backend returns this paginated structure
 */
export interface PaginatedEnrollmentsResponse {
  data: EnrollmentItem[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

/**
 * Fetch paginated enrollments from the API
 */
export async function fetchFewEnrollments(): Promise<PaginatedEnrollmentsResponse> {
  const page = 1;
  const limit = 3;
  const { data } = await axiosClient.get(
    `/enrollments?page=${page}&limit=${limit}`
  );
  return data;
}
