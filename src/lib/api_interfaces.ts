export interface User {
  created_at: string;
  email: string;
  id: string;
  permissions: string[];
  updated_at: string;
}
export interface Session {
  created_at: string;
  expires_at: string;
  permissions: string[];
  token: string;
  updated_at: string;
  user: User;
}