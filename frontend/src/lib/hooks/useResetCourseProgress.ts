import { useMutation, useQueryClient } from '@tanstack/react-query';
import { resetUserCourseProgress } from '@/lib/api/lesson-progress';


export const useResetCourseProgress = (slug: string) => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (userId: number) => resetUserCourseProgress(userId, slug),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['course-to-learn', slug],
      });
    },
  });
};
