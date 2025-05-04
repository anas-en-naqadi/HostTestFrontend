"use client";

import HomeCourseCard from "@/components/ui/HomeCourseCard";
import { useCourses, useFetchCoursesWithFilter } from "@/lib/hooks/useCourses";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
// Import the Pagination component
import Pagination from "@/components/ui/Pagination"; // Create this component as shown previously
import HomeCourseCardSkeleton from "@/components/common/HomeCourseCardSkeleton";
import { CourseResponse } from "@/types/course.types";

export default function HomePage() {
  // Update useCourses to get pagination info and page navigation function
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const durations = searchParams.getAll("durations");
  const topics = searchParams.getAll("topics");
  const levels = searchParams.getAll("levels");

  const pageSize = 6;

  const {
    courses,
    loading,
    error,
    getAllCourses,
    pagination,
    goToPage,
    currentPage,
  } = useCourses(1, 6, query);
  const { mutateAsync: getCoursesByFilter } = useFetchCoursesWithFilter();
  const [homeCourses, setHomeCourses] = useState<CourseResponse[]>(courses);
  const [loadingState, setLoadingState] = useState(loading);

  const [filteredPagination, setFilteredPagination] = useState<{
    totalCount: number;
    totalPages: number;
  } | null>(null);
  
  useEffect(() => {
    setLoadingState(true);
    const hasFilters =
      durations.length > 0 || topics.length > 0 || levels.length > 0;

    const fetchData = async () => {
      try {
          if (hasFilters) {
            const result = await getCoursesByFilter({
              page: currentPage,
              pageSize: 6,
              query,
              filters: { durations, topics, levels },
            });

            // If currentPage is invalid for filtered data, go to page 1
        if (currentPage > result.pagination.totalPages && result.pagination.totalPages > 0) {
          goToPage(1);
          return; // Don't continue rendering with invalid data
        }
        
        setHomeCourses(result.courses);
        setFilteredPagination({
          totalCount: result.pagination.totalCount,
          totalPages: result.pagination.totalPages,
        });
      } else {
        const result = await getAllCourses(currentPage, 6, query);
        setHomeCourses(result.courses);
        setFilteredPagination(null); // Reset when no filter
      }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoadingState(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 300);
    return () => clearTimeout(debounceTimer);
  }, [query, currentPage, getCoursesByFilter, searchParams, getAllCourses]);

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

  const totalCountToUse = filteredPagination?.totalCount ?? pagination?.totalCount ?? 0;
const totalPagesToUse = filteredPagination?.totalPages ?? pagination?.totalPages ?? 0;

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
        {loadingState ? (
          // Loading skeletons
          <>
            <HomeCourseCardSkeleton />
            <HomeCourseCardSkeleton />
            <HomeCourseCardSkeleton />
          </>
        ) : homeCourses!.length > 0 ? (
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
                    course.instructors.users.full_name || "Instructor",
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



{totalCountToUse > pageSize && (
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
      {loading && currentPage > 1 && pagination.totalCount > pageSize && (
        <div className="fixed top-0 left-0 w-full h-1">
          <div className="h-full bg-blue-600 animate-progress"></div>
        </div>
      )}
    </div>
  );
}
