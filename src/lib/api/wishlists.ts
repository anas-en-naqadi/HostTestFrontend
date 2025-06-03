import axiosClient from "@/lib/axios";
import { WishlistResponse } from "@/types/wishlist.types";

interface BackendCourse {
  id: number;
  title: string;
  description: string;
  what_you_will_learn: {
    objectives: string[];
  };
  course_requirements: {
    prereqs: string[];
  };
  instructor_id: number;
  category_id: number;
  thumbnail_url: string;
  slug: string;
  isEnrolled: boolean;
  intro_video_url: string;
  difficulty: string;
  is_published: boolean;
  total_duration: number;
  created_at: string;
  updated_at: string;
  subtitle: string;
  instructors: {
    users: {
      full_name: string;
    };
  };
}

type WishlistResponseItem = {
  courses: BackendCourse;
};

export interface WishlistCourse {
  id: number;
  title: string;
  instructorName: string;
  thumbnail: string;
  isInWishList: boolean;
  difficulty: string;
  duration: number;
  slug: string;
  isEnrolled: boolean;
}

// Define pagination response type
export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Add a type for the full paginated response
export interface PaginatedWishlistResponse {
  courses: WishlistCourse[];
  pagination: PaginationInfo;
}

// Define a type for an Axios error with a response structure
interface AxiosErrorWithResponse extends Error {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

// Type guard to check if an error is an Axios error with a response
function isAxiosErrorWithResponse(error: unknown): error is AxiosErrorWithResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as { response: unknown }).response === 'object' &&
    (error as { response: unknown }).response !== null
  );
}

export const fetchWishlistCourses = async (page = 1, limit = 6): Promise<PaginatedWishlistResponse> => {
  try {
    const response = await axiosClient.get<{
      success: boolean;
      data: WishlistResponseItem[];
      pagination?: PaginationInfo;
    }>(`/wishlists?page=${page}&limit=${limit}`);

    if (!response.data.success) return { courses: [], pagination: { totalCount: 0, totalPages: 0, currentPage: page, limit } };

    const wishlistCourses: WishlistCourse[] = await Promise.all(
      response.data.data.map(async (item) => {
        const course = item.courses;
        const instructorName = course.user.full_name || "Instructor";

        return {
          id: course.id,
          title: course.title,
          instructorName,
          thumbnail: course.thumbnail_url || "/register.jpg",
          isInWishList: true,
          difficulty: course.difficulty || "Beginner",
          duration: course.total_duration || 0,
          slug: course.slug,
          isEnrolled: course.isEnrolled
        };
      })
    );

    // Return the courses and pagination info
    return {
      courses: wishlistCourses,
      pagination: response.data.pagination || {
        totalCount: wishlistCourses.length,
        totalPages: Math.ceil(wishlistCourses.length / limit),
        currentPage: page,
        limit
      }
    };
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    throw error;
  }
};

export const addToWishlist = async (data:{course_id:number,main_course_id:number | null}): Promise<boolean> => {
  try {
    const response = await axiosClient.post("/wishlists", data);
    return response.data.success;
  } catch (error) {
    // Use the type guard to check if it's an Axios error with a response
    if (isAxiosErrorWithResponse(error)) {
      // Check if the error is because the course is already in wishlist
      if (error.response?.status === 400 &&
          error.response?.data?.message?.includes('already in wishlist')) {
        // If course is already in wishlist, consider it as success
        console.log("Course already in wishlist, considering as success");
        return true;
      }
    }
    console.error("Error adding to wishlist:", error);
    return false;
  }
};

export const removeFromWishlist = async (data:{course_id:number,main_course_id:number | null}): Promise<boolean> => {
  try {
    // console.error(data);
    const response = await axiosClient.delete(`/wishlists/${data.course_id}`, {
      data: { main_course_id: data.main_course_id }
    });
    return response.data.success;
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    return false;
  }
};

export const getUserWishlists = async (
  params?: { page?: number; limit?: number }
): Promise<WishlistResponse> => {
  try {
    const { page = 1, limit = 50 } = params || {};
    const response = await axiosClient.get<WishlistResponse>(
      `/wishlists?page=${page}&limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user wishlists:", error);
    throw error;
  }
};

