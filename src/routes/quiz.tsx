import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { quizQuestions } from "@/lib/content/quiz";
import { useProgress } from "@/lib/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/quiz")({ component: QuizPage });

type Mode = "idle" | "run" | "done";

function QuizPage() {
  const [mode, setMode] = useState<Mode>("idle");
  const [ids, setIds] = useState<string[]>([]);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const markQuiz = useProgress((s) => s.markQuiz);
  const quizWrong = useProgress((s) => s.quizWrong);
  const resetQuiz = useProgress((s) => s.resetQuiz);

  const wrongIds = useMemo(
    () => Object.entries(quizWrong).filter(([, v]) => v).map(([k]) => k),
    [quizWrong],
  );

  function start(kind: "all" | "quick" | "wrong") {
    let pool = quizQuestions.map((q) => q.id);
    if (kind === "quick") pool = shuffle(pool).slice(0, 8);
    if (kind === "wrong") pool = wrongIds.length ? wrongIds : shuffle(pool).slice(0, 8);
    if (kind === "all") pool = [...pool];
    setIds(pool);
    setI(0);
    setPicked(null);
    setScore(0);
    setMode("run");
  }

  const current = quizQuestions.find((q) => q.id === ids[i]);
  const total = ids.length;

  function choose(idx: number) {
    if (picked !== null || !current) return;
    setPicked(idx);
    const ok = idx === current.answer;
    if (ok) setScore((s) => s + 1);
    markQuiz(current.id, ok);
  }

  function next() {
    if (i + 1 >= total) {
      setMode("done");
      return;
    }
    setI((n) => n + 1);
    setPicked(null);
  }

  return (
    <AppShell>
      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-accent">DRILL</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">坑题测验</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          核保、列表、联调、审批、上传导出、日期脱敏、微前端。看代码选结果，选完有解析。
        </p>

        {mode === "idle" ? (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <StartCard title={`全部 ${quizQuestions.length} 题`} desc="过一遍完整清单。" onClick={() => start("all")} />
            <StartCard title="快速 8 题" desc="摸底用，随机抽。" onClick={() => start("quick")} />
            <StartCard
              title={wrongIds.length ? `只做错题（${wrongIds.length}）` : "还没有错题"}
              desc="从本机记录里抽出上次答错的。"
              onClick={() => start("wrong")}
              disabled={wrongIds.length === 0}
            />
          </div>
        ) : null}

        {mode === "run" && current ? (
          <section className="mt-8 max-w-2xl">
            <div className="mb-4 flex items-center justify-between font-mono text-xs tabular-nums text-muted">
              <span>
                {i + 1} / {total}
              </span>
              <span>{current.topic}</span>
            </div>
            <Progress value={((i + (picked !== null ? 1 : 0)) / total) * 100} />
            <h2 className="mt-6 font-display text-xl font-semibold leading-snug">{current.question}</h2>
            {current.code ? (
              <pre className="mt-4 overflow-x-auto rounded-md bg-code p-3 font-mono text-[0.75rem] text-code-fg">
                {current.code}
              </pre>
            ) : null}
            <ul className="mt-5 space-y-2">
              {current.options.map((opt, idx) => {
                const isPick = picked === idx;
                const isAns = picked !== null && idx === current.answer;
                const isBad = isPick && idx !== current.answer;
                return (
                  <li key={opt}>
                    <button
                      type="button"
                      onClick={() => choose(idx)}
                      className={cn(
                        "flex min-h-12 w-full items-start gap-3 rounded-md bg-paper px-3 py-3 text-left text-sm leading-relaxed shadow-(--shadow-border)",
                        isAns && "bg-ok/10",
                        isBad && "bg-accent-soft",
                      )}
                    >
                      <span className="mt-0.5 font-mono text-xs text-faint">{String.fromCharCode(65 + idx)}</span>
                      <span>{opt}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            {picked !== null ? (
              <div className="mt-5 rounded-md bg-paper p-4 shadow-(--shadow-border)">
                <p className={cn("font-medium", picked === current.answer ? "text-ok" : "text-accent")}>
                  {picked === current.answer ? "正确" : "不对"}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted">{current.explain}</p>
                {current.related ? (
                  <Link
                    to="/learn/$track/$slug"
                    params={current.related}
                    className="mt-3 inline-flex text-sm text-accent hover:underline"
                  >
                    去看对应一课
                  </Link>
                ) : null}
                <div className="mt-4">
                  <Button type="button" onClick={next}>
                    {i + 1 >= total ? "看结果" : "下一题"}
                  </Button>
                </div>
              </div>
            ) : null}
          </section>
        ) : null}

        {mode === "done" ? (
          <section className="mt-8 max-w-xl rounded-lg bg-paper p-6 shadow-(--shadow-border)">
            <p className="font-mono text-xs text-muted">本次</p>
            <p className="mt-2 font-display text-4xl font-semibold tabular-nums">
              {score} / {total}
            </p>
            <p className="mt-2 text-sm text-muted">
              {score === total
                ? "全对。去对照速查扫一眼 Element 差异，就可以接任务了。"
                : "错题会留在本机。用「只做错题」再刷一轮。"}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="button" onClick={() => start("all")}>
                再来全部
              </Button>
              <Button type="button" variant="outline" onClick={() => start("wrong")} disabled={wrongIds.length === 0}>
                只做错题
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setMode("idle");
                }}
              >
                返回
              </Button>
              <Button type="button" variant="ghost" onClick={() => resetQuiz()}>
                清空答题记录
              </Button>
            </div>
          </section>
        ) : null}
      </main>
    </AppShell>
  );
}

function StartCard({
  title,
  desc,
  onClick,
  disabled,
}: {
  title: string;
  desc: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg bg-paper p-5 text-left shadow-(--shadow-border) disabled:opacity-40"
    >
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
    </button>
  );
}

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
