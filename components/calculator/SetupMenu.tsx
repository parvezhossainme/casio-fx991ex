"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { AngleUnit, DisplayFormat } from "@/lib/engine";

const ANGLE_UNITS: AngleUnit[] = ["DEG", "RAD", "GRA"];

const FORMATS: { label: string; value: DisplayFormat }[] = [
  { label: "Norm 1", value: { mode: "norm", which: 1 } },
  { label: "Norm 2", value: { mode: "norm", which: 2 } },
  { label: "Fix 2", value: { mode: "fix", digits: 2 } },
  { label: "Fix 4", value: { mode: "fix", digits: 4 } },
  { label: "Sci 4", value: { mode: "sci", digits: 4 } },
  { label: "Eng", value: { mode: "eng" } },
];

function formatKey(format: DisplayFormat): string {
  if (format.mode === "norm") return `norm${format.which}`;
  if (format.mode === "fix") return `fix${format.digits}`;
  if (format.mode === "sci") return `sci${format.digits}`;
  return "eng";
}

export interface SetupMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  angleUnit: AngleUnit;
  format: DisplayFormat;
  insertMode: boolean;
  onAngleUnit: (unit: AngleUnit) => void;
  onFormat: (format: DisplayFormat) => void;
  onInsertMode: (insert: boolean) => void;
  onClearHistory: () => void;
}

export function SetupMenu({
  open,
  onOpenChange,
  angleUnit,
  format,
  insertMode,
  onAngleUnit,
  onFormat,
  onInsertMode,
  onClearHistory,
}: SetupMenuProps) {
  const activeFormat = formatKey(format);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Setup</DialogTitle>
          <DialogDescription>
            Input, display and angle settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Angle unit</Label>
            <div className="flex gap-2">
              {ANGLE_UNITS.map((unit) => (
                <Button
                  key={unit}
                  type="button"
                  variant={angleUnit === unit ? "default" : "outline"}
                  size="sm"
                  onClick={() => onAngleUnit(unit)}
                >
                  {unit}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Number format</Label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((entry) => (
                <Button
                  key={entry.label}
                  type="button"
                  variant={
                    activeFormat === formatKey(entry.value)
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => onFormat(entry.value)}
                >
                  {entry.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="insert-mode">Insert mode</Label>
            <Switch
              id="insert-mode"
              checked={insertMode}
              onCheckedChange={onInsertMode}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Calculation history</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearHistory}
            >
              Clear history
            </Button>
          </div>

          <p className={cn("text-xs text-muted-foreground")}>
            Settings and history are stored in your browser only. Nothing is
            sent to a server.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
