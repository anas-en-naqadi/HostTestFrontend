// src/types/instructor.types.ts
export interface InstructorResponse {
    id: number;
    user_id: number;
    full_name: string;
    email: string;
    description: string;
    specialization: string;
  }
  
  export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
  }