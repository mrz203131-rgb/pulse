import { NextResponse } from "next/server";
import { createSessionForExternalIdentity } from "@/lib/auth";
import { verifySupabaseAccessToken } from "@/lib/supabase-auth";

type RequestBody = {
  accessToken?: string;
  next?: string;
};

export async function POST(request: Request) {
  let body: RequestBody;

  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Expected JSON body." }, { status: 400 });
  }

  const accessToken = body.accessToken?.trim();
  const next = body.next?.trim() || "/";

  if (!accessToken) {
    return NextResponse.json({ error: "Missing Supabase access token." }, { status: 400 });
  }

  try {
    const verifiedUser = await verifySupabaseAccessToken(accessToken);
    const user = await createSessionForExternalIdentity(verifiedUser);

    return NextResponse.json({
      next: user.isOnboarded ? next : `/onboarding?next=${encodeURIComponent(next)}`,
      user: {
        authProvider: user.authProvider,
        email: user.email,
        id: user.id,
        isOnboarded: user.isOnboarded,
        providerUserId: user.providerUserId,
        username: user.username,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to verify Supabase session.",
      },
      { status: 401 },
    );
  }
}
