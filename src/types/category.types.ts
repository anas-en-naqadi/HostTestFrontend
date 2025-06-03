// src/types/category.types.ts

// Request DTOs
export interface CreateCategoryDto {
    name: string;
  }
  
  export interface UpdateCategoryDto {
    name?: string;
  }
  
  // Response DTOs
  export interface CategoryResponse {
    id: string;
    name: string;
    slug: string;
    courseCount?: number;
    creatorName?: string;
    createdBy?: number;
  }