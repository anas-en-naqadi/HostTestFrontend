import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeCourse as removeCourseApi } from "@/lib/api/course-management";

export const useRemoveCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: async (slug: string) => {
      try {
        return await removeCourseApi(slug);
      } catch (error: any) {
        console.error("Error removing course:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch all course-related queries
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["userCourses"] });
    },
  });
};
