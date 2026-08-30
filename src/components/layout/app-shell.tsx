import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SearchDialog } from "@/components/layout/search-dialog";
import { SidebarNav } from "@/components/layout/sidebar";
import { TOTAL_LESSONS } from "@/lib/content/catalog";
import { useProgress } from "@/lib/progress";

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const completed = useProgress((s) => s.completed);
  const done = Object.values(completed).filter(Boolean).length;
  const pct = Math.round((done / TOTAL_LESSONS) * 100);

  useEffect(() => {
    void useProgress.persist.rehydrate();
  }, []);

  return (
    <div className="min-h-dvh bg-bg text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        跳到内容
      </a>
      <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-sm">
        <div className="flex h-14 items-center gap-3 px-3 md:px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="打开目录">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent title="目录" side="left">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>

          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center border-2 border-accent font-display text-sm font-semibold text-accent">
              现
            </span>
            <span className="font-display text-base font-semibold tracking-tight">现场手册</span>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <SearchDialog />
          </div>

          <div className="ml-auto flex w-28 flex-col gap-1 md:w-36">
            <div className="flex justify-between font-mono text-[0.6875rem] tabular-nums text-muted">
              <span>进度</span>
              <span>
                {done}/{TOTAL_LESSONS}
              </span>
            </div>
            <Progress value={pct} />
          </div>
        </div>
        <div className="border-t border-line px-3 py-2 md:hidden">
          <SearchDialog />
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl">
        <aside className="sticky top-14 hidden h-[calc(100dvh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-line lg:block">
          <SidebarNav />
        </aside>
        <div id="main" className="min-w-0 flex-1 overflow-x-clip">
          {children}
        </div>
      </div>
    </div>
  );
}
