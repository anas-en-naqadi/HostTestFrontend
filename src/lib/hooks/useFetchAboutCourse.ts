import { useMutation } from '@tanstack/react-query';
import { fetchAboutCourse } from '../api/aboutCourse';
// Custom hook for login using React Query
export const useFetchAboutCourse = () => {
  return useMutation({
    mutationFn: fetchAboutCourse
  });
};

// export function useFetchAboutCourse(slug: string) {
//   return useQuery<FormattedCourse>({
//     queryKey: ["course", slug],
//     queryFn: () => fetchAboutCourse(slug),
//     staleTime: 5 * 60_000,      // fresh for 5 minutes
//     gcTime:    30 * 60_000,     // unused queries live in cache for 30 minutes
//     refetchOnWindowFocus: false,
//     enabled: slug.length > 0,
//   });
// }
