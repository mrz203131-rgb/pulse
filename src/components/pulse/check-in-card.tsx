import Link from "next/link";
import { CalendarDays, Heart } from "lucide-react";
import type { CheckInCardData } from "@/lib/check-ins";

type CheckInCardProps = {
  checkIn: CheckInCardData;
  nextPath?: string;
};

export function CheckInCard({ checkIn, nextPath = "/" }: CheckInCardProps) {
  const displayName = checkIn.user.username ?? checkIn.user.email;
  const dateLabel = new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(checkIn.checkInDate);
  const profileHref = checkIn.user.username ? `/u/${checkIn.user.username}` : undefined;

  return (
    <article className="app-card overflow-hidden p-0">
      <div
        className="h-56 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.04), rgba(15,23,42,0.28)), url(${checkIn.imageUrl})`,
        }}
      />
      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-accent-strong),#ffb06a)] text-sm font-bold text-white">
                {checkIn.user.avatarPlaceholder ?? displayName.slice(0, 1).toUpperCase()}
              </div>
              <div>
                {profileHref ? (
                  <Link href={profileHref} className="text-sm font-semibold text-slate-900">
                    {displayName}
                  </Link>
                ) : (
                  <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                )}
                <Link href={`/challenges/${checkIn.challenge.id}`} className="text-xs font-medium text-[var(--color-accent-strong)]">
                  {checkIn.challenge.title}
                </Link>
              </div>
            </div>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {checkIn.challenge.category}
          </div>
        </div>
        <p className="text-sm leading-6 text-slate-700">{checkIn.caption}</p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays className="size-4" />
            <span>{dateLabel}</span>
          </div>
          <form action="/api/check-ins/like" method="post">
            <input type="hidden" name="checkInId" value={checkIn.id} />
            <input type="hidden" name="next" value={nextPath} />
            <button
              type="submit"
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold ${
                checkIn.viewerHasLiked
                  ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-strong)]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Heart className={`size-4 ${checkIn.viewerHasLiked ? "fill-current" : ""}`} />
              {checkIn.likeCount} {checkIn.likeCount === 1 ? "cheer" : "cheers"}
            </button>
          </form>
        </div>
      </div>
    </article>
  );
}
