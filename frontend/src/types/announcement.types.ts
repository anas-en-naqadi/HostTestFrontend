export interface Instructor {
  id: number;
  user: {
    id: number;
    full_name: string; // Changed from name to full_name to match API response
    email?: string; // Made optional since it's not present in the provided API response
  };
}

export interface Course {
  id: number;
  title: string;
  thumbnail_url: string;
  instructor_id: number;
  user?: {
    // Added user property based on API response
    id: number;
    full_name: string;
  };
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  courseId: number;
  publisher_id: number; // Added as shown in the API response
  created_at: string;
  updated_at: string;
  courses: Course; // Changed from course to courses to match API response
}

export interface PaginationMeta {
  current_page: number;
  from: number;
  last_page: number;
  path: string;
  per_page: number;
  to: number;
  total: number;
}

export interface PaginatedAnnouncements {
  success?: boolean; // Added from API response
  message?: string; // Added from API response
  data: Announcement[];
  meta: PaginationMeta;
}
