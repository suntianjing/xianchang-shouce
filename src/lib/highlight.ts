import hljs from "highlight.js/lib/core";
import xml from "highlight.js/lib/languages/xml";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import type { CodeLang } from "@/lib/content/types";

hljs.registerLanguage("xml", xml);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const langMap: Record<CodeLang, string> = {
  vue: "xml",
  html: "xml",
  js: "javascript",
  ts: "typescript",
};

export function highlight(code: string, lang: CodeLang = "vue") {
  try {
    return hljs.highlight(code.replace(/^\n+|\n+$/g, ""), {
      language: langMap[lang],
      ignoreIllegals: true,
    }).value;
  } catch {
    return escapeHtml(code);
  }
}
