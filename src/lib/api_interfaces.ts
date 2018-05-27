export interface User {
  created_at: string;
  email: string;
  id: string;
  permissions: string[];
  updated_at: string;
  nickname: string;
}
export interface Session {
  created_at: string;
  expires_at: string;
  permissions: string[];
  token: string;
  updated_at: string;
  user: User;
}
export interface Message {
  id: string;
  readed: boolean;
  owner: string;
  subscription: string;
  title: string;
  summary: string;
  created_at: string;
  updated_at: string;
  content?: string;
  href: string | null;
}
export interface Service {
  description: string;
  id: string;
  title: string;
}
export interface Subscription {
  config: string;
  created_at: string;
  deleted: boolean;
  id: string;
  owner: string;
  service: string;
  updated_at: string;
}