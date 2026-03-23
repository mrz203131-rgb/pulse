"use client";

import { useState, useTransition } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { challengeCategoryOptions } from "@/lib/challenge-config";

type DiscoverControlsProps = {
  initialQuery: string;
  initialCategory: string;
};

export function DiscoverControls({ initialQuery, initialCategory }: DiscoverControlsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function applyFilters(nextQuery: string, nextCategory: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery.trim()) {
      params.set("q", nextQuery.trim());
    } else {
      params.delete("q");
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    } else {
      params.delete("category");
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

    startTransition(() => {
      router.replace(nextUrl, { scroll: false });
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentCategory = searchParams.get("category") ?? initialCategory;
    applyFilters(query, currentCategory);
  }

  function handleCategorySelect(category: string) {
    const currentCategory = searchParams.get("category") ?? initialCategory;
    const nextCategory = currentCategory === category ? "" : category;
    applyFilters(query, nextCategory);
  }

  function clearFilters() {
    setQuery("");
    applyFilters("", "");
  }

  const activeCategory = searchParams.get("category") ?? initialCategory;
  const hasActiveFilters = Boolean((searchParams.get("q") ?? initialQuery).trim() || activeCategory);

  return (
    <section className="app-card overflow-hidden p-0">
      <div className="bg-[linear-gradient(135deg,rgba(255,117,92,0.16),rgba(255,255,255,0.92)_52%,rgba(72,195,177,0.18))] p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-accent-strong)]">
              Discover
            </p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-slate-900">Find the challenge that fits tonight</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Search public challenges by title, category, or creator and keep the browse flow light.
            </p>
          </div>
          <div className="rounded-3xl bg-white/80 p-3 text-[var(--color-accent-strong)] shadow-[0_18px_40px_rgba(255,117,92,0.16)]">
            <SlidersHorizontal className="size-5" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <label className="flex items-center gap-3 rounded-[28px] border border-white/70 bg-white/90 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.06)]">
            <Search className="size-5 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, category, or creator"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            {challengeCategoryOptions.map((category) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "bg-white/80 text-slate-600 shadow-[0_10px_24px_rgba(15,23,42,0.06)]"
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              {isPending ? "Updating..." : "Apply filters"}
            </button>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-3 text-sm font-semibold text-slate-600"
              >
                <X className="size-4" />
                Clear
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
