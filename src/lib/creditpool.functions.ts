import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Demo-mode app: no sign-in. All writes go through these server functions,
// which call locked-down database functions.
async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return supabaseAdmin as any;
}
async function rpc(name: string) {
  const db = await admin();
  const { data, error } = await db.rpc(name);
  if (error) throw new Error(error.message);
  return data;
}

export const seedDemo = createServerFn({ method: "POST" }).handler(() => rpc("demo_seed"));
export const snapshotLedger = createServerFn({ method: "POST" }).handler(() => rpc("demo_snapshot"));
export const resetLedger = createServerFn({ method: "POST" }).handler(() => rpc("demo_reset"));
export const insertBatch = createServerFn({ method: "POST" }).handler(() => rpc("demo_insert_batch"));

export const setAgentVersion = createServerFn({ method: "POST" })
  .inputValidator(z.object({ version: z.enum(["v1", "v2"]) }))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("demo_state").update({ agent_version: data.version }).eq("id", 1);
    return { ok: true };
  });

export const createOperation = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      programId: z.string().uuid(),
      type: z.enum(["return", "reallocate"]),
      fromTeam: z.string().uuid().nullable(),
      toTeam: z.string().uuid().nullable(),
      amount: z.number().positive().max(100000),
      idempotencyKey: z.string().min(8).max(100),
    }),
  )
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: existing } = await db.from("operations").select("id").eq("idempotency_key", data.idempotencyKey).maybeSingle();
    if (existing) return { id: existing.id as string, replay: true };
    const { data: st } = await db.from("demo_state").select("agent_version").eq("id", 1).single();
    const { data: row, error } = await db
      .from("operations")
      .insert({
        program_id: data.programId,
        type: data.type,
        from_team: data.fromTeam,
        to_team: data.toTeam,
        amount_usd: data.amount,
        idempotency_key: data.idempotencyKey,
        agent_version: st?.agent_version ?? "v2",
        scenario: "manual",
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await db.from("allocation_events").insert({ operation_id: row.id, step: "requested", actor: "admin", payload: data });
    return { id: row.id as string, replay: false };
  });

export const runAgent = createServerFn({ method: "POST" })
  .inputValidator(z.object({ opId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { processOperation } = await import("./agent.server");
    return processOperation(data.opId);
  });
