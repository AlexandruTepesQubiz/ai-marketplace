import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs configuration missing' },
        { status: 500 }
      );
    }

    // Get signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs signed URL error:', error);
      return NextResponse.json(
        { error: 'Failed to get signed URL' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      signedUrl: data.signed_url,
      userId: user.id,
      userName: user.user_metadata?.full_name || 'User',
    });

  } catch (error) {
    console.error('Signed URL error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
