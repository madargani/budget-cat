"use client";

import { api, type RouterOutputs } from "~/trpc/react";

type BudgetOverview = RouterOutputs["budget"]["getHome"];

const createTempId = () => `temp-${crypto.randomUUID()}`;

/**
 * Owns all budget data logic for the home screen: the `getHome` query plus the
 * add-group / add-category mutations with optimistic cache updates.
 *
 * Optimistic strategy per mutation:
 * 1. Cancel in-flight refetches so they can't clobber the optimistic write.
 * 2. Snapshot the current cache and append a temp record.
 * 3. On success, swap the temp id for the persisted record.
 * 4. On error, roll back to the snapshot.
 * 5. Refetch (`invalidate`) to converge with the server.
 */
export function useBudget() {
  const utils = api.useUtils();

  const { data: budget, isLoading, isError } = api.budget.getHome.useQuery();

  const rollback = (
    _error: unknown,
    _input: unknown,
    context?: { previous?: BudgetOverview },
  ) => {
    if (context?.previous) {
      utils.budget.getHome.setData(undefined, context.previous);
    }
  };

  const invalidateHome = async () => {
    await utils.budget.getHome.invalidate();
  };

  const addGroupMutation = api.budget.addCategoryGroup.useMutation({
    onMutate: async (input) => {
      await utils.budget.getHome.cancel();

      const previous = utils.budget.getHome.getData();
      const tempId = createTempId();

      utils.budget.getHome.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          groups: [
            ...old.groups,
            { id: tempId, name: input.name, categories: [] },
          ],
        };
      });

      return { previous, tempId };
    },
    onSuccess: (created, _input, context) => {
      if (!context) return;
      utils.budget.getHome.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          groups: old.groups.map((group) =>
            group.id === context.tempId
              ? {
                  id: created.id,
                  name: created.name,
                  categories: group.categories,
                }
              : group,
          ),
        };
      });
    },
    onError: rollback,
    onSettled: invalidateHome,
  });

  const addCategoryMutation = api.budget.addCategory.useMutation({
    onMutate: async (input) => {
      await utils.budget.getHome.cancel();

      const previous = utils.budget.getHome.getData();
      const tempId = createTempId();

      utils.budget.getHome.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          groups: old.groups.map((group) =>
            group.id === input.groupId
              ? {
                  ...group,
                  categories: [
                    ...group.categories,
                    { id: tempId, name: input.name, allocated: 0, spent: 0 },
                  ],
                }
              : group,
          ),
        };
      });

      return { previous, tempId };
    },
    onSuccess: (created, _input, context) => {
      if (!context) return;
      utils.budget.getHome.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          groups: old.groups.map((group) =>
            group.id === created.groupId
              ? {
                  ...group,
                  categories: group.categories.map((category) =>
                    category.id === context.tempId
                      ? {
                          id: created.id,
                          name: created.name,
                          allocated: 0,
                          spent: 0,
                        }
                      : category,
                  ),
                }
              : group,
          ),
        };
      });
    },
    onError: rollback,
    onSettled: invalidateHome,
  });

  return {
    budget,
    isLoading,
    isError,
    addGroup: (name: string) => addGroupMutation.mutate({ name }),
    addCategory: (groupId: string, name: string) =>
      addCategoryMutation.mutate({ groupId, name }),
  };
}
