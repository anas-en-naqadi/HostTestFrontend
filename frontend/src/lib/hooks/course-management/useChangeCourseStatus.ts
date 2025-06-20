// src/lib/hooks/course-management/useChangeCourseStatus.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeCourseStatus as changeCourseStatusApi } from "@/lib/api/course-management";

interface ChangeCourseStatusPayload {
  course_id: number;
  is_published: boolean;
}

export const useChangeCourseStatus = () => {
  const queryClient = useQueryClient();

  return useMutation<any, Error, ChangeCourseStatusPayload>({
    mutationFn: (payload) => changeCourseStatusApi(payload.course_id, payload.is_published),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userCourses"] });
    },
  });
};
