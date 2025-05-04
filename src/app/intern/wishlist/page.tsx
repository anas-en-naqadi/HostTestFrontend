"use client";

// Modify your WishlistPage component
import { useState, useEffect } from "react";
import Link from "next/link";
import WishListCard from "@/components/ui/WishListCard";
import {
  fetchWishlistCourses,
  PaginatedWishlistResponse,
} from "@/lib/api/wishlists";
import { CourseCardData } from "@/types/course.types";
import { WishlistCourse } from "@/lib/api/wishlists";
import WishlistCardSkeleton from "@/components/common/WishlistCardSkeleton";

export default function WishlistPage() {
  const [isCoursesHovered, setIsCoursesHovered] = useState(false);
  const [courses, setCourses] = useState<CourseCardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6,
  });

  // Load wishlist whenever page changes
  useEffect(() => {
    loadWishlist(pagination.currentPage);
  }, [pagination.currentPage]);

  const loadWishlist = async (page = 1) => {
    try {
      setLoading(true);
      // Make sure to pass the page to the API
      const response: PaginatedWishlistResponse = await fetchWishlistCourses(
        page
      );

      // Update courses and pagination from API response
      const wishlistCoursesArray = response.courses;
      const formattedCourses = wishlistCoursesArray.map(
        (course: WishlistCourse) => ({
          id: course.id,
          title: course.title,
          instructorName: course.instructorName,
          thumbnail: course.thumbnail,
          isInWishList: true,
          difficulty: course.difficulty,
          duration: course.duration,
          slug: course.slug,
        })
      );

      setCourses(formattedCourses);
      setPagination(response.pagination);
      setError(null);
    } catch (err) {
      setError("Failed to load wishlist. Please try again later.");
      console.error("Wishlist fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseRemove = (courseId: number) => {
    // Filter out the removed course
    const updatedCourses = courses.filter((course) => course.id !== courseId);
    setCourses(updatedCourses);

    // If current page becomes empty, reload the current page to get new data
    if (updatedCourses.length === 0 && pagination.currentPage > 1) {
      changePage(pagination.currentPage - 1);
    } else if (updatedCourses.length === 0) {
      // Reload current page if it's already page 1
      loadWishlist(1);
    }
  };

  const changePage = (pageNumber: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: pageNumber,
    }));
  };

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 sm:pl-0 md:pl-0 overflow-x-hidden w-full">
       <div className="flex mb-4 sm:mb-6 w-full">
      <Link
        href="/intern/my-learning"
        className="px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center font-semibold w-1/2 text-[#136A86] whitespace-nowrap border-b border-[#136A86] hover:bg-[#5CB5BD] hover:text-white hover:rounded-l-2xl hover:border-b-0 transition-colors duration-200"
        onMouseEnter={() => setIsCoursesHovered(true)}
        onMouseLeave={() => setIsCoursesHovered(false)}
      >
        My Courses
      </Link>
      <Link
        href="/intern/wishlist"
        className={`px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center rounded-br-2xl rounded-tr-2xl font-semibold w-1/2 whitespace-nowrap transition-colors duration-200 ${
          isCoursesHovered 
            ? "text-[#136A86] border-b border-[#136A86] rounded-br-none" 
            : "text-white bg-[#136A86] hover:bg-[#5CB5BD]"
        }`}
      >
        My Wishlist
      </Link>
    </div>
        {/* Skeleton loading grid - matches the actual card grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 w-full">
          {Array(6)
            .fill(0)
            .map((_, index) => (
              <div key={index} className="sm:w-full overflow-hidden h-full">
                <WishlistCardSkeleton />
              </div>
            ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-3 sm:p-4 md:p-6 sm:pl-0 md:pl-0 overflow-x-hidden w-full">
        <div className="flex mb-4 sm:mb-6 w-full">
      <Link
        href="/intern/my-learning"
        className="px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center font-semibold w-1/2 text-[#136A86] whitespace-nowrap border-b border-[#136A86] hover:bg-[#5CB5BD] hover:text-white hover:rounded-l-2xl hover:border-b-0 transition-colors duration-200"
        onMouseEnter={() => setIsCoursesHovered(true)}
        onMouseLeave={() => setIsCoursesHovered(false)}
      >
        My Courses
      </Link>
      <Link
        href="/intern/wishlist"
        className={`px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center rounded-br-2xl rounded-tr-2xl font-semibold w-1/2 whitespace-nowrap transition-colors duration-200 ${
          isCoursesHovered 
            ? "text-[#136A86] border-b border-[#136A86] rounded-br-none" 
            : "text-white bg-[#136A86] hover:bg-[#5CB5BD]"
        }`}
      >
        My Wishlist
      </Link>
    </div>
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-lg text-red-500 mb-4">{error}</p>
          <Link
            href="/intern/home"
            className="px-4 py-2 bg-[#136A86] text-white rounded-md hover:bg-[#0d5269] transition-colors"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 sm:pl-0 md:pl-0 overflow-x-hidden w-full">
      {/* Tabs */}
      <div className="flex mb-4 sm:mb-6 w-full">
      <Link
        href="/intern/my-learning"
        className="px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center font-semibold w-1/2 text-[#136A86] whitespace-nowrap border-b border-[#136A86] hover:bg-[#5CB5BD] hover:text-white hover:rounded-l-2xl hover:border-b-0 transition-colors duration-200"
        onMouseEnter={() => setIsCoursesHovered(true)}
        onMouseLeave={() => setIsCoursesHovered(false)}
      >
        My Courses
      </Link>
      <Link
        href="/intern/wishlist"
        className={`px-3 sm:px-4 py-2 sm:py-4 text-sm sm:text-base uppercase text-center rounded-br-2xl rounded-tr-2xl font-semibold w-1/2 whitespace-nowrap transition-colors duration-200 ${
          isCoursesHovered 
            ? "text-[#136A86] border-b border-[#136A86] rounded-br-none" 
            : "text-white bg-[#136A86] hover:bg-[#5CB5BD]"
        }`}
      >
        My Wishlist
      </Link>
    </div>

      {/* Empty state */}
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <p className="text-lg text-gray-500 mb-4">Your wishlist is empty.</p>
          <Link
            href="/intern/home"
            className="px-4 py-2 bg-[#136A86] text-white rounded-md hover:bg-[#0d5269] transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <>
          {/* Wishlist Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 w-full">
            {courses.map((course) => (
              <div key={course.id} className="w-full">
                <WishListCard course={course} onRemove={handleCourseRemove} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
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
        </>
      )}
    </div>
  );
}
