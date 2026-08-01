import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types matching your database tables
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'student' | 'donor' | 'admin';
  college: string;
  branch: string;
  year: string;
  roll_number: string;
  is_admin?: boolean;
  occupation?: string;
  member_since: string;
}

export interface Post {
  id: string;
  author_id: string;
  title: string;
  body: string;
  category: 'funding' | 'discussion' | 'success' | 'gossip' | 'dec';
  subject_code?: string;
  subject_grade?: string;
  goal?: number;
  raised: number;
  status: 'pending_verification' | 'active' | 'rejected';
  upi_id?: string;
  account_number?: string;
  ifsc_code?: string;
  donors_count: number;
  days_left?: number;
  rejection_reason?: string;
  college: string;
  created_at: string;
  profiles?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  parent_id?: string;
  text: string;
  upvotes: number;
  created_at: string;
  profiles?: Profile;
  replies?: Comment[];
}