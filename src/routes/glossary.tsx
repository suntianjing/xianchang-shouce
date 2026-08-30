import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { glossaryGroups } from "@/lib/content/glossary";

export const Route = createFileRoute("/glossary")({ component: GlossaryPage });

function GlossaryPage() {
  return (
    <AppShell>
      <main className="px-4 py-8 sm:px-6 lg:px-10">
        <p className="font-mono text-[0.6875rem] tracking-[0.18em] text-accent">GLOSSARY</p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">术语表</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
          站会、需求、接口文档里会冒出来的词。听懂再改页面，少问一句「标的是什么」。
        </p>

        <div className="mt-8 space-y-10">
          {glossaryGroups.map((g) => (
            <section key={g.id} id={g.id} className="scroll-mt-20">
              <h2 className="font-display text-xl font-semibold">{g.title}</h2>
              <dl className="mt-4 divide-y divide-line rounded-lg bg-paper shadow-(--shadow-border)">
                {g.items.map((item) => (
                  <div key={item.term} className="px-4 py-3 sm:px-5">
                    <dt className="font-medium">{item.term}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-muted">{item.def}</dd>
                    {item.tip ? <p className="mt-1 text-xs text-faint">{item.tip}</p> : null}
                    {item.related ? (
                      <Link
                        to="/learn/$track/$slug"
                        params={item.related}
                        className="mt-2 inline-flex text-sm text-accent hover:underline"
                      >
                        相关一课
                      </Link>
                    ) : null}
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </main>
    </AppShell>
  );
}
