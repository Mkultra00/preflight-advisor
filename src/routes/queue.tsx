import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Empty, StatusPill } from "@/components/cp-ui";
import { opsQuery, teamsQuery, runsQuery, eventsQuery, useLiveRefresh, usd } from "@/lib/cp-data";
import { runAgent } from "@/lib/jrr.functions";

export const Route = createFileRoute("/queue")({
  head: () => ({
    meta: [
      { title: "Operations queue · JRR Token" },
      { name: "description", content: "Live list of credit moves and what the agent did with each." },
      { property: "og:title", content: "Operations queue · JRR Token" },
      { property: "og:description", content: "Live operations with status, agent version and tool steps." },
    ],
  }),
  component: Queue,
});

function Steps({ opId }: { opId: string }) {
  const { data = [] } = useQuery(eventsQuery(opId));
  return (
    <ol className="num space-y-1 p-3 text-xs">
      {[...data].reverse().map((e, i) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = e.payload as any;
        return (
          <li key={e.id} className="flex gap-3">
            <span className="w-5 text-muted-foreground">{i + 1}</span>
            <span className={`w-44 shrink-0 ${p?.error ? "text-destructive" : ""}`}>{e.step}</span>
            <span className="truncate text-muted-foreground">{JSON.stringify(p?.error ?? p?.result ?? p).slice(0, 160)}</span>
          </li>
        );
      })}
    </ol>
  );
}

function Queue() {
  useLiveRefresh();
  const { data: ops = [] } = useQuery(opsQuery);
  const { data: teams = [] } = useQuery(teamsQuery);
  const { data: runs = [] } = useQuery(runsQuery);
  const [open, setOpen] = useState<string | null>(null);
  const run = useServerFn(runAgent);
  const name = (id: string | null) => (id ? teams.find((t) => t.team_id === id)?.name ?? id.slice(0, 6) : "Issuer pool");

  return (
    <>
      <PageHeader kicker="Admin · live" title="Operations queue">
        <span className="label-caps">{ops.length} shown</span>
      </PageHeader>
      {ops.length === 0 ? (
        <Empty>No operations yet. Use the wallet, or run a batch from Demo control.</Empty>
      ) : (
        <div className="panel overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                {["Status", "Ver", "Scenario", "From → To", "Amount", "Steps", "Error", ""].map((h) => (
                  <th key={h} className="label-caps p-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ops.map((o) => {
                const r = runs.find((x) => x.operation_id === o.id);
                return (
                  <Fragment key={o.id}>
                    <tr className="row-flash cursor-pointer border-b hover:bg-muted" onClick={() => setOpen(open === o.id ? null : o.id)}>
                      <td className="p-2"><StatusPill status={o.status} /></td>
                      <td className="num p-2">{o.agent_version}</td>
                      <td className="p-2 text-muted-foreground">{o.scenario}</td>
                      <td className="p-2">{name(o.from_team)} → {name(o.to_team)}</td>
                      <td className="num p-2 text-right">{usd(o.amount_usd)}</td>
                      <td className="num p-2 text-right">{r?.tool_calls ?? "—"}</td>
                      <td className="num max-w-48 truncate p-2 text-xs text-destructive">{o.error_code ?? r?.error_code ?? ""}</td>
                      <td className="p-2 text-right">
                        {o.prism_session_id && (
                          <span className="label-caps mr-2 text-success" title={`PRISM session ${o.prism_session_id}`}>
                            PRISM ✓
                          </span>
                        )}
                        {o.status === "requested" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await run({ data: { opId: o.id } });
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Failed");
                              }
                            }}
                          >
                            Run
                          </Button>
                        )}
                      </td>
                    </tr>
                    {open === o.id && (
                      <tr className="border-b bg-muted">
                        <td colSpan={8}>
                          {o.note && <div className="p-3 pb-0 text-xs text-destructive">Note (untrusted): {o.note}</div>}
                          <Steps opId={o.id} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
