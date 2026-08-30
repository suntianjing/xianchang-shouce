import { AlertTriangle, ArrowLeftRight, Check } from "lucide-react";
import type { Section } from "@/lib/content/types";
import { CodeBlock } from "@/components/lesson/code-block";
import { Playground } from "@/components/lesson/playground";
import { RichText } from "@/components/lesson/rich-text";
import { cn } from "@/lib/utils";

export function LessonSections({ sections }: { sections: Section[] }) {
  return (
    <div className="min-w-0 space-y-8">
      {sections.map((s, i) => (
        <SectionView key={i} section={s} />
      ))}
    </div>
  );
}

function SectionView({ section }: { section: Section }) {
  switch (section.type) {
    case "prose":
      return (
        <section>
          {section.title ? (
            <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">{section.title}</h2>
          ) : null}
          <RichText text={section.body} />
        </section>
      );
    case "compare":
      return (
        <section className="min-w-0">
          <div className="mb-3 flex items-center gap-2">
            <ArrowLeftRight className="size-4 text-accent" />
            <h2 className="font-display text-xl font-semibold tracking-tight">{section.title}</h2>
          </div>
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <CodeBlock
              code={section.vue2.code}
              lang={section.vue2.lang ?? "vue"}
              caption={section.vue2.caption ?? "Vue 2"}
            />
            <CodeBlock
              code={section.vue3.code}
              lang={section.vue3.lang ?? "vue"}
              caption={section.vue3.caption ?? "Vue 3"}
            />
          </div>
          {section.note ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.note}</p>
          ) : null}
        </section>
      );
    case "playground":
      return (
        <Playground
          title={section.title}
          version={section.version}
          template={section.template}
          script={section.script}
          hint={section.hint}
          components={section.components}
        />
      );
    case "pitfall":
      return (
        <section className="min-w-0 rounded-lg bg-paper p-4 shadow-(--shadow-border) sm:p-5">
          <div className="mb-3 flex items-center gap-2 text-accent">
            <AlertTriangle className="size-4" />
            <h2 className="font-display text-lg font-semibold tracking-tight text-ink">{section.title}</h2>
          </div>
          <div className="grid min-w-0 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-wrong">错误</p>
              <CodeBlock code={section.wrong} lang="js" caption="会炸" />
            </div>
            <div>
              <p className="mb-1.5 font-mono text-[0.6875rem] uppercase tracking-wider text-ok">正确</p>
              <CodeBlock code={section.right} lang="js" caption="这样写" />
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted">{section.why}</p>
        </section>
      );
    case "scene":
      return (
        <section className="overflow-hidden rounded-lg bg-paper shadow-(--shadow-border)">
          <div className="grid min-w-0 gap-0 md:grid-cols-3">
            <SceneCol kicker="需求" body={section.demand} />
            <SceneCol kicker="会踩" body={section.trap} tone="warn" />
            <SceneCol kicker="写法" body={section.fix} tone="ok" code />
          </div>
          {section.extra ? (
            <div className="border-t border-line px-4 py-3 text-sm leading-relaxed text-muted">
              {section.extra}
            </div>
          ) : null}
        </section>
      );
    case "table":
      return (
        <section>
          {section.title ? (
            <h2 className="mb-3 font-display text-xl font-semibold tracking-tight">{section.title}</h2>
          ) : null}
          <div className="w-full max-w-full min-w-0 overflow-x-auto rounded-md bg-paper shadow-(--shadow-border)">
            <table className="w-full min-w-xl text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  {section.columns.map((c) => (
                    <th key={c} className="px-3 py-2.5 font-medium">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.rows.map((row, i) => (
                  <tr key={i} className="border-b border-line/70 last:border-0">
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={cn(
                          "px-3 py-2.5 align-top leading-relaxed",
                          j === 0 ? "font-medium" : "text-muted",
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
      );
  }
}

function SceneCol({
  kicker,
  body,
  tone,
  code,
}: {
  kicker: string;
  body: string;
  tone?: "warn" | "ok";
  code?: boolean;
}) {
  return (
    <div className="min-w-0 border-b border-line p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <p
        className={cn(
          "mb-2 font-mono text-[0.6875rem] uppercase tracking-wider",
          tone === "warn" ? "text-warn" : tone === "ok" ? "text-ok" : "text-accent",
        )}
      >
        {tone === "ok" ? <Check className="mr-1 inline size-3" /> : null}
        {kicker}
      </p>
      {code ? (
        <pre className="max-w-full overflow-x-auto font-mono text-[0.75rem] leading-relaxed text-ink">{body}</pre>
      ) : (
        <p className="text-sm leading-relaxed">{body}</p>
      )}
    </div>
  );
}
