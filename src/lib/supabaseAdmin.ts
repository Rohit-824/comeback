import { createClient } from '@supabase/supabase-js';

// Server-only client. Uses the service role key, which bypasses RLS and can
// manage auth users directly — never import this from a 'use client' file.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
