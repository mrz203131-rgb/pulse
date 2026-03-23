import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSession();

  const redirectUrl = new URL("/", request.url);
  return NextResponse.redirect(redirectUrl);
}
