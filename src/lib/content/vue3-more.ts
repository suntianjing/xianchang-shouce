import type { Lesson } from "./types";

export const vue3More: Lesson[] = [
  {
    slug: "provide-inject",
    track: "vue3",
    title: "provide / inject（对照 Vue2）",
    kicker: "这次是响应的",
    minutes: 8,
    summary:
      "Vue3 提供 ref / reactive 后，后代 inject 到的会跟着变。用 symbol 或 const 字符串当 key，避免和别的库撞名。",
    takeaways: [
      "provide('key', ref) ；inject 得到的仍是那份 ref",
      "inject('key', defaultValue) 给默认，避免深层可选依赖炸掉",
      "key 用 Symbol 或注入专用的 const，不要散落魔法字符串",
      "仍不要用 getCurrentInstance().parent 爬树",
    ],
    sections: [
      {
        type: "compare",
        title: "当前产品上下文",
        vue2: {
          code: `provide() {\n  return { ctx: this.ctx }\n}`,
        },
        vue3: {
          code: `export const ProductKey: InjectionKey<Ref<string>> = Symbol('product')\n\nconst productCode = ref('C001')\nprovide(ProductKey, productCode)\n\n// 后代\nconst productCode = inject(ProductKey)\nif (!productCode) throw new Error('必须放在产品页里')`,
        },
      },
      {
        type: "playground",
        title: "Vue3：父改 ref，子跟着变",
        version: 3,
        components: `Child: {\n      setup() {\n        const product = inject('product')\n        return { product }\n      },\n      template: '<p>子组件 inject = <b>{{ product }}</b></p>'\n    }`,
        template: `<div class=\"demo\">\n  <p>父 <b>{{ product }}</b></p>\n  <div class=\"row\">\n    <button @click=\"setCode('D002')\">改成 D002</button>\n    <button @click=\"setCode('C001')\">改回 C001</button>\n  </div>\n  <Child />\n</div>`,
        script: `const product = ref('C001')\nprovide('product', product)\nfunction setCode(v) { product.value = v }\nreturn { product, setCode }`,
        hint: "对照 Vue2 那一课：这里子会跟着变。因为提供的是 ref，不是字符串快照。",
      },
      {
        type: "pitfall",
        title: "provide 了一个 props 解构出来的值",
        wrong: `const { productCode } = defineProps<{ productCode: string }>()\nprovide('productCode', productCode) // 普通 string`,
        right: `const props = defineProps<{ productCode: string }>()\nconst code = toRef(props, 'productCode')\nprovide('productCode', code)`,
        why: "解构 props 得到快照。父级路由 id 变了，深层表单还在用旧险种算保费。",
      },
    ],
  },
  {
    slug: "slots-fallthrough",
    track: "vue3",
    title: "插槽、透传与多根节点",
    kicker: "#default 和 $attrs",
    minutes: 8,
    summary:
      "Element Plus 自定义列是 #default=\"{ row }\"。封装组件要处理 attrs 透传、多根节点时 attrs 落到谁身上。",
    takeaways: [
      "具名插槽 #footer，作用域插槽 #default=\"{ row }\"",
      "Vue3 没有 $listeners，事件也在 $attrs",
      "多根节点不会自动继承 attrs，要 v-bind=\"$attrs\" 指到具体节点",
      "inheritAttrs: false 再手动绑，避免根节点多一堆 class",
    ],
    sections: [
      {
        type: "compare",
        title: "表格自定义列",
        vue2: {
          code: `<el-table-column label=\"操作\">\n  <template slot-scope=\"{ row }\">\n    <el-button @click=\"go(row)\">详情</el-button>\n  </template>\n</el-table-column>`,
        },
        vue3: {
          code: `<el-table-column label=\"操作\">\n  <template #default=\"{ row }\">\n    <el-button @click=\"go(row)\">详情</el-button>\n  </template>\n</el-table-column>`,
        },
        note: "全局搜 slot-scope 和 slot=\"xxx\"。Plus 迁移时这是机械替换，但作用域变量名要核对。",
      },
      {
        type: "table",
        title: "attrs 落点",
        columns: ["情况", "class / 事件去哪"],
        rows: [
          ["单根节点，inheritAttrs 默认 true", "自动绑到根节点"],
          ["单根 + inheritAttrs: false", "不自动绑，自己 v-bind=\"$attrs\""],
          ["多根节点", "不会自动绑，必须指到某一个"],
          ["封装 el-dialog", "绑到 el-dialog，不要绑在外层 div"],
        ],
      },
      {
        type: "pitfall",
        title: "多根片段导致 class 丢了",
        wrong: `<!-- TkField.vue 多根 -->\n<template>\n  <label>{{ label }}</label>\n  <el-input v-model=\"model\" />\n</template>\n<!-- 页面 <TkField class=\"w-full\" /> class 进哪都不知道 -->`,
        right: `<template>\n  <div class=\"tk-field\" v-bind=\"$attrs\">\n    <label>{{ label }}</label>\n    <el-input v-model=\"model\" />\n  </div>\n</template>\n<script setup>\ndefineOptions({ inheritAttrs: false })\n</script>`,
        why: "Vue3 允许多根，但这是封装时的新坑。控制台会警告 Extraneous non-props attributes。核保表单一长串自定义字段对不齐，先查这个。",
      },
    ],
  },
  {
    slug: "raw-shallow",
    track: "vue3",
    title: "markRaw、shallowRef、大对象",
    kicker: "别把 ECharts 做成响应式",
    minutes: 8,
    summary:
      "Proxy 很重。图表实例、xlsx 库、十万行原始数据，不该被 reactive 深度代理。提交给后端时用 toRaw，避免带上 __v_。",
    takeaways: [
      "echarts.init 的结果 markRaw 再存，或放模块级变量不要放 reactive",
      "大列表用 shallowRef，替换整份引用才触发更新",
      "axios 参数用 toRaw / JSON.parse(JSON.stringify())，不要把 Proxy 直接丢给老 jQuery SDK",
      "shallowRef 里改 row.xxx 不会触发视图，要触发就换新数组",
    ],
    sections: [
      {
        type: "compare",
        title: "图表实例",
        vue2: {
          lang: "js",
          code: `data() {\n  return { chart: null } // Vue2 不会深度观测 class 实例，相对安全\n}`,
        },
        vue3: {
          lang: "ts",
          code: `let chart: echarts.ECharts | null = null\nonMounted(() => {\n  chart = markRaw(echarts.init(el.value!))\n})\n// 或根本不要放进 ref / reactive`,
        },
      },
      {
        type: "pitfall",
        title: "reactive(list) 里 2 万行保单",
        wrong: `const state = reactive({\n  list: res.records // 2e4 条，每条再被深代理\n})\nstate.list[0].checked = true`,
        right: `const list = shallowRef(res.records)\nfunction toggle(i) {\n  const next = list.value.slice()\n  next[i] = { ...next[i], checked: !next[i].checked }\n  list.value = next\n}`,
        why: "深度代理大表，滚动和勾选都会卡。虚拟滚动之前，先别让 Vue 去追踪每一个字段。",
      },
      {
        type: "prose",
        title: "提交时脱掉 Proxy",
        body: "某些核心 SDK、或老的 `$.ajax`，碰到 Vue3 Proxy 会序列化失败或带上奇怪的 key。\n\n```ts\nawait api.save(toRaw(form))\n// 或 structuredClone(toRaw(form))\n```\n\n嵌套 ref 用 `toRaw` 只脱一层。深嵌套用 `JSON` 或 lodash `cloneDeep`。不要用 `JSON` 处理文件、undefined、日期（日期会变成字符串，要和后端格式对齐）。",
      },
    ],
  },
  {
    slug: "directive-transition",
    track: "vue3",
    title: "自定义指令与过渡",
    kicker: "v-permission 怎么写",
    minutes: 8,
    summary:
      "按钮权限常用自定义指令。Vue3 钩子改名了：mounted / updated / unmounted，不再是 bind / inserted。过渡用 Transition，名字也变了。",
    takeaways: [
      "指令钩子：created / beforeMount / mounted / beforeUpdate / updated / unmounted",
      "v-permission 没权限就去掉 DOM，不要 v-show（能被改回来）",
      "Transition 的 CSS 类从 v-enter 改成 v-enter-from",
      "keep-alive 和 Transition 包顺序：外 Transition 内 keep-alive",
    ],
    sections: [
      {
        type: "compare",
        title: "v-permission",
        vue2: {
          lang: "js",
          code: `Vue.directive('permission', {\n  inserted(el, binding) {\n    if (!has(binding.value)) {\n      el.parentNode && el.parentNode.removeChild(el)\n    }\n  }\n})`,
        },
        vue3: {
          lang: "ts",
          code: `app.directive('permission', {\n  mounted(el, binding) {\n    if (!has(binding.value)) el.remove()\n  },\n  updated(el, binding) {\n    if (!has(binding.value)) el.remove()\n  }\n})\n\n// <el-button v-permission=\"'claim:approve'\">通过</el-button>`,
        },
        note: "指令只能藏按钮。接口还是要鉴权。路由 meta.permission 在守卫里拦。三层都要。",
      },
      {
        type: "table",
        title: "过渡 class",
        columns: ["Vue2", "Vue3"],
        rows: [
          ["v-enter / v-enter-active / v-enter-to", "v-enter-from / v-enter-active / v-enter-to"],
          ["v-leave / v-leave-active / v-leave-to", "v-leave-from / v-leave-active / v-leave-to"],
          ["<transition>", "<Transition>（组件形式也可）"],
          ["<transition-group>", "<TransitionGroup>"],
        ],
      },
      {
        type: "pitfall",
        title: "用 v-show 做权限",
        wrong: `<el-button v-show=\"has('claim:approve')\">通过</el-button>`,
        right: `<el-button v-if=\"has('claim:approve')\">通过</el-button>\n<!-- 或 v-permission 直接卸 DOM -->`,
        why: "v-show 只是 display:none，审查元素能改出来再点。保险后台这是审计项。能看密文、能点通过，都必须真的不在 DOM 里。",
      },
    ],
  },
];
