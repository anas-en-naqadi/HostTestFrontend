import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCourse as createCourseApi } from "@/lib/api/course-management";

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, FormData>({
    mutationFn: async (formData: FormData) => {
      try {
        return await createCourseApi(formData);
      } catch (error: any) {
        console.error("Error creating course:", error);
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
