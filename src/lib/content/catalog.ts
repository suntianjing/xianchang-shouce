import type { Lesson, TrackId, TrackMeta } from "./types";
import { vue2Lessons as vue2Core } from "./vue2";
import { vue2More } from "./vue2-more";
import { vue3Lessons as vue3Core } from "./vue3";
import { vue3More } from "./vue3-more";
import { sceneLessons as sceneCore } from "./scenes";
import { scenesMore } from "./scenes-more";
import { DAYS } from "./path";

export const TRACKS: TrackMeta[] = [
  {
    id: "vue2",
    title: "Vue2 急救",
    kicker: "第一、二天",
    blurb: "Options、响应式、过滤器、封装 Element、Vue CLI、provide、2.7 过渡。存量后台先过这一遍。",
  },
  {
    id: "vue3",
    title: "Vue3 对照",
    kicker: "第三、四天",
    blurb: "setup、Pinia、TS、Vite、provide、插槽透传、shallowRef。左边 Vue2，右边新写法。",
  },
  {
    id: "scene",
    title: "泰康现场",
    kicker: "第五、六天",
    blurb: "表单、大表、权限、金额、日期、审批、上传导出、脱敏、微前端、规范。",
  },
];

function pick(list: Lesson[], slugs: string[]): Lesson[] {
  const m = new Map(list.map((l) => [l.slug, l]));
  return slugs.map((s) => {
    const l = m.get(s);
    if (!l) throw new Error(`missing lesson ${list[0]?.track}:${s}`);
    return l;
  });
}

const vue2Ordered = pick([...vue2Core, ...vue2More], [
  "options-api", "reactivity", "lifecycle", "communicate", "slots-mixins", "directives", "filters-pipe",
  "vuex-router", "nexttick-gotchas", "attrs-wrap", "element-table-wrap", "webpack-cli", "devtools",
  "provide-inject", "bus-error", "vue27-bridge",
]);

const vue3Ordered = pick([...vue3Core, ...vue3More], [
  "script-setup", "reactivity", "lifecycle", "vmodel-emits", "composables", "pinia-router",
  "teleport-fragments", "watch-computed", "typescript", "async-suspense", "vite-tooling", "style-memo",
  "provide-inject", "slots-fallthrough", "raw-shallow", "directive-transition",
]);

const sceneOrdered = pick([...sceneCore, ...scenesMore], [
  "dynamic-form", "mega-table", "permission", "axios-gateway", "money", "dict", "keepalive", "joint-debug",
  "approval-flow", "date-range", "leave-guard", "submit-lock", "upload", "excel", "print", "echarts",
  "privacy-mask", "list-query", "richtext-xss", "remote-search", "qiankun", "coexist", "env-mock", "code-style",
]);

const all: Lesson[] = [...vue2Ordered, ...vue3Ordered, ...sceneOrdered];
const byKey = new Map(all.map((l) => [`${l.track}:${l.slug}`, l]));

export function allLessons() {
  return all;
}
export function lessonsOf(track: TrackId) {
  return all.filter((l) => l.track === track);
}
export function getLesson(track: string, slug: string) {
  return byKey.get(`${track}:${slug}`) ?? null;
}
export function neighbors(track: string, slug: string) {
  const i = all.findIndex((l) => l.track === track && l.slug === slug);
  return {
    prev: i > 0 ? all[i - 1] : null,
    next: i >= 0 && i < all.length - 1 ? all[i + 1] : null,
  };
}
export const TOTAL_LESSONS = all.length;
export function isTrackId(v: string): v is TrackId {
  return v === "vue2" || v === "vue3" || v === "scene";
}
export function dayOf(track: string, slug: string) {
  return DAYS.find((d) => d.items.some((it) => it.track === track && it.slug === slug)) ?? null;
}
for (const d of DAYS) {
  for (const it of d.items) {
    if (!getLesson(it.track, it.slug)) {
      throw new Error(`path points at missing ${it.track}:${it.slug}`);
    }
  }
}
export { DAYS };
