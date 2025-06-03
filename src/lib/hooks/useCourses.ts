import { useState, useEffect, useRef } from "react";
import { getAllCourses, PaginationInfo } from "@/lib/api/course/Allcourses";
import { CourseResponse } from "@/types/course.types";
import { useMutation } from '@tanstack/react-query';
// import { useAuthStore } from "@/store/authStore";

export const useCourses = (initialPage = 1, pageSize = 6, query: string | null = null) => {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    totalPages: 0,
    currentPage: initialPage,
    limit: pageSize
  });
  const initialFetchDoneRef = useRef(false);
  // const { user } = useAuthStore(); // Get user for userId

  const fetchCourses = async (pageNumber: number) => {
    try {
      setLoading(true);
      const coursesResponse = await getAllCourses(pageNumber, pageSize, query);
      setCourses(coursesResponse.courses);
      setPagination(coursesResponse.pagination);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
      setError(
        err instanceof Error ? err : new Error("Failed to fetch courses")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      // Initial fetch
      fetchCourses(initialPage);
      initialFetchDoneRef.current = true;
    } else if (page !== initialPage) {
      // Subsequent page changes
      fetchCourses(page);
    }
  }, [page, pageSize, query, initialPage]);

  const goToPage = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const transformedCourses = courses.map((course) => ({
    ...course,
    enrollmentsCount: course._count?.enrollments || 0,
  }));

  return {
    courses: transformedCourses,
    loading,
    error,
    pagination,
    getAllCourses,
    goToPage,
    currentPage: page
  };
};

export const useFetchCoursesWithQuery = () => {
  return useMutation({
    mutationFn: ({ page = 1, pageSize = 6, search = null }: {
      page?: number;
      pageSize?: number;
      search?: string | null;
    }) => getAllCourses(page, pageSize, search),
  });
};

export const useFetchCoursesWithFilter = () => {
  return useMutation({
    mutationFn: ({
      page = 1,
      pageSize = 6,
      query = null,
      filters = {
        durations: [],
        topics: [],
        levels: [],
      }
    }: {
      page?: number;
      pageSize?: number;
      query: string | null;
      filters?: {
        durations?: string[];
        topics?: string[];
        levels?: string[];
      };
    }) => getAllCourses(page, pageSize, query, filters),
  });
};