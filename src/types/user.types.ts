// data/users.ts
export type User = {
  id: string;
  full_name: string;
  username: string;
  status: string;
  email: string;
  role: string;
  last_login: Date;
  updated_at: Date; // ISO date string
  created_at: Date;
  instructor?: {
    id?: number;
    description?: string;
    specialization?: string;
  };
};

export interface UserData {
  full_name: string;
  role: string;
  username?:string;
  email?:string;
  status: boolean;
  specialization?: string;
  description?: string;
}
export interface ApiUser {
  id?:number;
  full_name: string;
  username: string;
  email: string;
  role: string;
  status: boolean;
  specialization?: string;
  description?: string;
}
