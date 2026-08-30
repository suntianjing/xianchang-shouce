import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { LessonSections } from "@/components/lesson/sections";
import { Button } from "@/components/ui/button";
import { dayOf, getLesson, isTrackId, neighbors } from "@/lib/content/catalog";
import { quizzesForLesson } from "@/lib/content/quiz";
import { lessonId, useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/learn/$track/$slug")({
  loader: ({ params }) => {
    if (!isTrackId(params.track) || !getLesson(params.track, params.slug)) {
      throw notFound();
    }
  },
  component: LessonPage,
});

function LessonPage() {
  const { track, slug } = Route.useParams();
  const lesson = getLesson(track, slug);
  if (!lesson) throw notFound();

  const { prev, next } = neighbors(track, slug);
  const day = dayOf(lesson.track, lesson.slug);
  const related = quizzesForLesson(lesson.track, lesson.slug);
  const id = lessonId(lesson.track, lesson.slug);
  const done = useProgress((s) => Boolean(s.completed[id]));
  const markComplete = useProgress((s) => s.markComplete);
  const markIncomplete = useProgress((s) => s.markIncomplete);
  const setLast = useProgress((s) => s.setLastLesson);

  useEffect(() => {
    setLast({ track: lesson.track, slug: lesson.slug });
  }, [lesson.track, lesson.slug, setLast]);

  const kicker =
    lesson.track === "vue2" ? "Vue2 急救" : lesson.track === "vue3" ? "Vue3 对照" : "泰康现场";

  return (
    <AppShell>
      <article className="min-w-0 px-4 py-8 sm:px-6 lg:px-10">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-accent">
          {day ? `${day.title} · ${kicker}` : kicker}
        </p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{lesson.title}</h1>
          <p className="font-mono text-xs text-faint">{lesson.minutes} 分钟 · {lesson.kicker}</p>
        </div>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">{lesson.summary}</p>

        <aside className="mt-6 rounded-md bg-paper px-4 py-3 shadow-(--shadow-border)">
          <p className="font-mono text-[0.6875rem] tracking-wider text-muted">本课记住</p>
          <ul className="mt-2 space-y-1.5">
            {lesson.takeaways.map((t) => (
              <li key={t} className="flex gap-2 text-sm leading-relaxed">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="mt-10">
          <LessonSections sections={lesson.sections} />
        </div>

        {related.length ? <RelatedDrill questions={related} /> : null}

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant={done ? "outline" : "default"}
            onClick={() => (done ? markIncomplete(id) : markComplete(id))}
          >
            {done ? "标为未读" : "本课读完"}
            {done ? null : <Check className="size-4" />}
          </Button>
          <div className="flex flex-wrap gap-2">
            {prev ? (
              <Button asChild variant="outline">
                <Link to="/learn/$track/$slug" params={{ track: prev.track, slug: prev.slug }}>
                  <ArrowLeft className="size-4" />
                  {prev.title}
                </Link>
              </Button>
            ) : null}
            {next ? (
              <Button asChild>
                <Link to="/learn/$track/$slug" params={{ track: next.track, slug: next.slug }}>
                  {next.title}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/quiz">去做测验</Link>
              </Button>
            )}
          </div>
        </div>
      </article>
    </AppShell>
  );
}

function RelatedDrill({
  questions,
}: {
  questions: ReturnType<typeof quizzesForLesson>;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  return (
    <section className="mt-10 rounded-lg bg-paper p-5 shadow-(--shadow-border)">
      <h2 className="font-display text-lg font-semibold">本课坑题</h2>
      <p className="mt-1 text-sm text-muted">点开看选项和解析。完整测验在顶栏。</p>
      <ul className="mt-4 space-y-3">
        {questions.map((q) => {
          const shown = open[q.id];
          return (
            <li key={q.id}>
              <button
                type="button"
                className="w-full rounded-md px-3 py-2.5 text-left hover:bg-paper-2"
                onClick={() => setOpen((s) => ({ ...s, [q.id]: !s[q.id] }))}
              >
                <p className="text-sm font-medium leading-relaxed">{q.question}</p>
                {shown ? (
                  <div className="mt-2 space-y-1">
                    {q.options.map((opt, idx) => (
                      <p
                        key={opt}
                        className={cn(
                          "text-sm leading-relaxed",
                          idx === q.answer ? "text-ok" : "text-muted",
                        )}
                      >
                        {String.fromCharCode(65 + idx)}. {opt}
                      </p>
                    ))}
                    <p className="pt-1 text-sm leading-relaxed text-muted">{q.explain}</p>
                  </div>
                ) : (
                  <p className="mt-1 font-mono text-[0.6875rem] text-faint">展开答案</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
