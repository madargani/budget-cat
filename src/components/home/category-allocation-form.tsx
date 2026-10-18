"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Minus, Plus } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "~/components/ui/button";
import { FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { formatCurrency, formatMonth } from "~/lib/format";
import {
  allocationAmountInput,
  type AllocationAmountInput,
} from "~/server/trpc/schemas/budget";

const STEP = 10;

/**
 * The "how much is this category budgeted" editor inside the category detail
 * sheet. Holds a local draft so half-typed values aren't written on every
 * keystroke, and commits on an explicit Save.
 *
 * `allocated` is seeded whenever it changes from outside (the server response
 * landing, or the copy action filling it in), but only while the field is
 * untouched — re-seeding over an in-progress edit would wipe the user's
 * typing mid-keystroke.
 */
export function CategoryAllocationForm({
  allocated,
  previousMonth,
  previousRemaining,
  isSaving,
  isCopying,
  onSave,
  onCopy,
}: {
  allocated: number;
  previousMonth: { year: number; month: number } | null;
  previousRemaining: number;
  isSaving: boolean;
  isCopying: boolean;
  onSave: (amount: number) => void;
  onCopy: () => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<AllocationAmountInput>({
    resolver: zodResolver(allocationAmountInput),
    defaultValues: { amount: allocated },
  });

  const amount = watch("amount");
  const current = Number.isFinite(amount) ? amount : 0;

  useEffect(() => {
    if (!isDirty) {
      reset({ amount: allocated });
    }
  }, [allocated, isDirty, reset]);

  const step = (delta: number) => {
    // Clamp at zero rather than letting the user allocate a negative budget.
    setValue("amount", Math.max(0, Math.round(current) + delta), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const onSubmit = handleSubmit((data) => {
    onSave(data.amount);
    // The optimistic write has already rendered this value, so drop the dirty
    // flag rather than leaving Save enabled for a no-op resubmit.
    reset({ amount: data.amount });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <label htmlFor="allocation-amount" className="text-sm font-medium">
          Amount allocated
        </label>
        <p className="text-muted-foreground text-xs tabular-nums">
          {formatCurrency(current)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Decrease by ${STEP}`}
          disabled={current <= 0}
          onClick={() => step(-STEP)}
        >
          <Minus />
        </Button>
        <div className="relative flex-1">
          <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm">
            $
          </span>
          <Input
            id="allocation-amount"
            type="number"
            inputMode="decimal"
            step={STEP}
            min={0}
            className="pl-7 text-center font-medium tabular-nums"
            aria-invalid={!!errors.amount}
            {...register("amount", { valueAsNumber: true })}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Increase by ${STEP}`}
          onClick={() => step(STEP)}
        >
          <Plus />
        </Button>
      </div>

      <FieldError errors={[errors.amount]} />

      <div className="flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          className="flex-1"
          disabled={isSaving || !isDirty}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>

        {previousMonth && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isCopying}
            onClick={onCopy}
            className="text-muted-foreground shrink-0 font-normal"
          >
            {isCopying
              ? "Copying…"
              : `${formatCurrency(previousRemaining)} left over in ${formatMonth(previousMonth)}`}
          </Button>
        )}
      </div>
    </form>
  );
}
