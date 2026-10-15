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
      className="cx-cut p-4 [--cut:0.7rem] [--surface:#0f0f18]"
      aria-label={`${title} mode`}
      data-testid="mode-panel"
    >
      <header className="mb-4 border-b border-border/70 pb-2">
        <h2 className="font-display text-sm font-semibold tracking-[0.16em] text-[var(--neon-cyan)] uppercase">
          {title}
        </h2>
        <p className="mt-1 font-label text-[0.7rem] text-foreground/60">
          {subtitle}
        </p>
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
      <span className="block font-label text-[0.62rem] tracking-[0.16em] text-foreground/60 uppercase">
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
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1 last:border-b-0">
      <span className="font-label text-[0.66rem] tracking-[0.12em] text-foreground/60 uppercase">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

export function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      className="mt-3 border border-[var(--neon-red)]/40 bg-[var(--neon-red)]/10 px-2 py-1 font-label text-[0.7rem] tracking-[0.08em] text-[var(--neon-red)] uppercase"
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
