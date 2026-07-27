export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
  isActive?: boolean;
  profile?: any;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}
