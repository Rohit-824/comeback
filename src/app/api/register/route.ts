import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
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

    // 1. Create user in Supabase Auth via Admin API
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (createError || !created.user) {
      // THIS WILL NOW SHOW THE EXACT SUPABASE ERROR ON YOUR SCREEN
      return NextResponse.json({ success: false, error: `Supabase Auth Error: ${createError?.message}` }, { status: 400 });
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
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ success: false, error: `Database Profile Error: ${profileError.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: created.user.id });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: `Server Crash: ${err.message}` }, { status: 500 });
  }
}