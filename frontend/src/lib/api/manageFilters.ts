// src/lib/api/courseFilters.ts
import axiosClient from "../axios";
export type FilterOptions = {
  'Video Duration': string[];
  topic:           string[];
  level:           string[];
  // language:        string[];
};

/**
 * Fetch the course filter options from the backend.
 */
export async function fetchCourseFilters() {
  const {data,status} = await axiosClient.get<FilterOptions>('/dashboard/filters');
  if(status===200) return data;
}
