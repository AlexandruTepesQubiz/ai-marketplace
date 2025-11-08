import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceRoleClient } from '@/lib/supabase/service-role';

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone_number, user_id } = body;

    // Determine if this is a webhook call or authenticated request
    let userId: string;
    let supabase;

    if (user_id) {
      // Webhook call with user_id - use service role to bypass RLS
      userId = user_id;
      supabase = createServiceRoleClient();
    } else {
      // Standard authenticated request - use regular client with RLS
      supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        return NextResponse.json(
          { error: 'Unauthorized. Please sign in to update your profile.' },
          { status: 401 }
        );
      }
      userId = user.id;
    }

    // Validate phone_number if provided (it's optional)
    let sanitizedPhone = null;
    if (phone_number !== undefined && phone_number !== null) {
      const trimmedPhone = phone_number.trim();
      if (trimmedPhone.length > 0) {
        // Basic validation - you can add more sophisticated validation if needed
        if (trimmedPhone.length < 7 || trimmedPhone.length > 20) {
          return NextResponse.json(
            { error: 'Phone number must be between 7 and 20 characters' },
            { status: 400 }
          );
        }
        sanitizedPhone = trimmedPhone;
      }
    }

    // Update the profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ phone_number: sanitizedPhone })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
      message: 'Profile updated successfully',
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
