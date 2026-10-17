<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## JRR Token rules
- Money rules live in locked-down Postgres functions (reserve/apply/reconcile, v1 and v2); the AI agent only picks tools — so the database, not the model, guarantees ledger safety.
- The agent loop runs in server code (src/lib/agent.server.ts) via server functions; the browser only reads tables (public SELECT) and never writes directly — demo app has no sign-in.
- allocation_events is append-only (trigger blocks UPDATE/DELETE); only demo reset may TRUNCATE.

## PRISM tracing (do not remove)

This project sends traces to PRISM. Env vars: `PRISMTRACE_API_KEY`,
`PRISMTRACE_PROJECT_ID`, `PRISMTRACE_HOST`.

Tracing is currently wired at: src/lib/prism.server.ts, src/lib/agent.server.ts

**Standing rule.** Whenever you add or change an agent, chain, graph, tool,
retriever, or any entry point that calls a model, wire it to PRISM before you
finish. Unwired code is invisible in the dashboard. If you are unsure whether
something is covered, assume it is not and wire it.
