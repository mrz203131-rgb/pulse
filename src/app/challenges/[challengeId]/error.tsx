"use client";

export default function ChallengeDetailError() {
  return (
    <section className="app-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-red-600">Challenge error</p>
      <h1 className="mt-2 font-display text-2xl text-slate-900">This challenge could not load</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Something broke while loading the challenge detail view. Refresh and try again.
      </p>
    </section>
  );
}
