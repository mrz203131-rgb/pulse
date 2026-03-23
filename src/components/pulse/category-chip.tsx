import type { Category } from "@/lib/mock-data";

type CategoryChipProps = {
  category: Category;
};

export function CategoryChip({ category }: CategoryChipProps) {
  return (
    <div
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-[0_10px_24px_rgba(15,23,42,0.07)]"
      style={{
        backgroundColor: category.background,
        color: category.foreground,
      }}
    >
      <span className="text-base">{category.emoji}</span>
      <span>{category.label}</span>
    </div>
  );
}
