export default function DiscoverLoading() {
  return (
    <div className="space-y-6">
      <section className="app-card h-72 animate-pulse bg-[linear-gradient(135deg,rgba(255,117,92,0.14),rgba(255,255,255,0.92)_52%,rgba(72,195,177,0.16))] p-5" />
      <section className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="app-card h-72 animate-pulse bg-white/70" />
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="app-card h-80 animate-pulse bg-white/70" />
        ))}
      </section>
    </div>
  );
}
