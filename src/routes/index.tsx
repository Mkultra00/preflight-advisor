import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Stat, Empty } from "@/components/cp-ui";
import { programsQuery, teamsQuery, ledgerTotalsQuery, useLiveRefresh, usd } from "@/lib/cp-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Program console · JRR Token" },
      { name: "description", content: "Budget, caps, expiry and team balances for the MONEY TALKS 2 credit program." },
      { property: "og:title", content: "Program console · JRR Token" },
      { property: "og:description", content: "Issuer view of credit budget, caps and team balances." },
    ],
  }),
  component: ProgramConsole,
});

function ProgramConsole() {
  useLiveRefresh();
  const { data: programs = [] } = useQuery(programsQuery);
  const { data: teams = [] } = useQuery(teamsQuery);
  const { data: ledger = [] } = useQuery(ledgerTotalsQuery);

  if (!programs.length)
    return (
      <>
        <PageHeader kicker="Issuer admin" title="Program console" />
        <Empty>
          No program yet. Open <Link to="/demo" className="underline">Demo control</Link> and press Seed sample data.
        </Empty>
      </>
    );

  return (
    <>
      <PageHeader kicker="Issuer admin" title="Program console" />
      <div className="space-y-10">
        {programs.map((p) => {
          const rows = ledger.filter((l) => l.program_id === p.id);
          const total = rows.reduce((s, l) => s + Number(l.amount_usd), 0);
          const pool = rows.filter((l) => l.team_id === null).reduce((s, l) => s + Number(l.amount_usd), 0);
          const expired = new Date(p.expires_at) < new Date();
          const pTeams = teams.filter((t) => t.program_id === p.id);
          return (
            <section key={p.id}>
              <div className="mb-3 flex flex-wrap items-baseline gap-3">
                <h2 className="text-xl font-bold">{p.name}</h2>
                <span className="label-caps">{p.issuer}</span>
                {expired && <span className="num rounded-sm bg-destructive px-1.5 text-xs text-destructive-foreground">EXPIRED</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <Stat label="Budget" value={usd(p.total_budget_usd)} />
                <Stat label="On ledger" value={usd(total)} tone={total > Number(p.total_budget_usd) ? "bad" : undefined} />
                <Stat label="Issuer pool" value={usd(pool)} />
                <Stat label="Per-team cap" value={usd(p.per_team_cap_usd)} />
                <Stat label="Expires" value={<span className="text-base">{new Date(p.expires_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</span>} />
              </div>
              <div className="panel mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="label-caps p-2">Team</th>
                      <th className="label-caps p-2">Eligible</th>
                      <th className="label-caps p-2 text-right">Balance</th>
                      <th className="label-caps p-2 text-right">Reserved</th>
                      <th className="label-caps p-2 text-right">Available</th>
                      <th className="label-caps p-2">Cap use</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pTeams.map((t) => {
                      const bal = Number(t.ledger_balance);
                      const pct = Math.max(0, Math.min(100, (bal / Number(p.per_team_cap_usd)) * 100));
                      return (
                        <tr key={t.team_id} className="border-b last:border-0">
                          <td className="p-2 font-medium">{t.name}</td>
                          <td className="p-2">{t.eligible ? "yes" : <span className="text-destructive">no</span>}</td>
                          <td className={`num p-2 text-right ${bal < 0 ? "text-destructive" : ""}`}>{usd(bal)}</td>
                          <td className="num p-2 text-right text-muted-foreground">{usd(t.reserved)}</td>
                          <td className="num p-2 text-right">{usd(bal - Number(t.reserved))}</td>
                          <td className="w-40 p-2">
                            <div className="h-1.5 bg-muted">
                              <div className={`h-1.5 ${bal > Number(p.per_team_cap_usd) ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}
