import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    // Lazy-initialize inside the handler function to prevent static build crash
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );

    const body = await req.json();
    const role = body.role?.trim();
    const fullName = body.fullName?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!role || !fullName || !email || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }
    if (role !== 'student' && role !== 'donor') {
      return NextResponse.json({ success: false, error: 'Invalid user role selected.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    // 1. Create user in Supabase Auth via Admin API (pre-confirmed)
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (createError || !created.user) {
      console.error('Supabase Auth createUser error:', createError);
      return NextResponse.json({ success: false, error: createError?.message || 'Could not create authentication account.' }, { status: 400 });
    }

    // 2. Build profile database payload
    const profilePayload: Record<string, unknown> = {
      id: created.user.id,
      full_name: fullName,
      email: email,
      role: role,
      is_admin: false,
      member_since: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
      college: role === 'student' ? (body.college?.trim() || null) : null,
      branch: role === 'student' ? (body.branch?.trim() || null) : null,
      year: role === 'student' ? (body.year?.trim() || null) : null,
      roll_number: role === 'student' ? (body.rollNumber?.trim() || null) : null,
      occupation: role === 'donor' ? (body.occupation?.trim() || null) : null,
    };

    // 3. Upsert into public.profiles table
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.error('Supabase profiles upsert failure:', profileError);
      // Clean up the created auth user so it doesn't leave an orphan record
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ success: false, error: `Database profile error: ${profileError.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: created.user.id });
  } catch (err: any) {
    console.error('Critical Register API Crash:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error during registration.' }, { status: 500 });
  }
}