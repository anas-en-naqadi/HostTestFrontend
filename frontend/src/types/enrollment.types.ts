// types/enrollment.types.ts
// Add pagination info type
export interface PaginationInfo {
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

// Updated to match the new controller response format
export interface PaginatedEnrollmentsResponse {
  success: boolean;
  message: string;
  data: EnrollmentItem[];
  pagination: PaginationInfo;
}

export interface EnrollmentsResponse {
  success: boolean;
  message: string;
  data: Array<{
    id: number;
    user_id: number;
    course_id: number;
    enrolled_at: string;
    progress_percent: number;
    last_accessed_module_id: number;
    last_accessed_lesson_id: number;
    completed_at: string | null;
    courses: {
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
      intro_video_url: string;
      difficulty: string;
      is_published: boolean;
      total_duration: number;
      created_at: string;
      updated_at: string;
      subtitle: string;
    };
  }>;
}

// Updated to match the controller response
export interface EnrollmentItem {
  courseTitle: string;
  instructorName: string;
  progressPercent: number;
  courseThumbnail: string;
  completedLessons: number;
  totalLessons: number;
  courseSlug: string;
  courseSubTitle: string;
}

// Define a type for a single lesson progress item
export interface LessonProgressItem {
  user_id: number;
  lesson_id: number;
  // Add other properties if they exist in your backend response, e.g.:
  // completed: boolean;
  // progress_percentage: number;
  // last_accessed_at: string;
}

// Adding this for type checking in the controller
export interface EnrollmentWithCourse {
  courses: {
    title: string;
    subtitle: string;
    thumbnail_url: string;
    slug: string;
    instructors: {
      users: {
        full_name: string;
      }
    },
    modules: Array<{
      lessons: Array<{
        // Use the specific type for lesson_progress array elements
        lesson_progress: LessonProgressItem[]
      }>
    }>
  }
}