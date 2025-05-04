// src/lib/hooks/useCourseFilters.ts
import { useQuery } from '@tanstack/react-query';
import { fetchCourseFilters } from '@/lib/api/manageFilters';

/**
 * React-Query hook for loading the course-filters dropdown data.
 * 
 * Stales data after 10 minutes, retries up to 2× on failure,
 * and keeps previous data while refetching in the background.
 */
export const useFetchFilters = () => {
  return useQuery({
    queryKey: ['home-course-filters'],
    queryFn: fetchCourseFilters
  });
};
