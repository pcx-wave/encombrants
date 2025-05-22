import { Database } from './supabase';

export type UserRole = 'client' | 'collector' | 'deposit';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: Date;
}

export type DbUser = Database['public']['Tables']['users']['Row'];