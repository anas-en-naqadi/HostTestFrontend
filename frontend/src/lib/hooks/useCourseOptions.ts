import { useState } from 'react';
import { getAllCourses } from '@/lib/api/course/Allcourses';
import { toast } from 'sonner';

// useCourseOptions.ts
export const useCourseOptions = (currentUserId?: number, isAdmin?: boolean) => {
  const [courseOptions, setCourseOptions] = useState<Array<{ id: number; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCourseOptions = async () => {
    setIsLoading(true);
    try {
      const response = await getAllCourses(1, 100);
      
      // Filter courses if user is not admin
      let options = response?.courses || [];
      if (!isAdmin && currentUserId) {
        options = options.filter(
          (course) => course.user?.id === currentUserId
        );
      }
      console.log("response ", response)
      console.log("currentUserId ", currentUserId);

      const mappedOptions = options.map(course => ({
        id: course.id,
        title: course.title
      }));
      
      console.log("mappedOptions ", mappedOptions)
      setCourseOptions(mappedOptions);
      return mappedOptions;
    } catch (error) {
      console.error("Failed to fetch course options:", error);
      toast.error("Failed to load course options");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    courseOptions,
    isLoading,
    fetchCourseOptions
  };
};

export default useCourseOptions;