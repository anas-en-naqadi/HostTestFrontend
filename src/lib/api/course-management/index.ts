import axiosClient from "@/lib/axios";
import { CourseResponse } from "@/types/course.types";

// Response types
interface CourseApiResponse {
  success: boolean;
  message: string;
  data: CourseResponse;
}

interface CoursesListResponse {
  success: boolean;
  message: string;
  data: CourseResponse[];
}

interface PaginatedCoursesResponse {
  success: boolean;
  message: string;
  data: {
    courses: CourseResponse[];
    pagination: {
      totalCount: number;
      totalPages: number;
      currentPage: number;
      limit: number;
    };
  };
}

// Fetch all courses
export const fetchCourses = async (): Promise<CoursesListResponse> => {
  const { data } = await axiosClient.get('/courses');
  return data;
};

// Fetch courses by user ID (for instructors)
export const fetchCoursesByUserId = async (): Promise<CoursesListResponse> => {
  const params = new URLSearchParams();
  
  const { data } = await axiosClient.get(`/courses/user`, { params });
  return data;
};

// Get a single course by slug
export const getCourse = async (slug: string): Promise<CourseApiResponse> => {
  const { data } = await axiosClient.get(`/courses/${slug}`);
  return data;
};

// Create a new course
export const createCourse = async (formData: FormData): Promise<CourseApiResponse> => {
  console.log('Starting course creation...');
  
  try {
    // Log the form data for debugging
    console.log('FormData contents:');
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    // Use FormData directly for file uploads
    console.log('Making API request to /courses...');
    const { data } = await axiosClient.post('/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Course creation successful, response:', data);
    return data;
  } catch (error) {
    console.error('Course creation failed with error:', error);
    throw error;
  }
};

// Update an existing course
export const updateCourse = async (slug: string, formData: FormData): Promise<CourseApiResponse> => {
  console.log('Starting course update for slug:', slug);
  
  try {
    // Log the form data for debugging
    console.log('FormData contents for update:');
    for (const pair of formData.entries()) {
      console.log(pair[0], typeof pair[1] === 'string' ? pair[1] : 'File or complex data');
    }

    // Use FormData directly for file uploads
    console.log('Making API request to update course...');
    const { data } = await axiosClient.put(`/courses/${slug}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('Course update successful, response:', data);
    return data;
  } catch (error) {
    console.error('Course update failed with error:', error);
    throw error;
  }
};

// Update an existing course using JSON instead of FormData (preserves data types)
export const updateCourseJson = async (slug: string, courseData: any): Promise<CourseApiResponse> => {
  console.log('Starting course update (JSON) for slug:', slug);
  
  try {
    // Process the data to ensure proper types
    const processedData = {
      ...courseData,
      // Ensure arrays are arrays
      what_you_will_learn: Array.isArray(courseData.what_you_will_learn) 
        ? courseData.what_you_will_learn 
        : courseData.what_you_will_learn ? [courseData.what_you_will_learn] : [],
      
      course_requirements: Array.isArray(courseData.course_requirements) 
        ? courseData.course_requirements 
        : courseData.course_requirements ? [courseData.course_requirements] : [],
      
      // Ensure numeric values
      category_id: Number(courseData.category_id),
      instructor_id: Number(courseData.instructor_id),
      
      // Ensure boolean values
      is_published: Boolean(
        courseData.is_published === true || 
        courseData.is_published === 'true' || 
        courseData.is_published === '1'
      ),
      
      // Process modules if they exist
      modules: Array.isArray(courseData.modules) 
        ? courseData.modules.map((module: any) => ({
            ...module,
            id: module.id ? Number(module.id) : undefined,
            order_position: Number(module.order_position),
            lessons: Array.isArray(module.lessons) 
              ? module.lessons.map((lesson: any) => ({
                  ...lesson,
                  id: lesson.id ? Number(lesson.id) : undefined,
                  order_position: Number(lesson.order_position),
                  duration: Number(lesson.duration),
                  quiz_id: lesson.quiz_id ? Number(lesson.quiz_id) : null,
                  isFinalQuiz: Boolean(
                    lesson.isFinalQuiz === true || 
                    lesson.isFinalQuiz === 'true' || 
                    lesson.isFinalQuiz === '1'
                  )
                }))
              : []
          }))
        : []
    };
    
    console.log('Making API request to update course with JSON data...');
    const { data } = await axiosClient.put(`/courses/${slug}/json`, processedData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Course update (JSON) successful, response:', data);
    return data;
  } catch (error) {
    console.error('Course update (JSON) failed with error:', error);
    throw error;
  }
};

// Delete a course
export const removeCourse = async (slug: string): Promise<{ success: boolean; message: string }> => {
  const { data } = await axiosClient.delete(`/courses/${slug}`);
  return data;
};

// Fetch categories for course form
export const fetchCategories = async (): Promise<{ success: boolean; message: string; data: any[] }> => {
  const { data } = await axiosClient.get('/categories');
  return data;
};

// Publish or unpublish a course
export const toggleCoursePublishStatus = async (slug: string, isPublished: boolean): Promise<{ success: boolean; message: string }> => {
  const { data } = await axiosClient.patch(`/courses/${slug}/publish-status`, { is_published: isPublished });
  return data;
};

// Add a module to a course
export const addCourseModule = async (slug: string, moduleData: any): Promise<{ success: boolean; message: string; data: any }> => {
  const { data } = await axiosClient.post(`/courses/${slug}/modules`, moduleData);
  return data;
};

// Add a lesson to a module
export const addModuleLesson = async (moduleId: number, lessonData: any): Promise<{ success: boolean; message: string; data: any }> => {
  const { data } = await axiosClient.post(`/modules/${moduleId}/lessons`, lessonData);
  return data;
};
