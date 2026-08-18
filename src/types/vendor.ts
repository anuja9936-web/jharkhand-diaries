import type { UserRole } from './common';

export interface VendorProfile {
  id: string;
  user_id: string;
  business_name: string;
  category: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  role: Extract<UserRole, 'vendor' | 'admin'>;
}

