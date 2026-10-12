"use client";

import { FolderPlus, Plus, Tags } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { CategoryGroup } from "~/lib/mock-budget";

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
  const [groupName, setGroupName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [parentGroupId, setParentGroupId] = useState<string | null>(null);

  const close = () => setTarget(null);

  const reset = () => {
    setGroupName("");
    setCategoryName("");
    setParentGroupId(null);
  };

  const handleGroupSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = groupName.trim();
    if (!name) return;
    onAddGroup(name);
    reset();
    close();
  };

  const handleCategorySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const name = categoryName.trim();
    if (!name || !parentGroupId) return;
    onAddCategory(parentGroupId, name);
    reset();
    close();
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

      <Dialog
        open={target === "group"}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent>
          <form onSubmit={handleGroupSubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>New category group</DialogTitle>
              <DialogDescription>
                Group related categories together, like Needs or Wants.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label htmlFor="group-name">Name</Label>
              <Input
                id="group-name"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder="e.g. Fun money"
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" disabled={!groupName.trim()}>
                Add group
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={target === "category"}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent>
          <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle>New category</DialogTitle>
              <DialogDescription>
                Pick the parent group and give the category a name.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2">
              <Label>Parent group</Label>
              <Select
                value={parentGroupId}
                onValueChange={(value) => setParentGroupId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string | null) =>
                      value
                        ? (groups.find((group) => group.id === value)?.name ??
                          "Select a group")
                        : "Select a group"
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent align="start">
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
                placeholder="e.g. Coffee"
              />
            </div>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancel
              </DialogClose>
              <Button
                type="submit"
                disabled={!categoryName.trim() || !parentGroupId}
              >
                Add category
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
