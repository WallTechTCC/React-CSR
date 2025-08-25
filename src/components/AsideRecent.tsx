import { useEffect, useMemo, useState } from "react";
import type { RecentItem } from "@/types/recent";
import { readRecentLS, writeRecentLS } from "@/lib/recent-local";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function AsideRecent({ fallback }: { fallback: RecentItem[] }) {
  const [items, setItems] = useState<RecentItem[] | null>(null);

  useEffect(() => {
    const ls = readRecentLS();
    setItems(ls.length ? ls.slice(0, 3) : null);
  }, []);

  const list = useMemo(() => items ?? fallback.slice(0, 3), [items, fallback]);
  const title = items ? "Recém visitadas" : "Outras notícias";

  return (
    <aside>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>

      <div className="grid gap-4">
        {list.map((a) => (
          <a
            key={a.url}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => writeRecentLS(a)}
            className="block"
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow flex flex-col h-[200px] rounded-2xl">
              <div className="relative h-24 shrink-0">
                <img
                  src={a.urlToImage || "/logo.png"}
                  alt={a.title}
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-2 left-2 z-10 pointer-events-none">
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 bg-black/60 text-white border-white/20"
                  >
                    {a.source}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-3 flex-1 flex flex-col">
                <h4 className="font-medium text-sm leading-snug line-clamp-2">
                  {a.title}
                </h4>
                <div className="text-[11px] text-muted-foreground mt-auto">
                  {fmt.format(new Date(a.publishedAt || ""))}
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>
    </aside>
  );
}
