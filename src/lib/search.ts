import { allLessons } from "@/lib/content/catalog";
import { quizQuestions } from "@/lib/content/quiz";
import { cheatGroups } from "@/lib/content/cheatsheet";
import { glossaryGroups } from "@/lib/content/glossary";

export type SearchHit = {
  href: string;
  kicker: string;
  title: string;
  snippet: string;
};

export function searchIndex(q: string): SearchHit[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const hits: SearchHit[] = [];

  for (const l of allLessons()) {
    const blob = [l.title, l.kicker, l.summary, ...l.takeaways].join("\n");
    if (blob.toLowerCase().includes(needle)) {
      hits.push({
        href: `/learn/${l.track}/${l.slug}`,
        kicker: l.track === "vue2" ? "Vue2" : l.track === "vue3" ? "Vue3" : "现场",
        title: l.title,
        snippet: l.summary,
      });
    }
  }

  if ("速查对照element pinia router".includes(needle) || needle.length >= 2) {
    for (const g of cheatGroups) {
      const blob = [g.title, g.caption, ...g.rows.flat()].join("\n");
      if (blob.toLowerCase().includes(needle)) {
        hits.push({
          href: `/cheatsheet#${g.id}`,
          kicker: "速查",
          title: g.title,
          snippet: g.caption,
        });
      }
    }
  }

  for (const qz of quizQuestions) {
    const blob = [qz.topic, qz.question, ...qz.options].join("\n");
    if (blob.toLowerCase().includes(needle)) {
      hits.push({
        href: `/quiz?focus=${qz.id}`,
        kicker: "测验",
        title: qz.topic,
        snippet: qz.question,
      });
    }
  }

  for (const g of glossaryGroups) {
    for (const item of g.items) {
      const blob = [item.term, item.def, item.tip ?? ""].join("\n");
      if (blob.toLowerCase().includes(needle)) {
        hits.push({
          href: `/glossary#${g.id}`,
          kicker: "术语",
          title: item.term,
          snippet: item.def,
        });
      }
    }
  }

  return hits.slice(0, 12);
}
