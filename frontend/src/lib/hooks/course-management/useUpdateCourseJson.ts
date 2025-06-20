import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "@/lib/axios";

interface UpdateCourseJsonParams {
  slug: string;
  courseData: any; // Use a more specific type if available
}

export const useUpdateCourseJson = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, UpdateCourseJsonParams>({
    mutationFn: async ({ slug, courseData }: UpdateCourseJsonParams) => {
      try {
        const response = await axios.put(`/courses/${slug}/json`, courseData);
        return response.data;
      } catch (error: any) {
        console.error("Error updating course with JSON:", error);
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