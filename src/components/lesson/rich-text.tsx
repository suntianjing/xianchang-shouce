import { cn } from "@/lib/utils";

function tokenize(text: string) {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter((p) => p.length > 0);
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className={cn("space-y-3 text-[0.9375rem] leading-relaxed text-ink", className)}>
      {paragraphs.map((para, i) => (
        <p key={i} className="text-pretty">
          {tokenize(para).map((part, j) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={j} className="font-medium">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={j}
                  className="rounded-xs bg-paper-2 px-1 py-0.5 font-mono text-[0.8125rem] text-accent"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return (
              <span key={j}>
                {part.split("\n").map((line, k, arr) => (
                  <span key={k}>
                    {line}
                    {k < arr.length - 1 ? <br /> : null}
                  </span>
                ))}
              </span>
            );
          })}
        </p>
      ))}
    </div>
  );
}
