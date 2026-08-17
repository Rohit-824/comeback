import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
    );

    const { role, fullName, email, password, college, branch, year, rollNumber, occupation } = await req.json();

    if (!role || !fullName || !email || !password) {
      return NextResponse.json({ success: false, error: 'Missing required fields.' }, { status: 400 });
    }
    if (role !== 'student' && role !== 'donor') {
      return NextResponse.json({ success: false, error: 'Invalid role.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, role },
    });

    if (createError || !created.user) {
      return NextResponse.json({ success: false, error: createError?.message || 'Could not create account.' }, { status: 400 });
    }

    const profilePayload: Record<string, unknown> = {
      id: created.user.id,
      full_name: fullName,
      email,
      role,
      is_admin: false,
      member_since: new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
    };

    if (role === 'student') {
      profilePayload.college = college || null;
      profilePayload.branch = branch || null;
      profilePayload.year = year || null;
      profilePayload.roll_number = rollNumber || null;
    } else {
      profilePayload.occupation = occupation || null;
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) {
      console.error('Supabase profile upsert error details:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return NextResponse.json({ success: false, error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, userId: created.user.id });
  } catch (err: any) {
    console.error('Registration API crash:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}