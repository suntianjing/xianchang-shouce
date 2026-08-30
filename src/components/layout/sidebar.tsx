import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { TRACKS, lessonsOf } from "@/lib/content/catalog";
import { lessonId, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const completed = useProgress((s) => s.completed);
  const resetAll = useProgress((s) => s.resetAll);

  return (
    <nav className="flex h-full flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          <SideLink to="/" onNavigate={onNavigate}>
            入职路径
          </SideLink>
          <SideLink to="/cheatsheet" onNavigate={onNavigate}>
            对照速查
          </SideLink>
          <SideLink to="/glossary" onNavigate={onNavigate}>
            术语表
          </SideLink>
          <SideLink to="/quiz" onNavigate={onNavigate}>
            坑题测验
          </SideLink>
        </div>

        {TRACKS.map((t) => {
          const lessons = lessonsOf(t.id);
          const done = lessons.filter((l) => completed[lessonId(l.track, l.slug)]).length;
          return (
            <div key={t.id}>
              <div className="mb-2 flex items-baseline justify-between px-2">
                <p className="font-display text-sm font-semibold">{t.title}</p>
                <p className="font-mono text-[0.6875rem] tabular-nums text-faint">
                  {done}/{lessons.length}
                </p>
              </div>
              <ul className="space-y-0.5">
                {lessons.map((l, i) => {
                  const id = lessonId(l.track, l.slug);
                  const isDone = Boolean(completed[id]);
                  return (
                    <li key={l.slug}>
                      <Link
                        to="/learn/$track/$slug"
                        params={{ track: l.track, slug: l.slug }}
                        onClick={onNavigate}
                        className={cn(
                          "flex min-h-10 items-center gap-2 rounded-sm px-2 text-sm text-muted hover:bg-paper-2 hover:text-ink",
                          isDone && "text-ink",
                        )}
                        activeProps={{
                          className: "bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent",
                        }}
                      >
                        <span className="w-4 font-mono text-[0.6875rem] tabular-nums text-faint">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0 flex-1 truncate">{l.title}</span>
                        {isDone ? <Check className="size-3.5 shrink-0 text-ok" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
      <div className="border-t border-line px-3 py-3">
        <button
          type="button"
          className="min-h-10 w-full rounded-sm px-2 text-left text-xs text-faint hover:bg-paper-2 hover:text-muted"
          onClick={() => {
            if (window.confirm("清空本机的课程进度和答题记录？")) resetAll();
          }}
        >
          清空进度
        </button>
      </div>
    </nav>
  );
}

function SideLink({
  to,
  children,
  onNavigate,
}: {
  to: "/" | "/cheatsheet" | "/quiz" | "/glossary";
  children: ReactNode;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onNavigate}
      className="flex min-h-10 items-center rounded-sm px-2 text-sm text-ink hover:bg-paper-2"
      activeProps={{ className: "bg-accent-soft text-accent hover:bg-accent-soft hover:text-accent" }}
      activeOptions={{ exact: to === "/" }}
    >
      {children}
    </Link>
  );
}
