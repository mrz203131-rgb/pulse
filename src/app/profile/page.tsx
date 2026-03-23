import Link from "next/link";
import { Users } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { EmptyState } from "@/components/pulse/empty-state";
import { ProfilePageContent } from "@/components/pulse/profile-page-content";
import { getProfileByUserId } from "@/lib/profiles";

export default async function ProfilePage() {
  const viewer = await getSessionUser();

  if (!viewer) {
    return (
      <EmptyState
        icon={<Users className="size-5" />}
        title="Sign in to see your profile"
        description="Your Pulse identity page, personal stats, and private profile layers appear once you log in."
        actionLabel="Log in"
      />
    );
  }

  const profile = await getProfileByUserId(viewer.id, viewer);

  return (
    <div className="space-y-6">
      {!viewer.username ? (
        <section className="app-card p-4 text-sm text-slate-600">
          Finish <Link href="/onboarding?next=%2Fprofile" className="font-semibold text-[var(--color-accent-strong)]">onboarding</Link> to unlock your public username route and followable profile.
        </section>
      ) : null}
      <ProfilePageContent profile={profile} viewerSignedIn={Boolean(viewer)} nextPath="/profile" />
    </div>
  );
}
