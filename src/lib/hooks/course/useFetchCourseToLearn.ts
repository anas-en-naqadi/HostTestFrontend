import { fetchCourseToLearn } from '@/lib/api/course/fetchCToLearn';
import { useQuery } from '@tanstack/react-query';

export const useFetchCourseToLearn = (slug: string) => {
  return useQuery({
    queryKey: ['course-to-learn', slug],
    queryFn: () => fetchCourseToLearn(slug),
    enabled: Boolean(slug),
    staleTime: 0, // Consider data stale immediately
    refetchOnMount: 'always', // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
  });
};