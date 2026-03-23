import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const content = String(formData.get("content") ?? "").trim();
  const next = String(formData.get("next") ?? "/create");

  if (!sessionUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  if (!sessionUser.isOnboarded) {
    const onboardingUrl = new URL("/onboarding", request.url);
    onboardingUrl.searchParams.set("next", next);
    return NextResponse.redirect(onboardingUrl);
  }

  if (!content) {
    const redirectUrl = new URL(next, request.url);
    redirectUrl.searchParams.set("error", "Write something before posting.");
    return NextResponse.redirect(redirectUrl);
  }

  await prisma.pulsePost.create({
    data: {
      userId: sessionUser.id,
      content,
    },
  });

  const redirectUrl = new URL(next, request.url);
  redirectUrl.searchParams.set("posted", "1");
  return NextResponse.redirect(redirectUrl);
}
