import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, Stat, Empty, StatusPill } from "@/components/cp-ui";
import { programsQuery, teamsQuery, opsQuery, useLiveRefresh, usd } from "@/lib/cp-data";
import { createOperation, runAgent } from "@/lib/jrr.functions";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Team wallet · JRR Token" },
      { name: "description", content: "See a team's credit balance and return or request credits." },
      { property: "og:title", content: "Team wallet · JRR Token" },
      { property: "og:description", content: "Return unused credits or request more from the issuer pool." },
    ],
  }),
  component: Wallet,
});

function Wallet() {
  useLiveRefresh();
  const { data: programs = [] } = useQuery(programsQuery);
  const { data: teams = [] } = useQuery(teamsQuery);
  const { data: ops = [] } = useQuery(opsQuery);
  const program = programs.find((p) => p.name === "MONEY TALKS 2");
  const pTeams = teams.filter((t) => t.program_id === program?.id);
  const [teamId, setTeamId] = useState<string>("");
  const [amount, setAmount] = useState("50");
  const [busy, setBusy] = useState(false);
  const create = useServerFn(createOperation);
  const run = useServerFn(runAgent);

  const team = pTeams.find((t) => t.team_id === teamId) ?? pTeams[0];
  if (!program || !team)
    return (
      <>
        <PageHeader kicker="Participant" title="Team wallet" />
        <Empty>
          Seed the program first in <Link to="/demo" className="underline">Demo control</Link>.
        </Empty>
      </>
    );

  const bal = Number(team.ledger_balance);
  const avail = bal - Number(team.reserved);
  const mine = ops.filter((o) => o.from_team === team.team_id || o.to_team === team.team_id).slice(0, 10);

  async function submit(type: "return" | "reallocate") {
    const amt = Number(amount);
    if (!(amt > 0)) {
      toast.error("Enter an amount above zero");
      return;
    }
    setBusy(true);
    try {
      const op = await create({
        data: {
          programId: program!.id,
          type,
          fromTeam: type === "return" ? team!.team_id! : null,
          toTeam: type === "return" ? null : team!.team_id!,
          amount: amt,
          idempotencyKey: crypto.randomUUID(),
        },
      });
      toast.message(type === "return" ? "Return requested — agent is working" : "Request sent — agent is working");
      const res = await run({ data: { opId: op.id } });
      if (res.status === "reconciled") toast.success("Done and reconciled");
      else toast.error(`Agent result: ${res.status ?? res.outcome}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader kicker="Participant" title="Team wallet">
        <select
          className="panel num px-2 py-1.5 text-sm"
          value={team.team_id ?? ""}
          onChange={(e) => setTeamId(e.target.value)}
        >
          {pTeams.map((t) => (
            <option key={t.team_id} value={t.team_id!}>
              {t.name}
            </option>
          ))}
        </select>
      </PageHeader>
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Ledger balance" value={usd(bal)} tone={bal < 0 ? "bad" : undefined} />
        <Stat label="Available now" value={usd(avail)} />
        <Stat label="Cap" value={usd(team.per_team_cap_usd)} />
      </div>
      <div className="panel mt-6 flex flex-wrap items-end gap-3 p-4">
        <label className="grid gap-1">
          <span className="label-caps">Amount (USD)</span>
          <Input className="num w-36" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </label>
        <Button variant="outline" disabled={busy} onClick={() => submit("return")}>
          Return credits to issuer
        </Button>
        <Button disabled={busy || !team.eligible} onClick={() => submit("reallocate")}>
          Request credits from pool
        </Button>
        {!team.eligible && <span className="text-sm text-destructive">This team is not eligible to receive credit.</span>}
      </div>
      <h2 className="label-caps mt-8 mb-2">Recent operations</h2>
      <div className="panel divide-y">
        {mine.length === 0 && <div className="p-4 text-sm text-muted-foreground">None yet.</div>}
        {mine.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <span>{o.from_team === team.team_id ? (o.type === "return" ? "Returned" : "Sent") : "Received"}</span>
            <span className="num">{usd(o.amount_usd)}</span>
            <StatusPill status={o.status} />
          </div>
        ))}
      </div>
    </>
  );
}
