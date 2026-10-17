import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "How to use · JRR Token" },
      { name: "description", content: "Step-by-step guide and stage diagram for the JRR Token demo." },
      { property: "og:title", content: "How to use · JRR Token" },
      { property: "og:description", content: "Step-by-step guide and stage diagram for the JRR Token demo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuidePage,
});

const STAGES = [
  { n: 1, title: "Request", body: "A team asks to return or move credits (Wallet or Queue)." },
  { n: 2, title: "Rules check", body: "Program rules and caps are loaded for the request." },
  { n: 3, title: "AI agent", body: "The agent picks the next step: balance, reserve, apply." },
  { n: 4, title: "Database guard", body: "Locked money functions approve or block each move." },
  { n: 5, title: "Reconcile & audit", body: "Ledger is checked and every event is logged." },
];

const STEPS = [
  { title: "Seed sample data", body: "Open Demo control and press “Seed sample data”.", to: "/demo" },
  { title: "Run v1 batch", body: "Switch to v1 and run the batch. The Reconcile page turns red.", to: "/reconcile" },
  { title: "Reset and run v2", body: "Reset, switch to v2, run again. Everything reconciles.", to: "/demo" },
  { title: "Inspect", body: "Check Queue for each run and Audit for the full event trail.", to: "/audit" },
] as const;

function GuidePage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="label-caps">Guide</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">How to use JRR Token</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Every credit move passes through five stages. The AI only chooses steps; the database decides if money moves.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Stages</h2>
        <ol className="flex flex-col gap-3 md:flex-row md:items-stretch">
          {STAGES.map((s, i) => (
            <li key={s.n} className="flex flex-1 flex-col md:flex-row md:items-center">
              <div className="flex-1 rounded-sm border border-foreground bg-card p-4">
                <div className="num text-xs text-muted-foreground">STAGE {s.n}</div>
                <div className="mt-1 font-semibold">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              </div>
              {i < STAGES.length - 1 && (
                <div aria-hidden className="py-1 text-center text-xl text-muted-foreground md:px-2 md:py-0">
                  <span className="md:hidden">↓</span>
                  <span className="hidden md:inline">→</span>
                </div>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-muted-foreground">
          If stage 4 blocks a move, the run stops and the audit shows why.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Demo walkthrough</h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="rounded-sm border border-border p-4">
              <div className="num text-xs text-muted-foreground">STEP {i + 1}</div>
              <div className="mt-1 font-semibold">{s.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
              <Link to={s.to} className="mt-2 inline-block text-sm underline">
                Open →
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Watch the walkthrough</h2>
        <video
          src="/walkthrough.mp4"
          controls
          preload="metadata"
          className="w-full max-w-3xl rounded-sm border border-border bg-card shadow-sm"
        >
          Your browser does not support embedded video.
        </video>
        <p className="mt-2 text-sm text-muted-foreground">
          104-second narrated tour of the five stages and the v1 → v2 demo.
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Team</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {["Frank Yu", "Lyan Cheung", "Forrest Pan"].map((name) => (
            <li key={name} className="rounded-sm border border-border bg-card p-4">
              <div className="font-semibold">{name}</div>
              <div className="text-sm text-muted-foreground">JRR Token · MONEY TALKS 2</div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

