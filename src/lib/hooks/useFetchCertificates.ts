import { useQuery } from '@tanstack/react-query';
import { fetchCertificates } from '../api/certificates';

export type FormattedCertificate = {
  id: string;
  thumbnail_url: string;
  title: string;
  progress: number;
  dateCompleted: string | null;
  isCompleted: boolean;
  slug: string;
  courseId: number;
  enrollmentId: number;
};

export const useFetchCertificates = () => {
  return useQuery<FormattedCertificate[]>({
    queryKey: ['certificates'],
    queryFn: async () => {
      const { data } = await fetchCertificates();
      
      // Transform the API response to match the component's expected format
      return data.map(enrollment => {
        const isCompleted = (enrollment.progress_percent || 0) >= 100;
        
        return {
          id: enrollment.id.toString(),
          enrollmentId: enrollment.id,
          courseId: enrollment.courses.id,
          thumbnail_url: enrollment.courses.thumbnail_url || '/placeholder-image.jpg',
          title: enrollment.courses.title,
          progress: enrollment.progress_percent!,
          slug: enrollment.courses.slug,
          dateCompleted: isCompleted ? new Date().toISOString().split('T')[0] : null,
          isCompleted: isCompleted
        };
      });
    },
    staleTime: 0, // No caching as requested
    gcTime: 0, // Immediately garbage collect
    refetchOnWindowFocus: true, // Refetch when window gets focus
    retry: 1, // Only retry once on failure
  });
};
