import { NextResponse } from "next/server";
import { createSession, hashPassword, normalizeEmail } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function redirectWithError(request: Request, path: string, message: string) {
  const url = new URL(path, request.url);
  url.searchParams.set("error", message);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password || password.length < 8) {
    return redirectWithError(request, "/signup", "Use a valid email and a password with at least 8 characters.");
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return redirectWithError(request, "/signup", "An account with that email already exists.");
  }

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashPassword(password),
      authProvider: "local",
      providerUserId: `local:${email}`,
      isOnboarded: false,
    },
  });

  await createSession(user.id);

  const redirectUrl = new URL("/onboarding", request.url);
  redirectUrl.searchParams.set("next", next);
  return NextResponse.redirect(redirectUrl);
}
