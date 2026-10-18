"use client";

import { CategoryCard } from "~/components/home/category-card";
import type {
  BudgetCategory,
  CategoryGroup,
} from "~/server/trpc/schemas/budget";

export function CategoryGroups({
  groups,
  onSelectCategory,
}: {
  groups: CategoryGroup[];
  onSelectCategory?: (category: BudgetCategory) => void;
}) {
  return (
    <section className="flex flex-col gap-5 px-4">
      {groups.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <h2 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
            {group.name}
          </h2>
          <div className="flex flex-col gap-2">
            {group.categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onSelect={
                  onSelectCategory
                    ? () => onSelectCategory(category)
                    : undefined
                }
              />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
