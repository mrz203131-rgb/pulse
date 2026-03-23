export default function ChallengeDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="h-56 animate-pulse rounded-[32px] bg-white/70" />
      <div className="app-card space-y-4 p-5">
        <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-8 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-4 animate-pulse rounded-full bg-slate-200" />
          <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
