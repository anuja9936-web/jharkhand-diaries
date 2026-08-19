export type UserRole = 'tourist' | 'provider' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiResult<T> {
  data: T | null;
  error: string | null;
}
