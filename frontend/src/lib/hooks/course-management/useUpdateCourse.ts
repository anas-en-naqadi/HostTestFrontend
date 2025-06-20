import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCourse as updateCourseApi } from "@/lib/api/course-management";

interface UpdateCourseParams {
  slug: string;
  formData: FormData;
}

export const useUpdateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateCourseParams>({
    mutationFn: async ({ slug, formData }: UpdateCourseParams) => {
      try {
        return await updateCourseApi(slug, formData);
      } catch (error: any) {
        console.error("Error updating course:", error);
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
