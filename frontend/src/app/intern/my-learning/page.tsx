"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CourseCard from "@/components/ui/CourseCard";
import { useEnrollments } from "@/lib/hooks/useEnrollments";
import { CourseCardData } from "@/types/course.types";
import CourseCardSkeleton from "@/components/common/CourseCardSkeleton";

export default function MyLearningPage() {
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);
  const { enrollments, loading, error, pagination, changePage } =
    useEnrollments();
  const [searchQuery, setSearchQuery] = useState("");

  // Transform enrollments to CourseCardData format for CourseCard component
  const transformedCourses: CourseCardData[] = enrollments.map(
    (enrollment) => ({
      slug: enrollment.courseSlug,
      title: enrollment.courseTitle,
      subTitle: enrollment.subtitle || "",
      thumbnail: enrollment.courseThumbnail,
      difficulty: enrollment.difficulty,
      duration: enrollment.duration,
      instructorName: enrollment.instructorName,
      isInWishList: false,
    })
  );

  // Filter courses based on search query
  const filteredCourses = transformedCourses.filter((course) =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset to first page when search query changes
  useEffect(() => {
    if (searchQuery !== "") {
      changePage(1);
    }
  }, [searchQuery, changePage]);

  // Generate page numbers for display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const { totalPages, currentPage } = pagination;

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 sm:pl-0 md:pl-0 overflow-x-hidden w-full">
      {/* Tabs */}
      <div className="flex mb-4 sm:mb-6 w-full">
      <Link
        href="/intern/my-learning"
        className={`px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center rounded-bl-2xl rounded-tl-2xl font-semibold w-1/2 whitespace-nowrap transition-colors duration-200 ${
          isWishlistHovered 
            ? " text-[#136A86] border-b border-[#136A86]  rounded-bl-none" 
            : "text-white bg-[#136A86] hover:bg-[#5CB5BD]"
        }`}
      >
        My Courses
      </Link>

      <Link
        href="/intern/wishlist"
        className="px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center font-semibold w-1/2 text-[#136A86] whitespace-nowrap border-b border-[#136A86] hover:bg-[#5CB5BD] hover:text-white hover:rounded-r-2xl hover:border-b-0 transition-colors duration-200"
        onMouseEnter={() => setIsWishlistHovered(true)}
        onMouseLeave={() => setIsWishlistHovered(false)}
      >
        My Wishlist
      </Link>
    </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-10">
          <p className="text-red-500 text-lg">{error}</p>
          <p>Please try refreshing the page</p>
        </div>
      )}

      {/* Course Cards */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 xl:gap-8 w-full">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => {
              // Find the corresponding enrollment
              const enrollment = enrollments[index];

              return (
                <div
                  key={`${enrollment.courseSlug}-${index}`}
                  className="w-full mt-3"
                >
                  <CourseCard
                    title={course.title}
                    subTitle={course.subTitle}
                    instructor={course.instructorName}
                    image={course.thumbnail}
                    progress={enrollment.progressPercent}
                    lessonsCompleted={
                      enrollment.completed
                        ? "Completed"
                        : `${enrollment.completedLessons} of ${enrollment.totalLessons} lessons completed`
                    }
                    completed={enrollment.completed}
                    onAction={() =>
                      (window.location.href = `/intern/course/${course.slug}/learn`)
                    }
                    actionLabel={
                      enrollment.completed ? "Refresh Memory" : "Resume Course"
                    }
                    level={course.difficulty}
                  />
                </div>
              );
            })
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-10">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-[#136A86] text-white rounded-md hover:bg-[#0e5469]"
                >
                  Clear Search
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Empty state message */}
      {!loading && !error && enrollments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-lg text-gray-500">
            You haven&apos;t enrolled in any courses yet.
          </p>
          <Link
            href="/intern/home"
            className="mt-4 px-4 py-2 bg-[#136A86] text-white rounded-md hover:bg-[#0e5469]"
          >
            Browse Courses
          </Link>
        </div>
      )}

      {/* Pagination */}
      {!loading &&
        !error &&
        filteredCourses.length > 0 &&
        pagination.totalPages > 1 && (
          <div className="flex justify-center mt-6 w-full">
            <div className="flex flex-wrap gap-1 sm:gap-2">
              {getPageNumbers().map((pageNumber, index) => (
                <button
                  key={index}
                  onClick={() =>
                    typeof pageNumber === "number"
                      ? changePage(pageNumber)
                      : null
                  }
                  className={`px-2 sm:px-3 py-1 rounded-md text-sm sm:text-base font-bold cursor-pointer ${
                    pageNumber === pagination.currentPage
                      ? "bg-[#136A86] text-white hover:bg-black"
                      : "hover:bg-white text-[#136A86]"
                  }`}
                  disabled={pageNumber === "..."}
                >
                  {pageNumber}
                </button>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}
