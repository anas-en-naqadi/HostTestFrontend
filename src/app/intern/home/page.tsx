"use client";

import HomeCourseCard from "@/components/ui/HomeCourseCard";
import { useFetchCoursesWithFilter } from "@/lib/hooks/useCourses";
import { useEffect, useState } from "react";
import { CourseResponse } from "@/types/course.types";
import { PaginationInfo } from "@/lib/api/course/Allcourses";
import { useSearchParams } from "next/navigation";
// Import the Pagination component
import Pagination from "@/components/ui/Pagination"; // Create this component as shown previously
import HomeCourseCardSkeleton from "@/components/common/HomeCourseCardSkeleton";

export default function HomePage() {
  // Update useCourses to get pagination info and page navigation function
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const durations = searchParams.getAll("durations");
  const topics = searchParams.getAll("topics");
  const levels = searchParams.getAll("levels");

  const pageSize = 6;

  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<{
    courses: CourseResponse[];
    pagination: PaginationInfo;
  } | null>(null);

  const { mutateAsync: fetchCourses } = useFetchCoursesWithFilter();

  const hasFilters =
    durations.length > 0 || topics.length > 0 || levels.length > 0;

  // Create a stable filters object that only changes when the actual filter values change
  const filters = JSON.stringify({ durations, topics, levels });

  const goToPage = (newPage: number) => {
    if (
      data?.pagination &&
      newPage > 0 &&
      newPage <= data.pagination.totalPages
    ) {
      setCurrentPage(newPage);
    }
  };

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      try {
        const result = await fetchCourses({
          page: currentPage,
          pageSize: 6,
          query,
          filters: hasFilters ? JSON.parse(filters) : undefined,
        });

        // If current page is invalid, go to page 1
        if (
          currentPage > result.pagination.totalPages &&
          result.pagination.totalPages > 0
        ) {
          setCurrentPage(1);
          return;
        }

        setData(result);
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

    const timeoutId = setTimeout(fetchData, 300);
    return () => clearTimeout(timeoutId);
  }, [currentPage, query, filters, hasFilters, fetchCourses]);

  const homeCourses = data?.courses ?? [];
  const pagination = data?.pagination;

  const [wishlistedCourseIds, setWishlistedCourseIds] = useState<Set<number>>(
    new Set()
  );

  // Handle adding course to wishlist UI state
  const handleAddToWishlist = (courseId: number) => {
    setWishlistedCourseIds((prev) => {
      const newSet = new Set(prev);
      newSet.add(courseId);
      return newSet;
    });
  };

  // Handle removing course from wishlist UI state
  const handleRemoveFromWishlist = (courseId: number) => {
    setWishlistedCourseIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(courseId);
      return newSet;
    });
  };

  const totalPagesToUse = pagination?.totalPages ?? 0;

  if (error) {
    console.log("Error is", error);
    return (
      <div className="min-h-screen py-6 flex flex-col items-center justify-center">
        <div className="text-red-500">
          Failed to load courses. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-3 flex flex-col items-center gap-8">
      <div className="w-full flex flex-col gap-8 md:mt-6">
        {loading ? (
          // Loading skeletons
          <>
            <HomeCourseCardSkeleton />
            <HomeCourseCardSkeleton />
            <HomeCourseCardSkeleton />
          </>
        ) : homeCourses && homeCourses.length > 0 ? (
          <>
            {/* Render actual courses */}
            {homeCourses!.map((course) => (
              <HomeCourseCard
                key={course.id}
                course={{
                  id: course.id,
                  slug: course.slug,
                  thumbnail_url: course.thumbnail_url || "/register.jpg",
                  title: course.title,
                  subtitle: course.subtitle || "",
                  difficulty: course.difficulty || "",
                  totalDuration: course.total_duration,
                  updated_at: course.created_at,
                  enrollmentsCount: course._count?.enrollments || 0,
                  instructorName:
                    course.user.full_name || "Instructor",
                  isInWishList:
                    course.isInWishList ||
                    wishlistedCourseIds.has(course.id) ||
                    false,
                  category: course.categories.name,
                }}
                onAdd={handleAddToWishlist}
                onRemove={handleRemoveFromWishlist}
              />
            ))}

            {pagination?.totalCount && pagination.totalCount > pageSize && (
              <div className="w-full flex justify-center mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPagesToUse}
                  onPageChange={goToPage}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            No courses available at the moment.
          </div>
        )}
      </div>

      {/* Loading indicator when changing pages */}
      {loading &&
        currentPage > 1 &&
        pagination?.totalCount &&
        pagination.totalCount > pageSize && (
          <div className="fixed top-0 left-0 w-full h-1">
            <div className="h-full bg-blue-600 animate-progress"></div>
          </div>
        )}
    </div>
  );
}
