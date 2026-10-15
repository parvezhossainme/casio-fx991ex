"use client";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MODES, type ModeId } from "@/types";

export interface ModeMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: ModeId;
  onSelect: (mode: ModeId) => void;
}

export function ModeMenu({
  open,
  onOpenChange,
  current,
  onSelect,
}: ModeMenuProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Mode</DialogTitle>
          <DialogDescription>
            Choose one of the twelve calculation modes. Each mode has its own
            workflow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2 sm:grid-cols-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              data-mode={mode.id}
              onClick={() => onSelect(mode.id)}
              aria-current={current === mode.id ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-left transition-colors hover:bg-white/[0.08]",
                current === mode.id && "border-sky-400/70 bg-sky-400/10",
              )}
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-white/10 font-mono text-xs font-semibold">
                {mode.index}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {mode.name}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {mode.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
