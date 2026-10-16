"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
  addCategoryGroupInput,
  type AddCategoryGroupInput,
} from "~/server/api/schemas/budget";

export function AddGroupDialog({
  open,
  onOpenChange,
  onAddGroup,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddGroup: (name: string) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCategoryGroupInput>({
    resolver: zodResolver(addCategoryGroupInput),
    defaultValues: { name: "" },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const onSubmit = handleSubmit((data) => {
    onAddGroup(data.name);
    handleOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
              placeholder="e.g. Fun money"
              aria-invalid={!!errors.name}
              autoFocus
              {...register("name")}
            />
            <FieldError errors={[errors.name]} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              Cancel
            </DialogClose>
            <Button type="submit">Add group</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
