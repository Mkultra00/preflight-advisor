// PRISM live tracing via HTTP ingest. Never throws: tracing must not break money moves.
export async function emitTrace(opts: {
  input: unknown;
  output: string;
  model: string;
  latencyMs: number;
  sessionId: string;
  metadata?: Record<string, unknown>;
}) {
  const key = process.env["PRISMTRACE_API_KEY"];
  const project = process.env["PRISMTRACE_PROJECT_ID"];
  const host = process.env["PRISMTRACE_HOST"] ?? "https://api.prism.blockconvey.com";
  if (!key || !project) return;
  try {
    const res = await fetch(`${host}/api/traces`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-PRISMtrace-Key": key },
      body: JSON.stringify({
        project_id: project,
        model: opts.model,
        input_messages: Array.isArray(opts.input) ? opts.input : [{ role: "user", content: String(opts.input) }],
        output_message: opts.output,
        latency_ms: opts.latencyMs,
        session_id: opts.sessionId,
        metadata: opts.metadata,
      }),
    });
    if (!res.ok) console.error("PRISM ingest", res.status, (await res.text()).slice(0, 200));
  } catch (e) {
    console.error("PRISM ingest failed", e);
  }
}
