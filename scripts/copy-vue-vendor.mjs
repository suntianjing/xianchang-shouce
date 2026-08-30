#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const destDir = join(root, "public", "vendor");
mkdirSync(destDir, { recursive: true });

const copies = [
  [join(root, "node_modules", "vue2", "dist", "vue.min.js"), join(destDir, "vue2.min.js")],
  [join(root, "node_modules", "vue", "dist", "vue.global.js"), join(destDir, "vue3.global.js")],
];

for (const [src, dest] of copies) {
  if (!existsSync(src)) {
    console.warn(`[copy-vue-vendor] skip, missing ${src}`);
    continue;
  }
  copyFileSync(src, dest);
}
