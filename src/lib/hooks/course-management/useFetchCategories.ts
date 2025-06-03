import { useQuery } from "@tanstack/react-query";
import { fetchCategories } from "@/lib/api/course-management";

interface Category {
  id: number;
  name: string;
  slug: string;
}

export const useFetchCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const response = await fetchCategories();
        // Extract the data array from the API response
        return response.data;
      } catch (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
};
