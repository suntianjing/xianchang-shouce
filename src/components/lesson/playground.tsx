import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PLAYGROUND_CSS = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font: 14px/1.55 "Noto Sans SC", "PingFang SC", system-ui, sans-serif;
    color: #1a1614;
    background: #faf6ee;
    padding: 12px;
  }
  .demo { display: grid; gap: 10px; }
  .row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  p { margin: 0; }
  .em { font-family: "Noto Serif SC", serif; }
  b { font-weight: 600; color: #9b2335; }
  button {
    height: 36px; padding: 0 12px;
    border: 0; border-radius: 8px;
    background: #9b2335; color: #faf6ee;
    font: 500 13px/1 inherit; cursor: pointer;
  }
  button + button, button.ghost { background: #efe8d9; color: #1a1614; }
  button:disabled { opacity: 0.45; cursor: not-allowed; }
  input, select, textarea {
    height: 36px; min-width: 120px; padding: 0 8px;
    border: 1px solid #d8d0c3; border-radius: 8px;
    background: #fff; font: inherit; color: inherit;
  }
  textarea { height: auto; min-height: 64px; padding: 8px; width: 100%; }
  .hint { color: #6f675f; font-size: 12px; }
  .tag {
    display: inline-block; padding: 2px 8px; border-radius: 4px;
    background: #efe8d9; font-size: 12px;
  }
  table.grid { border-collapse: collapse; width: 100%; font-size: 13px; }
  table.grid th, table.grid td {
    border-bottom: 1px solid #d8d0c3; padding: 6px 8px; text-align: left;
  }
`;

function srcdoc(version: 2 | 3, template: string, script: string, components?: string) {
  if (version === 3) {
    const comps = components?.trim() ? `components: { ${components} },` : "";
    return `<!doctype html><html><head><meta charset="utf-8"/><style>${PLAYGROUND_CSS}</style></head><body>
<div id="app"></div>
<script src="/vendor/vue3.global.js"><\/script>
<script>
try {
  const { createApp, ref, reactive, computed, watch, watchEffect, onMounted, onUnmounted, nextTick, provide, inject, shallowRef, markRaw, toRaw } = Vue;
  createApp({
    ${comps}
    setup() {
      ${script}
    },
    template: ${JSON.stringify(template)}
  }).mount('#app');
} catch (e) {
  document.body.innerHTML = '<pre style="color:#9b2335;white-space:pre-wrap">'+ (e && e.message ? e.message : e) +'</pre>';
}
function report() {
  parent.postMessage({ type: 'vue-demo-h', h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) }, '*');
}
report();
setTimeout(report, 60);
new ResizeObserver(report).observe(document.body);
<\/script></body></html>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"/><style>${PLAYGROUND_CSS}</style></head><body>
<div id="app"></div>
<script src="/vendor/vue2.min.js"><\/script>
<script>
try {
  new Vue({
    el: '#app',
    ${script},
    template: ${JSON.stringify(template)}
  });
} catch (e) {
  document.body.innerHTML = '<pre style="color:#9b2335;white-space:pre-wrap">'+ (e && e.message ? e.message : e) +'</pre>';
}
function report() {
  parent.postMessage({ type: 'vue-demo-h', h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight) }, '*');
}
report();
setTimeout(report, 60);
new ResizeObserver(report).observe(document.body);
<\/script></body></html>`;
}

export function Playground({
  title,
  version,
  template,
  script,
  hint,
  components,
}: {
  title: string;
  version: 2 | 3;
  template: string;
  script: string;
  hint?: string;
  components?: string;
}) {
  const [nonce, setNonce] = useState(0);
  const [height, setHeight] = useState(200);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const html = useMemo(
    () => srcdoc(version, template, script, components),
    [version, template, script, components, nonce],
  );

  useEffect(() => {
    function onMsg(ev: MessageEvent) {
      if (ev.source !== frameRef.current?.contentWindow) return;
      if (ev.data && ev.data.type === "vue-demo-h" && typeof ev.data.h === "number") {
        setHeight(Math.min(Math.max(ev.data.h + 4, 120), 560));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <section className="max-w-full min-w-0 overflow-hidden rounded-lg bg-paper shadow-(--shadow-border)">
      <div className="flex h-11 items-center justify-between border-b border-line px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="font-mono text-[0.6875rem] text-accent">运行</span>
          <h3 className="truncate text-sm font-medium">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[0.6875rem] text-faint">Vue {version}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-8"
            aria-label="重置演示"
            onClick={() => setNonce((n) => n + 1)}
          >
            <RotateCcw className="size-3.5" />
          </Button>
        </div>
      </div>
      <iframe
        key={nonce}
        ref={frameRef}
        title={title}
        sandbox="allow-scripts allow-same-origin"
        srcDoc={html}
        className={cn("block w-full bg-paper")}
        style={{ height }}
      />
      {hint ? (
        <p className="border-t border-line px-3 py-2 text-xs leading-relaxed text-muted">{hint}</p>
      ) : null}
    </section>
  );
}
