import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { searchIndex, type SearchHit } from "@/lib/search";
import { cn } from "@/lib/utils";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const hits = useMemo(() => searchIndex(q), [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function close() {
    setOpen(false);
    setQ("");
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQ("");
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="flex h-11 w-full items-center gap-2 rounded-sm bg-paper px-3 text-sm text-faint shadow-(--shadow-border) hover:text-muted md:w-64"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">搜索课、坑、速查</span>
          <kbd className="hidden rounded-xs bg-paper-2 px-1.5 py-0.5 font-mono text-[0.6875rem] text-faint md:inline">
            Ctrl K
          </kbd>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/35" />
        <Dialog.Content className="fixed top-[12vh] left-1/2 z-50 w-[min(36rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-lg bg-paper p-3 shadow-(--shadow-border) outline-none">
          <Dialog.Title className="sr-only">搜索</Dialog.Title>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="试一下：keep-alive、金额、$set、401"
            className="h-12 w-full rounded-sm bg-bg px-3 text-sm outline-none placeholder:text-faint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
          <ul className="mt-2 max-h-[50vh] overflow-y-auto">
            {q.trim() && hits.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted">没有匹配。换个词，比如「表格」或「Pinia」。</li>
            ) : null}
            {hits.map((h) => (
              <li key={h.href + h.title}>
                <HitLink hit={h} onPick={close} />
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function HitLink({ hit, onPick }: { hit: SearchHit; onPick: () => void }) {
  const className = cn(
    "flex w-full flex-col items-start gap-0.5 rounded-sm px-3 py-2.5 text-left hover:bg-paper-2",
  );
  const body = (
    <>
      <span className="font-mono text-[0.6875rem] text-accent">{hit.kicker}</span>
      <span className="text-sm font-medium">{hit.title}</span>
      <span className="line-clamp-1 text-xs text-muted">{hit.snippet}</span>
    </>
  );

  if (hit.href.startsWith("/learn/")) {
    const parts = hit.href.split("/");
    const track = parts[2] ?? "vue2";
    const slug = parts[3] ?? "options-api";
    return (
      <Link
        to="/learn/$track/$slug"
        params={{ track, slug }}
        className={className}
        onClick={onPick}
      >
        {body}
      </Link>
    );
  }
  if (hit.href.startsWith("/cheatsheet")) {
    return (
      <Link to="/cheatsheet" className={className} onClick={onPick}>
        {body}
      </Link>
    );
  }
  return (
    <Link to="/quiz" className={className} onClick={onPick}>
      {body}
    </Link>
  );
}
