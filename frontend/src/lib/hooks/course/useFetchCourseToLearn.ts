import { fetchCourseToLearn } from '@/lib/api/course/fetchCToLearn';
import { useQuery } from '@tanstack/react-query';

export const useFetchCourseToLearn = (slug: string) => {
  return useQuery({
    queryKey: ['course-to-learn', slug],
    queryFn: () => fetchCourseToLearn(slug),
    enabled: Boolean(slug)
  });
};
