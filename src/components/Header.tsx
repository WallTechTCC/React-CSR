import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sp] = useSearchParams();

  const [q, setQ] = useState(sp.get("q") ?? "");
  const country = (sp.get("country") as "ALL" | "BR" | "US" | null) ?? "BR";

  const tId = useRef<number | undefined>(undefined);
  useEffect(
    () => () => {
      if (tId.current) window.clearTimeout(tId.current);
    },
    []
  );

  function go(to: string, next: URLSearchParams) {
    navigate(`${to}?${next.toString()}`, { replace: false });
  }

  function handleInput(v: string) {
    const next = new URLSearchParams(sp);
    if (v.trim()) {
      next.set("q", v.trim());
      next.set("page", "1");
      go("/search", next);
    } else {
      next.delete("q");
      next.delete("page");
      go("/", next);
    }
  }

  function handleChangeCountry(val: "ALL" | "BR" | "US") {
    const next = new URLSearchParams(sp);
    next.set("country", val);
    next.delete("page");
    const isSearching = (sp.get("q") ?? "").trim().length > 0;
    const path =
      location.pathname === "/search" && isSearching ? "/search" : "/";
    go(path, next);
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 py-4 flex flex-col lg:flex-row lg:items-center gap-4">
        <a href="/" className="flex items-center gap-3">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img
              src="/logo.png"
              alt="WallTech"
              width={24}
              height={24}
              className="rounded"
            />
          </div>
          <span className="text-2xl font-bold">WallTech</span>
        </a>

        <div className="flex flex-1 gap-3 max-w-2xl lg:ml-6">
          <Input
            value={q}
            onChange={(e) => {
              const v = e.target.value;
              setQ(v);
              if (tId.current) window.clearTimeout(tId.current);
              tId.current = window.setTimeout(() => handleInput(v), 400);
            }}
            placeholder="Pesquisar notícias de tecnologia…"
            aria-label="Pesquisar"
          />

          <Select
            value={country}
            onValueChange={(v) => handleChangeCountry(v as "ALL" | "BR" | "US")}
          >
            <SelectTrigger className="w-44">
              <SelectValue placeholder="País" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">🌍 Todos os países</SelectItem>
              <SelectItem value="BR">🇧🇷 Brasil</SelectItem>
              <SelectItem value="US">🇺🇸 EUA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}
