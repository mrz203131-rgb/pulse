import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function redirectWithError(request: Request, message: string, next: string) {
  const url = new URL("/onboarding", request.url);
  url.searchParams.set("error", message);
  url.searchParams.set("next", next);
  return NextResponse.redirect(url);
}

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const avatarPlaceholder = String(formData.get("avatarPlaceholder") ?? "").trim();
  const next = String(formData.get("next") ?? "/profile");

  if (!sessionUser) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", "/onboarding");
    return NextResponse.redirect(loginUrl);
  }

  if (!username || username.length < 3) {
    return redirectWithError(request, "Choose a username with at least 3 characters.", next);
  }

  const existingUsername = await prisma.user.findFirst({
    where: {
      username,
      NOT: {
        id: sessionUser.id,
      },
    },
  });

  if (existingUsername) {
    return redirectWithError(request, "That username is already taken.", next);
  }

  await prisma.user.update({
    where: {
      id: sessionUser.id,
    },
    data: {
      username,
      bio: bio || null,
      avatarPlaceholder: avatarPlaceholder || null,
      isOnboarded: true,
    },
  });

  return NextResponse.redirect(new URL(next, request.url));
}
