import type { Article, NewsResponse } from "../types/news";

export type Lang = "pt" | "en" | "es";
export function mapCountryToLang(c: "BR" | "US"): Lang { return c === "US" ? "en" : "pt"; }

const BASE = import.meta.env.VITE_NEWSAPI_BASE as string;
const KEY = import.meta.env.VITE_NEWSAPI_KEY as string;
const DEFQ = (import.meta.env.VITE_DEFAULT_QUERY as string) || "tecnologia";

const USE_PROXY = false;

function buildURL(path: string, params: Record<string, string | number | undefined>) {
    const url = new URL((USE_PROXY ? "/api/news" : BASE) + path, window.location.origin);
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) url.searchParams.set(k, String(v)); });
    if (!USE_PROXY) url.searchParams.set("apiKey", KEY);
    return url.toString();
}

export async function fetchEverything(opts: {
    q?: string; language?: Lang; sortBy?: "relevancy" | "popularity" | "publishedAt"; pageSize?: number;
}): Promise<NewsResponse> {
    const url = buildURL("/everything", {
        q: opts.q ?? DEFQ,
        language: opts.language ?? "pt",
        sortBy: opts.sortBy ?? "publishedAt",
        pageSize: opts.pageSize ?? 100,
    });
    const res = await fetch(url, { headers: USE_PROXY ? { "X-Api-Key": KEY } : undefined });
    if (!res.ok) throw new Error(`NewsAPI ${res.status}: ${await res.text()}`);
    return (await res.json()) as NewsResponse;
}

export async function fetchEverythingAll(opts: { q?: string; pageSize?: number }) {
    const [pt, en] = await Promise.all([
        fetchEverything({ q: opts.q ?? DEFQ, language: "pt", sortBy: "publishedAt", pageSize: opts.pageSize ?? 100 }),
        fetchEverything({ q: opts.q ?? DEFQ, language: "en", sortBy: "publishedAt", pageSize: opts.pageSize ?? 100 }),
    ]);
    const seen = new Set<string>();
    const merged: Article[] = [...(pt.articles ?? []), ...(en.articles ?? [])].filter(a => {
        if (!a.url || seen.has(a.url)) return false;
        seen.add(a.url);
        return true;
    });
    merged.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    return { status: "ok", totalResults: merged.length, articles: merged };
}
