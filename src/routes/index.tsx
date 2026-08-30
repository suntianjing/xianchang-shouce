import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, ClipboardList, Compass, Download, ListChecks } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import {
  DAYS,
  TRACKS,
  TOTAL_LESSONS,
  allLessons,
  getLesson,
  lessonsOf,
} from "@/lib/content/catalog";
import { quizQuestions } from "@/lib/content/quiz";
import { lessonId, useProgress } from "@/lib/progress";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const completed = useProgress((s) => s.completed);
  const last = useProgress((s) => s.lastLesson);
  const done = Object.values(completed).filter(Boolean).length;
  const next =
    allLessons().find((l) => !completed[lessonId(l.track, l.slug)]) ?? allLessons()[0];

  const continueLesson =
    (last && allLessons().find((l) => l.track === last.track && l.slug === last.slug)) || next;

  return (
    <AppShell>
      <main className="px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <div className="relative overflow-hidden rounded-xl bg-paper px-5 py-8 shadow-(--shadow-border) sm:px-8 sm:py-10">
          <Stamp />
          <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-accent">TAIKANG · FRONTEND</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
            现场手册
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            Vue2 急救、Vue3 对照、泰康在线中后台现场。六日路径一次铺开，按顺序过即可。
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button asChild>
              <Link
                to="/learn/$track/$slug"
                params={{ track: continueLesson.track, slug: continueLesson.slug }}
              >
                {done === 0 ? "从第一课开始" : "接着上次"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/quiz">先做测验摸底</Link>
            </Button>
            <Button asChild variant="stamp">
              <a href="https://github.com/suntianjing/xianchang-shouce" target="_blank" rel="noreferrer">
                GitHub 仓库
                <Download className="size-4" />
              </a>
            </Button>
            <p className="font-mono text-xs tabular-nums text-faint">
              {done} / {TOTAL_LESSONS} 课
            </p>
          </div>
        </div>

        <section className="mt-8 grid gap-3 sm:grid-cols-3">
          {TRACKS.map((t) => {
            const list = lessonsOf(t.id);
            const n = list.filter((l) => completed[lessonId(l.track, l.slug)]).length;
            const first = list.find((l) => !completed[lessonId(l.track, l.slug)]) ?? list[0];
            const Icon = t.id === "vue2" ? BookOpen : t.id === "vue3" ? Compass : ClipboardList;
            return (
              <Link
                key={t.id}
                to="/learn/$track/$slug"
                params={{ track: first.track, slug: first.slug }}
                className="group rounded-lg bg-paper p-5 shadow-(--shadow-border) transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5"
              >
                <Icon className="size-5 text-accent" />
                <p className="mt-4 font-mono text-[0.6875rem] tracking-wider text-accent">{t.kicker}</p>
                <h2 className="mt-1 font-display text-xl font-semibold">{t.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t.blurb}</p>
                <p className="mt-4 font-mono text-xs tabular-nums text-faint">
                  {n}/{list.length} · {list.length} 课
                </p>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg bg-paper p-5 shadow-(--shadow-border)">
            <h2 className="font-display text-lg font-semibold">入职六日</h2>
            <p className="mt-1 text-sm text-muted">
              {TOTAL_LESSONS} 课，按天走。读完打勾，顶栏是总进度。
            </p>
            <div className="mt-4 space-y-6">
              {DAYS.map((d) => {
                const lessons = d.items
                  .map((it) => getLesson(it.track, it.slug))
                  .filter((l): l is NonNullable<typeof l> => Boolean(l));
                const n = lessons.filter((l) => completed[lessonId(l.track, l.slug)]).length;
                const mins = lessons.reduce((s, l) => s + l.minutes, 0);
                return (
                  <div key={d.id}>
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-mono text-[0.6875rem] tracking-wider text-accent">
                        {d.title}
                      </p>
                      <p className="font-mono text-[0.6875rem] tabular-nums text-faint">
                        {n}/{lessons.length} · {mins} 分
                      </p>
                    </div>
                    <p className="mb-1.5 text-xs text-muted">{d.blurb}</p>
                    <ol className="space-y-0.5">
                      {lessons.map((l, i) => {
                        const id = lessonId(l.track, l.slug);
                        const isDone = Boolean(completed[id]);
                        return (
                          <li key={id}>
                            <Link
                              to="/learn/$track/$slug"
                              params={{ track: l.track, slug: l.slug }}
                              className="flex min-h-10 items-center gap-3 rounded-sm px-2 hover:bg-paper-2"
                            >
                              <span className="w-6 font-mono text-xs tabular-nums text-faint">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-sm">{l.title}</span>
                              <span className="hidden font-mono text-[0.6875rem] text-faint sm:inline">
                                {l.minutes} 分
                              </span>
                              {isDone ? (
                                <span className="text-xs text-ok">已读</span>
                              ) : (
                                <span className="text-xs text-faint">未读</span>
                              )}
                            </Link>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/cheatsheet"
              className="rounded-lg bg-paper p-5 shadow-(--shadow-border) transition-[transform] duration-150 hover:-translate-y-0.5"
            >
              <ListChecks className="size-5 text-accent" />
              <h2 className="mt-3 font-display text-lg font-semibold">对照速查</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                Vue2/3、Element UI/Plus、Router、Pinia、日期金额、提交安全。
              </p>
            </Link>
            <Link
              to="/glossary"
              className="rounded-lg bg-paper p-5 shadow-(--shadow-border) transition-[transform] duration-150 hover:-translate-y-0.5"
            >
              <h2 className="font-display text-lg font-semibold">术语表</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                核保、保全、标的、字典、网关。站会听得懂。
              </p>
            </Link>
            <Link
              to="/quiz"
              className="rounded-lg bg-paper p-5 shadow-(--shadow-border) transition-[transform] duration-150 hover:-translate-y-0.5"
            >
              <h2 className="font-display text-lg font-semibold">
                {quizQuestions.length} 道现场坑题
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                $set、金额、日期、401、审批抢先改状态、FormData、XSS、防重。
              </p>
            </Link>
            <a
              href="https://github.com/suntianjing/xianchang-shouce"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-paper p-5 shadow-(--shadow-border) transition-[transform] duration-150 hover:-translate-y-0.5"
            >
              <Download className="size-5 text-accent" />
              <h2 className="mt-3 font-display text-lg font-semibold">仓库地址</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                git clone 后 PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install && npm run dev。
              </p>
            </a>
          </div>
        </section>
      </main>
    </AppShell>
  );
}

function Stamp() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-5 right-5 rotate-12 border-2 border-accent px-2.5 py-1 font-display text-xs tracking-[0.25em] text-accent/80 sm:top-8 sm:right-8 sm:text-sm"
    >
      入职
    </div>
  );
}
