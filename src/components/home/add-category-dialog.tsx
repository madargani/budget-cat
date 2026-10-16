"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

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
import { FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  addCategoryInput,
  type AddCategoryInput,
  type CategoryGroup,
} from "~/server/api/schemas/budget";

export function AddCategoryDialog({
  open,
  onOpenChange,
  groups,
  onAddCategory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: CategoryGroup[];
  onAddCategory: (groupId: string, name: string) => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCategoryInput>({
    resolver: zodResolver(addCategoryInput),
    defaultValues: { groupId: "", name: "" },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit((data) => {
    onAddCategory(data.groupId, data.name);
    handleOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>
              Pick the parent group and give the category a name.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label>Parent group</Label>
            <Controller
              control={control}
              name="groupId"
              render={({ field }) => (
                <Select
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                >
                  <SelectTrigger
                    className="w-full"
                    aria-invalid={!!errors.groupId}
                  >
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
              )}
            />
            <FieldError errors={[errors.groupId]} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category-name">Name</Label>
            <Input
              id="category-name"
              placeholder="e.g. Coffee"
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Add category</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
