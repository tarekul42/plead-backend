export interface UserResponse {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: string;
  agencyId: string;
  phone?: string;
  title?: string;
  isActive: boolean;
}
