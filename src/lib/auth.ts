import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "pulse_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export type SessionUser = Pick<
  User,
  "id" | "email" | "username" | "bio" | "avatarPlaceholder" | "isOnboarded" | "authProvider" | "providerUserId"
>;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const nextHash = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, "hex");

  if (originalBuffer.length !== nextHash.length) {
    return false;
  }

  return timingSafeEqual(originalBuffer, nextHash);
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createSessionToken() {
  return randomBytes(32).toString("hex");
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function createSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashToken(sessionToken),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashToken(sessionToken),
    },
    include: {
      user: true,
    },
  });

  if (!session || session.expiresAt.getTime() <= Date.now()) {
    cookieStore.delete(SESSION_COOKIE);

    if (session) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });
    }

    return null;
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      lastSeenAt: new Date(),
    },
  });

  return {
    id: session.user.id,
    email: session.user.email,
    username: session.user.username,
    bio: session.user.bio,
    avatarPlaceholder: session.user.avatarPlaceholder,
    isOnboarded: session.user.isOnboarded,
    authProvider: session.user.authProvider,
    providerUserId: session.user.providerUserId,
  };
}

export async function requireSessionUser(nextPath?: string) {
  const user = await getSessionUser();

  if (!user) {
    const loginUrl = new URL("/login", getBaseUrl());

    if (nextPath) {
      loginUrl.searchParams.set("next", nextPath);
    }

    redirect(loginUrl.pathname + loginUrl.search);
  }

  return user;
}

export async function requireOnboardedUser(nextPath?: string) {
  const user = await requireSessionUser(nextPath);

  if (!user.isOnboarded) {
    const onboardingUrl = new URL("/onboarding", getBaseUrl());

    if (nextPath) {
      onboardingUrl.searchParams.set("next", nextPath);
    }

    redirect(onboardingUrl.pathname + onboardingUrl.search);
  }

  return user;
}

export async function upsertUserFromExternalIdentity(input: {
  provider: string;
  providerUserId: string;
  email: string;
}) {
  const email = normalizeEmail(input.email);
  const existingUser =
    (await prisma.user.findUnique({
      where: {
        providerUserId: input.providerUserId,
      },
    })) ??
    (await prisma.user.findUnique({
      where: {
        email,
      },
    }));

  if (existingUser) {
    return prisma.user.update({
      where: {
        id: existingUser.id,
      },
      data: {
        email,
        authProvider: input.provider,
        providerUserId: input.providerUserId,
      },
    });
  }

  return prisma.user.create({
    data: {
      email,
      authProvider: input.provider,
      providerUserId: input.providerUserId,
      isOnboarded: false,
    },
  });
}

export async function createSessionForExternalIdentity(input: {
  provider: string;
  providerUserId: string;
  email: string;
}) {
  const user = await upsertUserFromExternalIdentity(input);
  await createSession(user.id);
  return user;
}
