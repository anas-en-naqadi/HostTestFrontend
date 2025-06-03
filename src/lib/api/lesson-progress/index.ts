import axiosClient from '@/lib/axios';

/**
 * Reset all lesson progress for a user on a specific course
 * @param userId - The ID of the user whose progress will be reset
 * @param courseSlug - The slug of the course to reset progress for
 * @returns Promise with the result of the operation
 */
export const resetUserCourseProgress = async (userId: number, courseSlug: string) => {
  try {
    const response = await axiosClient.delete(`/lesson-progress/reset/${userId}/${courseSlug}`);
    return response.data;
  } catch (error) {
    console.error('Error resetting course progress:', error);
    throw error;
  }
};
