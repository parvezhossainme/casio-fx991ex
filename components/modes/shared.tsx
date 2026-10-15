"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ModePanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section
      className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
      aria-label={`${title} mode`}
      data-testid="mode-panel"
    >
      <header className="mb-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1", className)}>
      <span className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

export function SlotInput({
  label,
  name,
  placeholder,
  className,
  defaultValue,
}: {
  label: string;
  name?: string;
  placeholder?: string;
  className?: string;
  defaultValue?: string;
}) {
  return (
    <input
      className={cn("calc-slot", className)}
      aria-label={label}
      name={name}
      placeholder={placeholder}
      defaultValue={defaultValue}
      inputMode="text"
      autoComplete="off"
      spellCheck={false}
    />
  );
}

export function ResultRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-white/5 py-1 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-mono text-sm">{value}</span>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      className="mt-3 rounded-md bg-red-500/10 px-2 py-1 text-xs text-red-300"
      role="alert"
    >
      {message}
    </p>
  );
}

export function RunButton({
  children = "Execute",
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button type="button" size="sm" {...props}>
      {children}
    </Button>
  );
}
