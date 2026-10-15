"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PHYSICAL_CONSTANTS } from "@/lib/constants/physical";
import { formatNumberText } from "@/lib/engine";

export interface ConstantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (value: number) => void;
}

export function ConstantsDialog({
  open,
  onOpenChange,
  onSelect,
}: ConstantsDialogProps) {
  const [query, setQuery] = useState("");

  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? PHYSICAL_CONSTANTS.filter((constant) =>
        `${constant.symbol} ${constant.label}`.toLowerCase().includes(needle),
      )
    : PHYSICAL_CONSTANTS;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scientific constants</DialogTitle>
          <DialogDescription>
            Select a constant to insert its value into the display.
          </DialogDescription>
        </DialogHeader>

        <input
          className="calc-slot"
          aria-label="Search constants"
          placeholder="Search…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <ul className="max-h-72 space-y-0.5 overflow-y-auto pr-1">
          {filtered.map((constant) => (
            <li key={constant.id}>
              <button
                type="button"
                onClick={() => onSelect(constant.value)}
                className="flex w-full items-baseline justify-between gap-3 rounded-md px-2 py-1.5 text-left hover:bg-white/5"
              >
                <span className="min-w-0 truncate">
                  <span className="font-mono text-sm">{constant.symbol}</span>{" "}
                  <span className="text-xs text-foreground/60">
                    {constant.label}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs text-foreground/60">
                  {formatNumberText(constant.value)}{" "}
                  <span className="opacity-70">{constant.unit}</span>
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="px-2 py-2 text-xs text-foreground/60">
              No matching constant.
            </li>
          ) : null}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
