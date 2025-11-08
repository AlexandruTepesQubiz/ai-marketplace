import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user (optional for testing)
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to get signed URL." },
        { status: 401 }
      );
    }

    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      console.error("Missing config:", {
        hasAgentId: !!agentId,
        hasApiKey: !!apiKey,
      });
      return NextResponse.json(
        { error: "ElevenLabs configuration missing" },
        { status: 500 }
      );
    }

    console.log("Requesting signed URL for agent:", agentId);

    const client = new ElevenLabsClient({
      environment: "https://api.elevenlabs.io",
      apiKey: apiKey,
    });

     const signed_url = await client.conversationalAi.conversations.getSignedUrl({
        agentId,
    });

    console.log("Signed URL obtained successfully", { signed_url });

    return NextResponse.json({
      signedUrl: signed_url.signedUrl || signed_url,
      userId: user.id,
      userName: user.user_metadata?.first_name || "User",
    });
  } catch (error) {
    console.error("Signed URL error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
