"use client";

import { FolderPlus, Plus, Tags } from "lucide-react";
import { useState } from "react";

import { AddCategoryDialog } from "~/components/home/add-category-dialog";
import { AddGroupDialog } from "~/components/home/add-group-dialog";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { CategoryGroup } from "~/server/api/schemas/budget";

type AddTarget = "group" | "category";

export function AddBudgetItem({
  groups,
  onAddGroup,
  onAddCategory,
}: {
  groups: CategoryGroup[];
  onAddGroup: (name: string) => void;
  onAddCategory: (groupId: string, name: string) => void;
}) {
  const [target, setTarget] = useState<AddTarget | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) setTarget(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
          <Plus />
          Add
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={() => setTarget("group")}>
            <FolderPlus />
            Category group
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTarget("category")}>
            <Tags />
            Category
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddGroupDialog
        open={target === "group"}
        onOpenChange={handleOpenChange}
        onAddGroup={onAddGroup}
      />
      <AddCategoryDialog
        open={target === "category"}
        onOpenChange={handleOpenChange}
        groups={groups}
        onAddCategory={onAddCategory}
      />
    </>
  );
}
