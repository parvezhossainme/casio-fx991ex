"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONVERSION_CATEGORIES,
  convertUnits,
  findCategory,
} from "@/lib/constants/conversions";
import { formatNumberText } from "@/lib/engine";

export interface ConversionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsert: (value: number) => void;
}

export function ConversionsDialog({
  open,
  onOpenChange,
  onInsert,
}: ConversionsDialogProps) {
  const [categoryId, setCategoryId] = useState(CONVERSION_CATEGORIES[0]!.id);
  const [fromId, setFromId] = useState(CONVERSION_CATEGORIES[0]!.units[0]!.id);
  const [toId, setToId] = useState(CONVERSION_CATEGORIES[0]!.units[1]!.id);
  const [raw, setRaw] = useState("1");

  const category = findCategory(categoryId) ?? CONVERSION_CATEGORIES[0]!;

  const changeCategory = (id: string): void => {
    const next = findCategory(id) ?? CONVERSION_CATEGORIES[0]!;
    setCategoryId(next.id);
    setFromId(next.units[0]!.id);
    setToId((next.units[1] ?? next.units[0]!).id);
  };

  const value = Number(raw);
  const converted = Number.isNaN(value)
    ? null
    : convertUnits(value, categoryId, fromId, toId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Unit conversion</DialogTitle>
          <DialogDescription>
            Convert between units, then insert the result into the display.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <label className="block space-y-1">
            <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              Category
            </span>
            <select
              className="calc-slot"
              value={categoryId}
              onChange={(event) => changeCategory(event.target.value)}
              aria-label="Conversion category"
            >
              {CONVERSION_CATEGORIES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <label className="block flex-1 space-y-1">
              <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                From
              </span>
              <select
                className="calc-slot"
                value={fromId}
                onChange={(event) => setFromId(event.target.value)}
                aria-label="Convert from"
              >
                {category.units.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block flex-1 space-y-1">
              <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
                To
              </span>
              <select
                className="calc-slot"
                value={toId}
                onChange={(event) => setToId(event.target.value)}
                aria-label="Convert to"
              >
                {category.units.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
              Value
            </span>
            <input
              className="calc-slot"
              aria-label="Value to convert"
              inputMode="decimal"
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
            />
          </label>

          <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/[0.03] px-3 py-2">
            <span className="text-xs text-muted-foreground">Result</span>
            <span className="font-mono text-sm" data-testid="conversion-result">
              {converted === null ? "—" : formatNumberText(converted)}
            </span>
          </div>

          <Button
            type="button"
            size="sm"
            disabled={converted === null}
            onClick={() => {
              if (converted === null) return;
              onInsert(converted);
            }}
          >
            Insert result
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
