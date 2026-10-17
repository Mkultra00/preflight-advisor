import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, Stat, Empty } from "@/components/cp-ui";
import { teamsQuery, runsQuery, useLiveRefresh, usd } from "@/lib/cp-data";

export const Route = createFileRoute("/reconcile")({
  head: () => ({
    meta: [
      { title: "Reconciliation · JRR Token" },
      { name: "description", content: "Issuer ledger compared with approved operations, mismatches in red." },
      { property: "og:title", content: "Reconciliation · JRR Token" },
      { property: "og:description", content: "Ledger vs operations, with every mismatch highlighted." },
    ],
  }),
  component: Reconcile,
});

function Reconcile() {
  useLiveRefresh();
  const { data: teams = [] } = useQuery(teamsQuery);
  const { data: runs = [] } = useQuery(runsQuery);

  const rows = teams.map((t) => {
    const ledger = Number(t.ledger_balance);
    const expected = Number(t.expected_balance);
    const issues = [
      Math.abs(ledger - expected) > 0.001 && "ledger ≠ expected",
      ledger < 0 && "negative balance",
      ledger > Number(t.per_team_cap_usd) && "over cap",
    ].filter(Boolean) as string[];
    return { ...t, ledger, expected, issues };
  });
  const bad = rows.filter((r) => r.issues.length);
  const byVersion = (v: string) => {
    const rs = runs.filter((r) => r.agent_version === v);
    return { n: rs.length, failed: rs.filter((r) => r.outcome === "failed").length, flagged: rs.filter((r) => r.outcome === "flagged").length };
  };
  const v1 = byVersion("v1");
  const v2 = byVersion("v2");

  return (
    <>
      <PageHeader kicker="Admin" title="Reconciliation" />
      {teams.length === 0 ? (
        <Empty>Nothing to reconcile yet.</Empty>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Teams with mismatches" value={bad.length} tone={bad.length ? "bad" : "good"} />
            <Stat label="Teams checked" value={rows.length} />
            <Stat label="v1 runs · failed · flagged" value={`${v1.n} · ${v1.failed} · ${v1.flagged}`} tone={v1.failed ? "bad" : undefined} />
            <Stat label="v2 runs · failed · flagged" value={`${v2.n} · ${v2.failed} · ${v2.flagged}`} tone={v2.n && !v2.failed ? "good" : undefined} />
          </div>
          <div className="panel mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  {["Team", "Ledger", "Expected", "Difference", "Issues"].map((h) => (
                    <th key={h} className="label-caps p-2">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.team_id} className={`border-b last:border-0 ${r.issues.length ? "bg-destructive text-destructive-foreground" : ""}`}>
                    <td className="p-2 font-medium">{r.name}</td>
                    <td className="num p-2">{usd(r.ledger)}</td>
                    <td className="num p-2">{usd(r.expected)}</td>
                    <td className="num p-2">{usd(r.ledger - r.expected)}</td>
                    <td className="p-2 text-xs">{r.issues.join(", ") || "match"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

