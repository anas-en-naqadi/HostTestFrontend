import { useQuery } from "@tanstack/react-query";
import { fetchCoursesByUserId } from "@/lib/api/course-management";
import { CourseResponse } from "@/types/course.types";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";

interface UseFetchUserCoursesOptions {
  initialQuery?: string;
}

export const useFetchUserCourses = () => {


  const queryResult = useQuery({
    queryKey: ["userCourses"],
    queryFn: async () => {
      try {
        return await fetchCoursesByUserId();
      } catch (error) {
        console.error("Error fetching user courses:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    ...queryResult,
  };
};
