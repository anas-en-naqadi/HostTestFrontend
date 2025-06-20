// src/lib/api/categories.ts
import axiosInstance from '../axios';
import { 
  CategoryResponse, 
  CreateCategoryDto, 
  UpdateCategoryDto 
} from '../../types/category.types';
import { AxiosResponse } from 'axios';
import { ApiResponse } from '../../types/api.types';

interface CategoryResult {
  data: CategoryResponse[];
}

interface ListCategoriesParams {
  sortBy?: 'name' | 'courseCount';
  sortOrder?: 'asc' | 'desc';
}

const BASE_URL = '/categories';

export const fetchCategories = async ({
  sortBy = 'name',
  sortOrder = 'asc'
}: ListCategoriesParams = {}): Promise<CategoryResult> => {
  try {
    const response: AxiosResponse<ApiResponse<CategoryResult>> = await axiosInstance.get(BASE_URL, {
      params: { sortBy, sortOrder }
    });
    if (!response.data.data) throw new Error('No data received');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw new Error('Failed to fetch categories');
  }
};

// Rest of the API functions remain the same

export const createCategory = async (dto: CreateCategoryDto): Promise<CategoryResponse> => {
  const { data } = await axiosInstance.post<CategoryResponse>(BASE_URL, dto);
  if (!data) throw new Error('Failed to create category');
  return data;
};

export const updateCategory = async (slug: string, dto: UpdateCategoryDto): Promise<CategoryResponse> => {
  const { data } = await axiosInstance.put<CategoryResponse>(`${BASE_URL}/${slug}`, dto);
  if (!data) throw new Error('Failed to update category');
  return data;
};

export const deleteCategory = async (slug: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${BASE_URL}/${slug}`);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw new Error('Failed to delete category');
  }
};