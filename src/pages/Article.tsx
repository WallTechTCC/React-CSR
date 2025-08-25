import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { writeRecentLS } from "../lib/recent-local";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

const fmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export default function Article() {
  const [sp] = useSearchParams();
  const url = sp.get("url") || "";
  const title = sp.get("title") || "";
  const img = sp.get("img") || "/logo.png";
  const publishedAt = sp.get("publishedAt") || "";
  const source = sp.get("source") || "";
  const author = sp.get("author") || "";
  const description = sp.get("description") || "";
  const country = (sp.get("country") as "ALL" | "BR" | "US" | null) ?? "BR";

  useEffect(() => {
    if (url)
      writeRecentLS({ title, url, urlToImage: img, publishedAt, source });
  }, [url, title, img, publishedAt, source]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4">
        <Button variant="outline" asChild>
          <Link to={country === "ALL" ? "/" : `/?country=${country}`}>
            ← Voltar
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="relative w-full h-64">
          <img
            src={img || "/logo.png"}
            alt={title}
            className="object-cover w-full h-full"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="secondary">{source || "Fonte"}</Badge>
          </div>
        </div>

        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <div className="text-sm text-muted-foreground mb-4 flex flex-wrap gap-x-3 gap-y-1">
            <span>{author || "—"}</span>
            <Separator orientation="vertical" className="h-4" />
            <span>{publishedAt ? fmt.format(new Date(publishedAt)) : "—"}</span>
          </div>

          {description && <p className="mb-6">{description}</p>}

          <Button asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              Ler na fonte ↗
            </a>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
