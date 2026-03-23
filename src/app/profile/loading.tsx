export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <section className="app-card h-64 animate-pulse bg-white/80" />
      <section className="app-card h-56 animate-pulse bg-white/80" />
      <section className="grid grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="aspect-square animate-pulse rounded-[26px] bg-white/80" />
        ))}
      </section>
      <section className="app-card h-72 animate-pulse bg-white/80" />
    </div>
  );
}
