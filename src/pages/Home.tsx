import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  fetchEverything,
  fetchEverythingAll,
  mapCountryToLang,
  type Lang,
} from "../lib/news";
import type { Article } from "../types/news";
import type { RecentItem } from "../types/recent";
import AsideRecent from "../components/AsideRecent";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const dateFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function Home() {
  const [sp] = useSearchParams();
  const country = (sp.get("country") as "ALL" | "BR" | "US" | null) ?? "BR";

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        const defaultQ = import.meta.env.VITE_DEFAULT_QUERY || "tecnologia";
        if (country === "ALL") {
          const all = await fetchEverythingAll({ q: defaultQ, pageSize: 100 });
          if (!mounted) return;
          setArticles(
            (all.articles ?? []).sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime()
            )
          );
        } else {
          const lang: Lang = mapCountryToLang(country === "US" ? "US" : "BR");
          const data = await fetchEverything({
            q: defaultQ,
            language: lang,
            sortBy: "publishedAt",
            pageSize: 100,
          });
          if (!mounted) return;
          setArticles(
            (data.articles ?? []).sort(
              (a, b) =>
                new Date(b.publishedAt).getTime() -
                new Date(a.publishedAt).getTime()
            )
          );
        }
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || "Erro ao carregar notícias");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [country]);

  const featured = articles[0];
  const latest5 = articles.slice(0, 5);

  const fallbackRecent: RecentItem[] = useMemo(
    () =>
      articles.slice(1, 4).map((a) => ({
        title: a.title,
        url: a.url,
        urlToImage: a.urlToImage,
        publishedAt: a.publishedAt,
        source: a.source.name,
      })),
    [articles]
  );

  if (loading)
    return <main className="mx-auto max-w-6xl px-4 py-12">Carregando…</main>;
  if (err)
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 text-red-600">{err}</main>
    );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-12 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6">Notícia em Destaque</h2>

          {featured ? (
            <Link
              to={`/article?${new URLSearchParams({
                url: featured.url,
                title: featured.title,
                img: featured.urlToImage ?? "",
                publishedAt: featured.publishedAt ?? "",
                source: featured.source.name,
                author: featured.author ?? "",
                description: featured.description ?? "",
                country,
              }).toString()}`}
              className="block"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-72 lg:h-96">
                  <img
                    src={featured.urlToImage || "/logo.png"}
                    alt={featured.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive">Destaque</Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{featured.source.name}</Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-3 line-clamp-2">
                    {featured.title}
                  </h3>
                  {featured.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {featured.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{featured.author ?? "—"}</span>
                    <span>
                      {dateFmt.format(new Date(featured.publishedAt))}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <p className="text-muted-foreground">Nenhuma notícia encontrada.</p>
          )}
        </div>

        <AsideRecent fallback={fallbackRecent} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Últimas Notícias</h2>

        <div className="grid gap-6 lg:grid-cols-5 grid-flow-col auto-cols-[minmax(260px,1fr)] lg:auto-cols-auto overflow-x-auto lg:overflow-visible pb-2">
          {latest5.map((a) => (
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
              className="min-w-[260px] lg:min-w-0 block"
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow h-[340px] flex flex-col">
                <div className="relative h-40">
                  <img
                    src={a.urlToImage || "/logo.png"}
                    alt={a.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="mb-3">
                    <Badge variant="outline">{a.source.name}</Badge>
                  </div>
                  <h3 className="font-bold mb-2 line-clamp-2">{a.title}</h3>
                  <div className="mt-auto flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate max-w-[55%]">
                      {a.author ?? "—"}
                    </span>
                    <span>{dateFmt.format(new Date(a.publishedAt))}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
