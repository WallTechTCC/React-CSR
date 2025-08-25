import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchEverything,
  fetchEverythingAll,
  mapCountryToLang,
  type Lang,
} from "../lib/news";
import type { Article } from "../types/news";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const PER_PAGE = 6;
const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const norm = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
const matches = (a: Article, term: string) => {
  const t = norm(term);
  if (!t) return true;
  return norm(
    [a.title, a.description ?? "", a.source?.name ?? "", a.author ?? ""].join(
      " "
    )
  ).includes(t);
};

export default function Search() {
  const [sp] = useSearchParams();
  const q = (sp.get("q") ?? "").trim();
  const country = (sp.get("country") as "ALL" | "BR" | "US" | null) ?? "ALL";
  const pageNum = Math.max(parseInt(sp.get("page") ?? "1", 10) || 1, 1);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mount = true;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const defaultQ = import.meta.env.VITE_DEFAULT_QUERY || "tecnologia";
        if (country === "ALL") {
          const all = await fetchEverythingAll({ q: defaultQ, pageSize: 100 });
          if (!mount) return;
          setArticles(all.articles ?? []);
        } else {
          const lang: Lang = mapCountryToLang(country === "US" ? "US" : "BR");
          const data = await fetchEverything({
            q: defaultQ,
            language: lang,
            sortBy: "publishedAt",
            pageSize: 100,
          });
          if (!mount) return;
          setArticles(
            (data.articles ?? []).sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime()
            )
          );
        }
      } catch (e: any) {
        if (mount) setErr(e?.message || "Erro ao carregar");
      } finally {
        if (mount) setLoading(false);
      }
    })();
    return () => {
      mount = false;
    };
  }, [country]);

  const filtered = useMemo(
    () => (q ? articles.filter((a) => matches(a, q)) : articles),
    [articles, q]
  );
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const page = Math.min(pageNum, totalPages);
  const start = (page - 1) * PER_PAGE;
  const end = Math.min(start + PER_PAGE, total);
  const pageItems = filtered.slice(start, end);

  function makeUrl(p: number) {
    const next = new URLSearchParams(sp);
    next.set("page", String(p));
    return `/search?${next.toString()}`;
  }
  function clearUrl() {
    const next = new URLSearchParams(sp);
    next.delete("q");
    next.set("page", "1");
    return `/${country === "ALL" ? "" : `?country=${country}`}`;
  }

  if (loading)
    return <main className="mx-auto max-w-6xl px-4 py-12">Carregando…</main>;
  if (err)
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 text-red-600">{err}</main>
    );

  const countryBadge =
    country === "ALL"
      ? "🌍 Todos os países"
      : country === "BR"
      ? "🇧🇷 Brasil"
      : "🇺🇸 EUA";

  // números de paginação compactos
  function pageList(): (number | "...")[] {
    const arr: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) arr.push(i);
      return arr;
    }
    arr.push(1);
    if (page > 3) arr.push("...");
    for (
      let i = Math.max(2, page - 1);
      i <= Math.min(totalPages - 1, page + 1);
      i++
    )
      arr.push(i);
    if (page < totalPages - 2) arr.push("...");
    arr.push(totalPages);
    return arr;
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* header da busca */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {q ? "Resultados da Busca" : "Últimas Notícias"}{" "}
          <span className="text-muted-foreground font-normal text-lg">
            ({total} {total === 1 ? "resultado" : "resultados"})
          </span>
        </h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{countryBadge}</Badge>
          <Button variant="outline" asChild>
            <Link to={clearUrl()}>Limpar Filtro</Link>
          </Button>
        </div>
      </div>

      {/* grid 3x2 */}
      {pageItems.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Nenhum resultado para{" "}
          <span className="font-semibold">“{q || "—"}”</span>.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pageItems.map((a) => (
            <Link
              key={a.url}
              to={`/article?${new URLSearchParams({
                url: a.url,
                title: a.title,
                img: a.urlToImage ?? "",
                publishedAt: a.publishedAt ?? "",
                source: a.source.name,
                author: a.author ?? "",
                description: a.description ?? "",
                country,
              }).toString()}`}
              className="block"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="relative h-40">
                  <img
                    src={a.urlToImage || "/logo.png"}
                    alt={a.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">
                      {country === "ALL"
                        ? "🌍"
                        : country === "BR"
                        ? "🇧🇷"
                        : "🇺🇸"}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{a.source.name}</Badge>
                  </div>
                  <h3 className="font-semibold mb-2 leading-snug line-clamp-2">
                    {a.title}
                  </h3>
                  {a.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {a.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate max-w-[55%]">
                      {a.author ?? "—"}
                    </span>
                    <span>{fmt.format(new Date(a.publishedAt))}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* paginação */}
      {totalPages > 1 && (
        <>
          <nav className="mt-6 flex items-center justify-center gap-2">
            <Button variant="outline" asChild disabled={page === 1}>
              <Link to={makeUrl(Math.max(1, page - 1))}>◀︎ Anterior</Link>
            </Button>

            {pageList().map((p, i) =>
              p === "..." ? (
                <span key={`dots-${i}`} className="px-2 text-muted-foreground">
                  …
                </span>
              ) : (
                <Button
                  key={p}
                  variant={p === page ? "default" : "outline"}
                  asChild
                  className="w-9"
                >
                  <Link
                    to={makeUrl(p as number)}
                    aria-current={p === page ? "page" : undefined}
                  >
                    {p}
                  </Link>
                </Button>
              )
            )}

            <Button variant="outline" asChild disabled={page === totalPages}>
              <Link to={makeUrl(Math.min(totalPages, page + 1))}>
                Próximo ▶︎
              </Link>
            </Button>
          </nav>

          <p className="mt-2 text-center text-xs text-muted-foreground">
            Mostrando {total === 0 ? 0 : start + 1} a {end} de {total}{" "}
            resultados
          </p>
        </>
      )}
    </main>
  );
}
