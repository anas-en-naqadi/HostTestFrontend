import { Note } from "./notes.types";

export interface CourseCardData{
id?:number;
slug:string;
title:string;
subTitle?: string;
thumbnail:string;
difficulty:string;
duration:number;
instructorName:string;
isInWishList:boolean;
}

export interface Enrollment  {
    courseTitle: string;
    instructorName: string;
    progressPercent: number;
    totalLessons:number;
    completedLessons:number;
    courseSlug:string;
    courseThumbnail:string;
    // si tu as d'autres champs, ajoute-les ici

  };

  export interface CourseResponse {
    categories: {
      id: number;
      name: string;
    };
    id: number;
    title: string;
    slug: string;
    thumbnail_url: string;
    difficulty: string;
    total_duration: number;
    is_published: boolean;
    subtitle: string;
    created_at: string;
    _count?: {
      enrollments: number;
    };
    instructors: {
      id: number;
      specialization: string;
      users: {
        full_name: string;
      };
    };
    isInWishList: boolean;
  };interface Lesson {
    id: number;
    title: string;
    content_type: string;
    video_url: string | null;
    lesson_text: string | null;
    duration: number | null;
    order_position: number;
    created_at: Date;
    updated_at: Date;
    quiz_id: number | null;
  }

  
  interface Instructor {
    fullName: string;
    specialization: string | null;
    description: string | null;
    otherCourses: CourseCardData[];
  }
  
  export interface FormattedCourse {
    id: number;
    title: string;
    subtitle: string | null;
    description: string;
    difficulty: string;
    slug: string;
    introVideo: string;
    duration: number;
    createdAt: Date;
    isEnrolled:boolean;
    whatYouWillLearn: []; // Could be specified more precisely based on actual structure
    requirements: []; // Could be specified more precisely based on actual structure
    categories: []; // Could be specified more precisely based on actual structure
    isInWishList: boolean;
    instructor: Instructor;
    enrollmentsCount: number;
    modules: {
      id: number;
      title: string;
      duration: number;
      orderPosition: number;
      lessons: Lesson[];
    }[];

  }

  export type QuizAttempt = {
    passed: boolean;
    // Add other attempt fields if needed
  };
  
  export type QuizWithStatus = {
    id: number;
    title: string;
    description?: string;
    questions?: any[]; // Replace with proper question export type
    passing_score?: number;
    quiz_attempts: QuizAttempt[];
    isQuizPassed: boolean;
    // Add other quiz fields
  };
  
  export type LessonLearn = {
    id: number;
    title: string;
    content_type : "video" | "text" | "quiz" | "challenge";
    video_url?: string | null;
    lesson_text?: string | null;
    duration?: number;
    order_position: number;
    quiz?: QuizWithStatus | null;
  };
  
  export type Module = {
    id: string;
    title: string;
    duration: number;
    order_position: number;
    lessons: LessonLearn[];
  };
  
  export type InstructorLearn = {
    id: number;
    full_name: string;
    avatar_url?: string;
    specialization?: string;
    description?: string;
  };
  
  export type Wishlist = {
    id: number;
    // Add other wishlist fields
  };
  
  export type EnrollmentLearn = {
    id: number;
    last_accessed_module_id?: number;
    last_accessed_lesson_id?: number;
    // Add other enrollment fields
  };
  
  export type Category = {
    id: number;
    name: string;
    slug: string;
  };
  
  export type LearnDetailResponse = {
    id: number;
    title: string;
    slug: string;
    description: string;
    what_you_will_learn: string[];
    course_requirements: string[];
    thumbnail_url: string;
    intro_video_url?: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    total_duration: number;
    is_published: boolean;
    subtitle?: string;
    created_at: string;
    updated_at: string;
    // Relationships
    modules: Module[];
    instructors: {
      users: InstructorLearn;
      specialization: string;
      description: string;
    };
    categories: Category;
    
    // Computed fields
    isInWishlist: boolean;
    isEnrolled: boolean;
    wishlists: Wishlist ;
    enrollments: EnrollmentLearn ;
    
    // Additional data
    notes: Note[]; // Assuming you have a Note type defined elsewhere
    _count?: {
      enrollments?: number;
      // Add other count fields if needed
    };
  };
  
