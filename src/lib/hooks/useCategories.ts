// src/lib/hooks/useCategories.ts
import { useState, useEffect, useCallback } from "react";
import {
  fetchCategories,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
} from "../api/categories";
import {
  CategoryResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/types/category.types";
import { toast } from "sonner";

interface UseCategoriesParams {
  initialSortBy?: "name" | "courseCount";
  initialSortOrder?: "asc" | "desc";
}

export const useCategories = ({
  initialSortBy = "name",
  initialSortOrder = "asc",
}: UseCategoriesParams = {}) => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"name" | "courseCount">(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchCategories({
        sortBy,
        sortOrder,
      });
      setCategories(result.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch categories";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const createCategory = async (dto: CreateCategoryDto) => {
    setIsMutating(true);
    try {
      const newCategory = await createCategoryApi(dto);
      await fetchData();
      toast.success("Category created successfully");
      return newCategory;
    } catch (err: unknown) {
      let message = "Failed to create category";
    
    if (err instanceof Error) {
      // Handle API error response (assuming it's an Axios error)
      if ('response' in err && err.response?.status === 409) {
        message = err.response.data?.message || "Category already exists";
      } else {
        message = err.message;
      }
    }

    toast.error(message);
    throw err;
    } finally {
      setIsMutating(false);
    }
  };

  const updateCategory = async (slug: string, dto: UpdateCategoryDto) => {
    setIsMutating(true);
    try {
      const updatedCategory = await updateCategoryApi(slug, dto);
      await fetchData();
      toast.success("Category updated successfully");
      return updatedCategory;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update category";
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsMutating(false);
    }
  };

  const deleteCategory = async (slug: string) => {
    setIsMutating(true);
    try {
      await deleteCategoryApi(slug);
      await fetchData();
      toast.success("Category deleted successfully");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete category";
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsMutating(false);
    }
  };

  const handleSortChange = (
    newSortBy: "name" | "courseCount",
    newSortOrder: "asc" | "desc"
  ) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  return {
    categories,
    loading,
    error,
    isMutating,
    sortBy,
    sortOrder,
    handleSortChange,
    createCategory,
    updateCategory,
    deleteCategory,
    refreshData: fetchData,
  };
};