import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { cheatGroups } from "@/lib/content/cheatsheet";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/cheatsheet")({ component: CheatsheetPage });

function CheatsheetPage() {
  return (
    <AppShell>
      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-accent">CHEAT SHEET</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">对照速查</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          改存量页面、迁 Element Plus、对动态路由之前先扫一眼。不必背完，用的时候回来查。
        </p>

        <div className="mt-8 space-y-10">
          {cheatGroups.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-20">
              <h2 className="font-display text-xl font-semibold">{g.title}</h2>
              <p className="mt-1 text-sm text-muted">{g.caption}</p>
              <div className="mt-3 w-full max-w-full min-w-0 overflow-x-auto rounded-md bg-paper shadow-(--shadow-border)">
                <table className="w-full min-w-xl text-left text-sm">
                  <thead>
                    <tr className="border-b border-line text-muted">
                      {g.columns.map((c) => (
                        <th key={c} className="px-3 py-2.5 font-medium">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {g.rows.map((row, i) => (
                      <tr key={i} className="border-b border-line/70 last:border-0">
                        {row.map((cell, j) => (
                          <td
                            key={j}
                            className={cn(
                              "px-3 py-2.5 align-top font-mono text-[0.8125rem] leading-relaxed",
                              j === 0 ? "text-ink" : "text-muted",
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
