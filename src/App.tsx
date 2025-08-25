import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Article from "./pages/Article";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/article" element={<Article />} />
      </Routes>

      <footer className="border-t bg-muted/50 mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <img
              src="/logo.png"
              alt="WallTech"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="font-semibold">WallTech</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} WallTech. Todas as notícias de
            tecnologia em um só lugar.
          </p>
        </div>
      </footer>
    </div>
  );
}
