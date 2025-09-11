export type WebVitalMetric = {
  id: string;
  name: string;
  value: number;
  rating?: string;
  navigationType?: string;
  attribution?: unknown;
  entries?: unknown;
  ts?: number;
};

const METRICS_BASE = import.meta.env.VITE_METRICS_BASE as string | undefined;
const METRICS_KEY = import.meta.env.VITE_METRICS_KEY as string | undefined;
const USE_PROXY = true;

function buildURL(path: string, params: Record<string, string | number | undefined>) {
  const base = USE_PROXY ? "/api" : (METRICS_BASE ?? "");
  const url = new URL(base + path, window.location.origin);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined) url.searchParams.set(k, String(v)); });
  if (!USE_PROXY && METRICS_KEY) url.searchParams.set("apiKey", METRICS_KEY);
  return url.toString();
}

export async function sendWebVital(metric: WebVitalMetric) {
  const url = buildURL("/web-vitals", {});
  const payload = { ...metric, ts: metric.ts ?? Date.now() };
  const body = JSON.stringify(payload);

  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    const ok = navigator.sendBeacon(url, new Blob([body], { type: "application/json" }));
    if (ok) return { ok: true };
  }

  const res = await fetch(url, {
    method: "POST",
    body,
    keepalive: true,
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Metrics ${res.status}: ${await res.text()}`);
  return await res.json();
}
