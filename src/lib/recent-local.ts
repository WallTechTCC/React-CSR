import type { RecentItem } from "../types/recent";

export const RECENT_KEY = "wt_recent";
export const RECENT_MAX = 6;

const __DEV__ = import.meta.env.DEV;

function logWarn(where: string, err: unknown) { if (__DEV__) console.warn(`[recent-local] ${where}:`, err); }
function canUseLS(): boolean { try { return typeof window !== "undefined" && !!window.localStorage; } catch { return false; } }
function isRecentItem(x: any): x is RecentItem { return x && typeof x === "object" && typeof x.url === "string" && x.url.length > 0; }
function isQuotaExceeded(e: any) {
    return e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014);
}
function safeParseArray(raw: string | null): RecentItem[] {
    if (!raw) return [];
    try {
        const data = JSON.parse(raw);
        if (!Array.isArray(data)) return [];
        return data.filter(isRecentItem).slice(0, RECENT_MAX);
    } catch (e) {
        try { window.localStorage.removeItem(RECENT_KEY); } catch (rmErr) { logWarn("safeParseArray.removeItem", rmErr); }
        logWarn("safeParseArray.parse", e);
        return [];
    }
}
export function readRecentLS(): RecentItem[] {
    if (!canUseLS()) return [];
    try { return safeParseArray(window.localStorage.getItem(RECENT_KEY)); }
    catch (e) { logWarn("readRecentLS.getItem", e); return []; }
}
export function writeRecentLS(item: RecentItem): boolean {
    if (!canUseLS()) return false;
    if (!isRecentItem(item)) { logWarn("writeRecentLS.invalidItem", item); return false; }
    try {
        const current = readRecentLS().filter((x) => x.url !== item.url);
        current.unshift(item);
        window.localStorage.setItem(RECENT_KEY, JSON.stringify(current.slice(0, RECENT_MAX)));
        return true;
    } catch (e) {
        if (!isQuotaExceeded(e)) { logWarn("writeRecentLS.setItem", e); return false; }
        try {
            let arr = readRecentLS().filter((x) => x.url !== item.url);
            arr.unshift(item);
            let limit = Math.max(1, Math.min(RECENT_MAX, arr.length));
            while (limit > 1) {
                try {
                    window.localStorage.setItem(RECENT_KEY, JSON.stringify(arr.slice(0, limit)));
                    return true;
                } catch (inner) {
                    if (!isQuotaExceeded(inner)) { logWarn("writeRecentLS.retry.setItem", inner); return false; }
                    limit = Math.floor(limit / 2);
                }
            }
            window.localStorage.setItem(RECENT_KEY, JSON.stringify([item]));
            return true;
        } catch (finalErr) { logWarn("writeRecentLS.quota.final", finalErr); return false; }
    }
}
export function clearRecentLS(): boolean {
    if (!canUseLS()) return false;
    try { window.localStorage.removeItem(RECENT_KEY); return true; }
    catch (e) { logWarn("clearRecentLS.removeItem", e); return false; }
}
