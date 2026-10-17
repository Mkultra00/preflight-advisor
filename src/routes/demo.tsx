import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Stat } from "@/components/cp-ui";
import { supabase } from "@/integrations/supabase/client";
import { demoStateQuery, opsQuery, useLiveRefresh } from "@/lib/cp-data";
import { seedDemo, snapshotLedger, resetLedger, insertBatch, setAgentVersion, runAgent } from "@/lib/jrr.functions";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo control · JRR Token" },
      { name: "description", content: "Seed sample data, snapshot and reset the ledger, and run the 60-operation batch." },
      { property: "og:title", content: "Demo control · JRR Token" },
      { property: "og:description", content: "Presenter controls for the v1 vs v2 agent demo." },
    ],
  }),
  component: Demo,
});

const PARALLEL = 4;

function Demo() {
  useLiveRefresh();
  const { data: state } = useQuery(demoStateQuery);
  const { data: ops = [] } = useQuery(opsQuery);
  const [busy, setBusy] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const seed = useServerFn(seedDemo);
  const snap = useServerFn(snapshotLedger);
  const reset = useServerFn(resetLedger);
  const batch = useServerFn(insertBatch);
  const setVer = useServerFn(setAgentVersion);
  const run = useServerFn(runAgent);

  const act = (label: string, f: () => Promise<unknown>) => async () => {
    setBusy(label);
    try {
      await f();
      toast.success(label + " done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(null);
    }
  };

  async function processQueue() {
    const { data } = await supabase.from("operations").select("id").eq("status", "requested").order("created_at").order("idempotency_key");
    const ids = (data ?? []).map((d) => d.id);
    let done = 0;
    setProgress({ done, total: ids.length });
    let next = 0;
    // 4 runners in parallel so concurrent-drain pairs really overlap
    await Promise.all(
      Array.from({ length: PARALLEL }, async () => {
        while (next < ids.length) {
          const id = ids[next++]!;
          try {
            await run({ data: { opId: id } });
          } catch {
            /* recorded as failed on the server */
          }
          setProgress({ done: ++done, total: ids.length });
        }
      }),
    );
  }

  const version = state?.agent_version ?? "v2";
  const count = (s: string) => ops.filter((o) => o.status === s).length;

  return (
    <>
      <PageHeader kicker="Presenter" title="Demo control" />
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Agent version" value={version} />
        <Stat label="Requested" value={count("requested")} />
        <Stat label="Reconciled" value={count("reconciled")} tone="good" />
        <Stat label="Flagged · failed" value={`${count("flagged")} · ${count("failed")}`} tone={count("failed") ? "bad" : undefined} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <section className="panel space-y-3 p-4">
          <h2 className="label-caps">1 · Data</h2>
          <p className="text-sm text-muted-foreground">
            12 teams with a $260 grant each, a $600 cap, one ineligible team, plus a second program that already expired. Sample data only.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button disabled={!!busy} onClick={act("Seed", () => seed())}>Seed sample data</Button>
            <Button variant="outline" disabled={!!busy} onClick={act("Snapshot", () => snap())}>Snapshot ledger</Button>
            <Button variant="outline" disabled={!!busy} onClick={act("Reset", () => reset())}>Reset to snapshot</Button>
          </div>
          <p className="num text-xs text-muted-foreground">
            Snapshot: {state?.snapshot_at ? new Date(state.snapshot_at).toLocaleString() : "none"}
          </p>
        </section>

        <section className="panel space-y-3 p-4">
          <h2 className="label-caps">2 · Agent version</h2>
          <p className="text-sm text-muted-foreground">
            v1 is deliberately naive: minimal prompt, optional reservation, no database checks. v2 fixes the order and the database enforces every rule.
          </p>
          <div className="flex gap-2">
            {(["v1", "v2"] as const).map((v) => (
              <Button key={v} variant={version === v ? "default" : "outline"} disabled={!!busy} onClick={act(`Switch to ${v}`, () => setVer({ data: { version: v } }))}>
                {v}
              </Button>
            ))}
          </div>
        </section>

        <section className="panel space-y-3 p-4 md:col-span-2">
          <h2 className="label-caps">3 · Batch</h2>
          <p className="text-sm text-muted-foreground">
            Inserts 60 operations (30 normal, 8 same-team drain pairs, 5 over-cap, 3 ineligible, 2 expired, 2 cross-program, 2 prompt-injection) on the current version, then runs the agent 4 at a time.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              disabled={!!busy}
              onClick={act(`Batch on ${version}`, async () => {
                await batch();
                await processQueue();
              })}
            >
              Run batch on {version}
            </Button>
            <Button variant="outline" disabled={!!busy} onClick={act("Process queue", processQueue)}>
              Process requested only
            </Button>
            {progress && (
              <span className="num text-sm">
                {progress.done}/{progress.total} processed
              </span>
            )}
          </div>
          {progress && (
            <div className="h-1.5 bg-muted">
              <div className="h-1.5 bg-primary transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
            </div>
          )}
        </section>
      </div>
    </>
  );
}
