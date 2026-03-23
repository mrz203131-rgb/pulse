import { notFound } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ProfilePageContent } from "@/components/pulse/profile-page-content";
import { getProfileByUsername } from "@/lib/profiles";

type PublicProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const [{ username }, viewer] = await Promise.all([params, getSessionUser()]);
  const profile = await getProfileByUsername(username, viewer);

  if (!profile) {
    notFound();
  }

  return <ProfilePageContent profile={profile} viewerSignedIn={Boolean(viewer)} nextPath={`/u/${username}`} />;
}
