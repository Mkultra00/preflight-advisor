# JRR Token (Just Really Reliable)

**Just Really Reliable: an AI agent that moves program credits without ever breaking the ledger.**

Teams need to move credits safely. An issuer funds a program and gives every team a grant; teams return unused credits to the pool or request more when they run short. JRR Token hands each request to an AI agent, which checks the rules, moves the credits and explains what it did.

**Live app**: https://preflight-advisor.lovable.app

**Demo flow**: seed → run the stress batch on v1 (naive) → reset → run it on v2 (database-enforced) → watch the ledger reconcile.

## Presentation

The hackathon pitch deck is in this repo: [`docs/JRR-Token-Presentation.pptx`](docs/JRR-Token-Presentation.pptx).

Slide-by-slide:

1. **JRR Token** — title. Frank Yu · Liyan Cheung · Forrest Pan (MONEY TALKS 2 hackathon).
2. **Teams need to move credits, safely** — issuer funds a program, teams return/request credits, the AI agent moves them. Sample program: $260 starting grant per team, $600 per-team cap, 12 teams, expiry date after which no credit moves.
3. **AI agents with ledger access can lose money** — skipped steps, race conditions, broken rules (over-cap, ineligible, expired, cross-program) and prompt injection. Our 60-operation stress batch: 30 normal, 16 same-team drain, 5 over cap, 3 ineligible team, 2 expired program, 2 cross-program, 2 prompt injection.
4. **AI picks the steps; the database moves money** — Request → Rules check → AI agent → Database guard → Reconcile & audit. Reserve before apply so parallel drains can't overdraw; rules live in SQL; request notes are untrusted.
5. **Built with Lovable on a full TypeScript stack** — Lovable app builder, TanStack Start + React 19 + Tailwind + shadcn/ui, Supabase Postgres (ledger tables, locked money functions, append-only audit trigger), Claude Haiku via the Nicrron gateway (Gemini Flash fallback), server-side agent loop (up to 16 tool-calling turns, the browser never writes), PRISM tracing + Vitest end-to-end test.
6. **Six views** — Program console, Team wallet, Operations queue, Reconciliation, Audit trail, Demo control.
7. **Thank you** — try the demo: seed, run v1, reset, run v2, and watch the ledger reconcile.

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/be43f7a5-72ac-4273-8a5a-42e260f689d2).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
