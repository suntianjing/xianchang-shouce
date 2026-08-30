import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-bg px-6 text-center text-ink">
      <p className="font-mono text-xs tracking-widest text-accent">404</p>
      <h1 className="font-display text-2xl font-semibold">没有这一课</h1>
      <p className="max-w-sm text-sm text-muted">目录里找不到对应章节，回首页从路径重新进。</p>
      <Button asChild>
        <Link to="/">回现场手册</Link>
      </Button>
    </main>
  );
}
