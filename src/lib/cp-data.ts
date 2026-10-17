import { useEffect } from "react";
import { queryOptions, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const programsQuery = queryOptions({
  queryKey: ["cp", "programs"],
  queryFn: async () => (await supabase.from("programs").select("*").order("expires_at", { ascending: false })).data ?? [],
});
export const teamsQuery = queryOptions({
  queryKey: ["cp", "recon"],
  queryFn: async () => (await supabase.from("team_reconciliation").select("*").order("sort_order")).data ?? [],
});
export const ledgerTotalsQuery = queryOptions({
  queryKey: ["cp", "ledger"],
  queryFn: async () => (await supabase.from("issuer_ledger").select("program_id,team_id,amount_usd,entry_type")).data ?? [],
});
export const opsQuery = queryOptions({
  queryKey: ["cp", "ops"],
  queryFn: async () =>
    (await supabase.from("operations").select("*").order("created_at", { ascending: false }).order("idempotency_key").limit(200)).data ?? [],
});
export const runsQuery = queryOptions({
  queryKey: ["cp", "runs"],
  queryFn: async () => (await supabase.from("agent_runs").select("*").order("created_at", { ascending: false }).limit(500)).data ?? [],
});
export const demoStateQuery = queryOptions({
  queryKey: ["cp", "demo"],
  queryFn: async () => (await supabase.from("demo_state").select("agent_version,snapshot_at").eq("id", 1).single()).data,
});
export const eventsQuery = (opId?: string) =>
  queryOptions({
    queryKey: ["cp", "events", opId ?? "all"],
    queryFn: async () => {
      let q = supabase.from("allocation_events").select("*").order("id", { ascending: false }).limit(300);
      if (opId) q = q.eq("operation_id", opId);
      return (await q).data ?? [];
    },
  });

/** Subscribes to database changes and refreshes every JRR Token query (debounced). */
export function useLiveRefresh() {
  const qc = useQueryClient();
  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const bump = () => {
      clearTimeout(t);
      t = setTimeout(() => qc.invalidateQueries({ queryKey: ["cp"] }), 300);
    };
    const ch = supabase.channel("cp-live");
    for (const table of ["operations", "allocation_events", "issuer_ledger", "reservations", "agent_runs", "demo_state"]) {
      ch.on("postgres_changes", { event: "*", schema: "public", table }, bump);
    }
    ch.subscribe();
    return () => {
      clearTimeout(t);
      supabase.removeChannel(ch);
    };
  }, [qc]);
}

export const usd = (n: number | null | undefined) =>
  (Number(n ?? 0) < 0 ? "−$" : "$") + Math.abs(Number(n ?? 0)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
