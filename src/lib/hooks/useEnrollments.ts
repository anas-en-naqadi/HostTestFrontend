// lib/hooks/useEnrollments.ts
import { useState, useEffect } from "react";
import { getEnrollments, updateEnrollmentProgress } from "../api/enrollments";
import { Enrollment } from "@/types/course.types";
import { toast } from "sonner";
import axios from "axios";

// Extend Enrollment with internal-use fields
interface EnrollmentWithMeta extends Enrollment {
  subtitle: string;
  duration: number;
  difficulty: string;
  id: number;
  courseId: number;
  completed: boolean;
  completedLessons: number;
  totalLessons: number;
}

export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<EnrollmentWithMeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6,
  });

  const fetchEnrollments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await getEnrollments(page);

      if (response.success) {
        setPagination(response.pagination);

        console.log(response.data);
        // Data now comes from the backend's format, which already calculates completedLessons and totalLessons
        const transformedEnrollments = response.data.map((item) => {
          // Use backend-calculated progress values
          console.log(item);
          return {
            courseTitle: item.courseTitle || "",
            subtitle: item.courseSubTitle || "",
            instructorName: item.instructorName || "Instructor",
            progressPercent: item.progressPercent || 0,
            totalLessons: item.totalLessons || 0,
            completedLessons: item.completedLessons || 0,
            courseSlug: item.courseSlug || "",
            courseThumbnail: item.courseThumbnail || "",
            // Set default values for any missing fields
            duration: 0,
            difficulty: "", 
            id: 0,
            courseId: 0,
            // Consider a course completed if progress is 100%
            completed: item.progressPercent === 100,
          } as EnrollmentWithMeta;
        });

        setEnrollments(transformedEnrollments);
      } else {
        setError(response.message);
        toast.error(response.message);
      }

    } catch (err: unknown) {
      console.log(err);
      let errorMessage = "Something went wrong. Please try again.";

      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          errorMessage = "You are not authorized. Please log in again.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
      }

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changePage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
    fetchEnrollments(page);
  };

  const updateProgress = async (id: number, progress: number) => {
    try {
      const response = await updateEnrollmentProgress(id, {
        progress_percent: progress,
        completed_at: progress === 100 ? new Date().toISOString() : null,
      });

      if (response.success) {
        setEnrollments((prev) =>
          prev.map((enrollment) =>
            enrollment.id === id
              ? {
                  ...enrollment,
                  progressPercent: progress,
                  completed: progress === 100,
                }
              : enrollment
          )
        );
        toast.success("Progress updated successfully");
        return true;
      } else {
        toast.error(response.message);
        return false;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update progress";
      toast.error(errorMessage);
      return false;
    }
  };

  useEffect(() => {
    fetchEnrollments(pagination.currentPage);
  }, []); // Only run on mount

  return {
    enrollments,
    loading,
    error,
    pagination,
    fetchEnrollments,
    updateProgress,
    changePage,
  };
};