export interface Wishlist {
  user_id: number;
  course_id: number;
  created_at: string;
  course: {
    id: number;
    title: string;
    instructor: { name: string };
    thumbnail: string;
    difficulty: string;
    duration: number;
    slug: string;
  };
}

// Define the structure of a raw wishlist item as returned by the backend API
export interface RawWishlistItem {
  user_id: number;
  course_id: number; // This property is used in useCourses
  created_at: string;
  updated_at: string;
  course: {
    id: number;
    title: string;
    instructor: { name: string };
    thumbnail: string;
    difficulty: string;
    duration: number;
    slug: string;
  };
}


export interface WishlistResponse {
  success: boolean;
  data: RawWishlistItem[];
  pagination: {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}