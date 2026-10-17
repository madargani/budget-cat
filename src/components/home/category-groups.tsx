"use client";

import { CategoryCard } from "~/components/home/category-card";
import type { CategoryGroup } from "~/server/trpc/schemas/budget";

export function CategoryGroups({ groups }: { groups: CategoryGroup[] }) {
  return (
    <section className="flex flex-col gap-5 px-4">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {group.name}
          </h2>
          <div className="flex flex-col gap-2">
            {group.categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}