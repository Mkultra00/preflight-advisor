import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader, Empty } from "@/components/cp-ui";
import { eventsQuery, useLiveRefresh } from "@/lib/cp-data";

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Audit log · JRR Token" },
      { name: "description", content: "Append-only record of every agent, admin and system step." },
      { property: "og:title", content: "Audit log · JRR Token" },
      { property: "og:description", content: "Every step, append-only, filterable by operation." },
    ],
  }),
  component: Audit,
});

function Audit() {
  useLiveRefresh();
  const [filter, setFilter] = useState("");
  const valid = /^[0-9a-f-]{36}$/i.test(filter.trim());
  const { data = [] } = useQuery(eventsQuery(valid ? filter.trim() : undefined));

  return (
    <>
      <PageHeader kicker="Admin · append-only" title="Audit log">
        <Input className="num w-80" placeholder="Filter by operation ID" value={filter} onChange={(e) => setFilter(e.target.value)} />
      </PageHeader>
      {data.length === 0 ? (
        <Empty>No events yet.</Empty>
      ) : (
        <div className="panel divide-y">
          {data.map((e) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const p = e.payload as any;
            return (
              <div key={e.id} className="num grid grid-cols-[4rem_7rem_4rem_10rem_1fr] gap-3 p-2 text-xs">
                <span className="text-muted-foreground">#{e.id}</span>
                <span className="text-muted-foreground">{new Date(e.created_at).toLocaleTimeString()}</span>
                <span>{e.actor}</span>
                <span className={p?.error ? "text-destructive" : ""}>{e.step}</span>
                <button className="truncate text-left text-muted-foreground" onClick={() => e.operation_id && setFilter(e.operation_id)}>
                  {JSON.stringify(p).slice(0, 200)}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

