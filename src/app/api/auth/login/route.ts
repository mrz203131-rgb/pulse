import { NextResponse } from "next/server";
import { createSession, normalizeEmail, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function redirectWithError(request: Request, message: string) {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user || !user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return redirectWithError(request, "Email or password was incorrect.");
  }

  await createSession(user.id);

  const redirectUrl = new URL(user.isOnboarded ? next : "/onboarding", request.url);

  if (!user.isOnboarded) {
    redirectUrl.searchParams.set("next", next);
  }

  return NextResponse.redirect(redirectUrl);
}
