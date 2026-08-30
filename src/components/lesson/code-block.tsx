import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";
import type { CodeLang } from "@/lib/content/types";
import { highlight } from "@/lib/highlight";
import { cn } from "@/lib/utils";

export function CodeBlock({
  code,
  lang = "vue",
  caption,
  className,
}: {
  code: string;
  lang?: CodeLang;
  caption?: string;
  className?: string;
}) {
  const html = useMemo(() => highlight(code, lang), [code, lang]);
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code.replace(/^\n+|\n+$/g, ""));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard may be blocked in some embeds */
    }
  }

  return (
    <div className={cn("max-w-full min-w-0 overflow-hidden rounded-md bg-code text-code-fg shadow-(--shadow-border)", className)}>
      <div className="flex h-9 items-center justify-between border-b border-white/8 px-3">
        <span className="truncate font-mono text-[0.6875rem] tracking-wide text-faint">
          {caption ?? lang}
        </span>
        <button
          type="button"
          onClick={copy}
          className="inline-flex size-8 items-center justify-center rounded-xs text-faint hover:text-code-fg"
          aria-label="复制代码"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[0.75rem] leading-relaxed">
        <code dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  );
}
