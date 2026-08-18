export type UserRole = 'tourist' | 'vendor' | 'admin';

export interface Profile {
  id: string;
  clerk_user_id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}

