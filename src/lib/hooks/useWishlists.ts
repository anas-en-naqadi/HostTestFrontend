import { useState, useEffect } from "react";
import {
  fetchWishlistCourses,
  addToWishlist,
  removeFromWishlist,
  WishlistCourse,
  PaginationInfo
} from "@/lib/api/wishlists";
import { toast } from "sonner";
import axios from "axios"; // For checking isAxiosError
import { useClearDashboardCache } from "./useClearDashboardCache";

export const useWishlists = () => {
  const clearCacheLocally = useClearDashboardCache();
  const [wishlistCourses, setWishlistCourses] = useState<WishlistCourse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    totalCount: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 6
  });

  const fetchWishlist = async (page = 1, limit = 6) => {
    setLoading(true);
    setError(null); // Clear any existing error
    try {
      const result = await fetchWishlistCourses(page, limit);
      setWishlistCourses(result.courses);
      setPagination(result.pagination);
    } catch (err: unknown) {
      let errorMessage = "Failed to fetch wishlist.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const changePage = (newPage: number) => {
    fetchWishlist(newPage, pagination.limit);
  };

  const handleAddToWishlist = async (data: {course_id:number,main_course_id:number | null}) => {
    setError(null); // Clear any existing error
    try {
      const success = await addToWishlist(data);
      if (success) {
        // Refresh the current page after adding to wishlist
        clearCacheLocally();
        await fetchWishlist(pagination.currentPage, pagination.limit);
        toast.success("Added to wishlist!");
      } else {
        setError("Could not add to wishlist.");
        toast.error("Could not add to wishlist.");
      }
    } catch (err: unknown) {
      let errorMessage = "Error adding to wishlist.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleRemoveFromWishlist = async (data: {course_id:number,main_course_id:number | null}) => {
    setError(null); // Clear any existing error
    try {
      const success = await removeFromWishlist(data);
      if (success) {
        // Remove from local state first for immediate feedback
        clearCacheLocally();
        setWishlistCourses((prev) =>
          prev.filter((course) => course.id !== data.course_id)
        );
        
        // If this was the last item on the page and not the first page, go to previous page
        if (wishlistCourses.length === 1 && pagination.currentPage > 1) {
          await fetchWishlist(pagination.currentPage - 1, pagination.limit);
        } 
        // Otherwise refresh current page to get updated data
        else if (wishlistCourses.length > 1) {
          await fetchWishlist(pagination.currentPage, pagination.limit);
        }
        // If it was the last item overall, update pagination info
        else {
          setPagination(prev => ({
            ...prev,
            totalCount: Math.max(0, prev.totalCount - 1),
            totalPages: Math.max(1, Math.ceil((prev.totalCount - 1) / prev.limit))
          }));
        }
        
        toast.success("Removed from wishlist!");
      } else {
        setError("Could not remove from wishlist.");
        toast.error("Could not remove from wishlist.");
      }
    } catch (err: unknown) {
      let errorMessage = "Error removing from wishlist.";
      if (axios.isAxiosError(err)) {
        errorMessage = err.response?.data?.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    fetchWishlist(1, 6); // Start with the first page
  }, []);

  return {
    wishlistCourses,
    loading,
    error,
    pagination,
    fetchWishlist,
    changePage,
    handleAddToWishlist,
    handleRemoveFromWishlist,
  };
};