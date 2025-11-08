import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function GET(request: NextRequest) {
  try {
    // Check for user_id in query parameters (for webhook/tool calls)
    const { searchParams } = new URL(request.url);
    const userIdParam = searchParams.get('user_id');

    // Determine if this is a webhook call or authenticated request
    let userId: string;
    let supabase;

    if (userIdParam) {
      // Webhook/tool call with user_id - use service role to bypass RLS
      userId = userIdParam;
      supabase = createServiceRoleClient();
    } else {
      // Standard authenticated request - use regular client with RLS
      supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in to view your profile.' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // Fetch the user's profile from the profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, phone_number, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Database error:', profileError);
      return NextResponse.json(
        { error: 'Failed to fetch profile', details: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      },
    });

  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
