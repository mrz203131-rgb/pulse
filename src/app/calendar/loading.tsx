export default function CalendarLoading() {
  return (
    <div className="space-y-6">
      <section className="app-card h-56 animate-pulse bg-[linear-gradient(160deg,rgba(72,195,177,0.2),rgba(255,255,255,0.92)_55%,rgba(255,203,112,0.2))] p-5" />
      <section className="app-card h-[420px] animate-pulse bg-white/80" />
      <section className="grid gap-4">
        <div className="app-card h-64 animate-pulse bg-white/80" />
        <div className="app-card h-64 animate-pulse bg-white/80" />
      </section>
    </div>
  );
}
