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
export interface Message {
  id: string;
  readed: boolean;
  owner: string;
  subscription: string;
  title: string;
  abstract: string;
  created_at: string;
  updated_at: string;
  content?: {
    data: string;
    type: string;
  };
}
export interface Service {
  description: string;
  id: string;
  name: string;
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