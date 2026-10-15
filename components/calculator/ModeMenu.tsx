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
        {/* `cx-dialog-scroll` caps the list to the viewport so every mode stays reachable on a
            phone, instead of the tail being clipped by the chamfered frame. */}
        <div className="cx-dialog-scroll grid gap-2 pr-1 sm:grid-cols-2">
          {MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              data-mode={mode.id}
              onClick={() => onSelect(mode.id)}
              aria-current={current === mode.id ? "true" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-sm border border-border bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-[var(--neon-cyan)]/50 hover:bg-white/[0.06] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--neon-green)]",
                current === mode.id &&
                  "border-[var(--neon-green)] bg-[var(--neon-green)]/10 shadow-[var(--glow-green)]",
              )}
            >
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-sm border border-border font-mono text-xs font-semibold text-foreground/60",
                  current === mode.id &&
                    "border-[var(--neon-green)]/60 text-[var(--neon-green)]",
                )}
              >
                {mode.index}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {mode.name}
                </span>
                <span className="block text-xs leading-snug text-foreground/60">
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
