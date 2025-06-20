import { useQuery } from "@tanstack/react-query";
import { fetchCourses } from "@/lib/api/course-management";
import { CourseResponse } from "@/types/course.types";

export const useFetchCourses = () => {
  return useQuery<{ success: boolean; message: string; data: CourseResponse[] }>({
    queryKey: ["courses"],
    queryFn: async () => {
      try {
        return await fetchCourses();
      } catch (error) {
        console.error("Error fetching courses:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
