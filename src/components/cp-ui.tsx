import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  requested: "bg-muted text-muted-foreground",
  processing: "bg-warning text-warning-foreground",
  reserved: "bg-warning text-warning-foreground",
  applied: "bg-accent text-accent-foreground",
  reconciled: "bg-success text-success-foreground",
  failed: "bg-destructive text-destructive-foreground",
  flagged: "bg-ink text-ink-foreground",
  ok: "bg-success text-success-foreground",
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={cn("num inline-block rounded-sm px-1.5 py-0.5 text-[0.68rem] uppercase tracking-wider", statusTone[status] ?? "bg-muted")}>
      {status}
    </span>
  );
}

export function PageHeader({ kicker, title, children }: { kicker: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-foreground pb-4">
      <div>
        <div className="label-caps">{kicker}</div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: "bad" | "good" | undefined }) {
  return (
    <div className="panel p-4">
      <div className="label-caps">{label}</div>
      <div className={cn("num mt-1 text-2xl font-semibold", tone === "bad" && "text-destructive", tone === "good" && "text-success")}>{value}</div>
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="panel p-8 text-center text-sm text-muted-foreground">{children}</div>;
}
