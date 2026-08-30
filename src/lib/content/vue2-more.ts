import type { Lesson } from "./types";

export const vue2More: Lesson[] = [
  {
    slug: "filters-pipe",
    track: "vue2",
    title: "过滤器：金额、日期、脱敏",
    kicker: "模板里的竖线",
    minutes: 8,
    summary:
      "存量页面到处是 {{ amount | yuan }}、{{ date | ymd }}。Vue3 删了过滤器，但 Vue2 项目还得会读、会加，别在 filter 里调接口。",
    takeaways: [
      "filter 只做纯函数：进什么出什么，不要 this.$http",
      "全局 Vue.filter 和组件 filters 都能用；同名时局部优先",
      "链式 {{ v | yuan | pad }} 从左往右",
      "Vue3 改成方法或 computed，不要再写 |",
    ],
    sections: [
      {
        type: "prose",
        title: "为什么保险后台特别爱过滤器",
        body: "保费要两位小数、保单号要等宽、证件要脱敏、时间要 `YYYY-MM-DD`。这些在表格每一行都出现。Vue2 用 `|` 写在模板里最省事。\n\n过滤器 **拿不到组件实例做异步**。你在 filter 里请求字典，表格一滚就会打爆网关。字典回显用 computed map，不要用 filter。",
      },
      {
        type: "compare",
        title: "分转元",
        vue2: {
          code: `// main.js\nVue.filter('yuan', (fen) => (Math.round(Number(fen) || 0) / 100).toFixed(2))\n\n// 模板\n{{ row.premiumFen | yuan }} 元\n{{ row.idNo | maskId }}`,
        },
        vue3: {
          code: `function yuan(fen: number) {\n  return (Math.round(fen || 0) / 100).toFixed(2)\n}\nfunction maskId(v: string) {\n  const s = String(v || '')\n  return s.length >= 10 ? s.slice(0, 3) + '***********' + s.slice(-4) : s\n}\n\n// 模板\n{{ yuan(row.premiumFen) }} 元`,
        },
        note: "Vue3 没有 |。全局搜 `\\| ` 是迁移清单上的一项。",
      },
      {
        type: "playground",
        title: "跑一下：| yuan 和脱敏",
        version: 2,
        template: `<div class=\"demo\">\n  <p>分 <b>{{ fen }}</b> → 元 <b>{{ fen | yuan }}</b></p>\n  <p>证件 {{ idNo | maskId }}</p>\n  <button @click=\"fen += 50\">加 0.50 元</button>\n</div>`,
        script: `data() {\n    return { fen: 19990, idNo: '110101199001011234' }\n  },\n  filters: {\n    yuan(v) { return (Math.round(Number(v) || 0) / 100).toFixed(2) },\n    maskId(v) {\n      v = String(v || '')\n      return v.length >= 10 ? v.slice(0, 3) + '***********' + v.slice(-4) : v\n    }\n  }`,
        hint: "点加价，元那一列应始终两位小数。真实项目这个函数放 filters/index.js，不要每个页面复制。",
      },
      {
        type: "pitfall",
        title: "filter 里发请求或读 Vuex",
        wrong: `Vue.filter('statusName', (code) => {\n  // 表格 50 行 × 滚动 = 打爆\n  return store.state.dict.map[code]\n})`,
        right: `computed: {\n  rows() {\n    return this.list.map((r) => ({\n      ...r,\n      statusLabel: this.dictMap[String(r.status)] || r.status\n    }))\n  }\n}`,
        why: "filter 在每次 render 都会跑。字典、权限、金额格式化可以；异步、store 订阅不行。",
      },
    ],
  },
  {
    slug: "provide-inject",
    track: "vue2",
    title: "provide / inject，别用 $parent",
    kicker: "跨层传参",
    minutes: 8,
    summary:
      "核保详情套了五层：页 → 卡片 → 抽屉 → 表单 → 输入。用 $parent.$parent 取产品代码，重构一次就全断。provide/inject 是正路，但 Vue2 默认不响应。",
    takeaways: [
      "祖先 provide，后代 inject，不要爬 $parent",
      "Vue2 提供的若是原始值，后代拿到的是快照，改了父级子级不动",
      "要响应就 provide 一个对象，改对象上的字段",
      "Vue3 提供 ref 才是响应的",
    ],
    sections: [
      {
        type: "compare",
        title: "把当前险种交给深层表单",
        vue2: {
          code: `// 页面\nprovide() {\n  return { ctx: this.ctx } // 给对象，不要给 this.productCode 字符串\n},\ndata() {\n  return { ctx: { productCode: 'C001' } }\n}\n\n// 深层\ninject: ['ctx']\n// this.ctx.productCode`,
        },
        vue3: {
          code: `const productCode = ref('C001')\nprovide('productCode', productCode)\n\n// 后代\nconst productCode = inject('productCode')\n// 模板里自动解包`,
        },
        note: "Vue2 的 provide() 只在初始化跑一次。return { product: this.productCode } 等于把当时的字符串拷走了。",
      },
      {
        type: "playground",
        title: "亲眼看：Vue2 注入的字符串不会更新",
        version: 2,
        template: `<div class=\"demo\">\n  <p>父级 productCode = <b>{{ productCode }}</b></p>\n  <div class=\"row\">\n    <button @click=\"productCode = 'D002'\">改成 D002</button>\n    <button @click=\"productCode = 'C001'\">改回 C001</button>\n  </div>\n  <Child />\n</div>`,
        script: `components: {\n    Child: {\n      inject: ['product'],\n      template: '<p>子组件 inject 到的 = <b>{{ product }}</b>（多半还是旧的）</p>'\n    }\n  },\n  data() {\n    return { productCode: 'C001' }\n  },\n  provide() {\n    return { product: this.productCode }\n  }`,
        hint: "点按钮，父变了子不变。这就是 Vue2 provide 的陷阱。要更新，provide 一个对象，改对象的字段。",
      },
      {
        type: "pitfall",
        title: "this.$parent.$parent.form",
        wrong: `this.$parent.$parent.submit()`,
        right: `// 事件上抛 $emit('submit')\n// 或 provide 一个 { submit } 方法\n// 或 Vuex / Pinia`,
        why: "加一层 layout、抽一次组件，$parent 链就错位。核保页被运营改过结构之后，这种代码会静默调到别人的方法。",
      },
    ],
  },
  {
    slug: "bus-error",
    track: "vue2",
    title: "EventBus 泄漏与错误边界",
    kicker: "$on 必须对称 $off",
    minutes: 8,
    summary:
      "存量喜欢 Vue.prototype.$bus = new Vue()。created 里 $on，destroyed 里不 $off，切页之后回调还在，会改到已经销毁的实例。",
    takeaways: [
      "$off 必须传入同一个函数引用，不能写匿名函数",
      "destroyed 里成对摘掉；keep-alive 用 deactivated 还是 destroyed 要想清楚",
      "Vue.config.errorHandler 能接到渲染错误，别只靠 window.onerror",
      "新代码不要再引入 bus，能 emit / store 就不要全局事件",
    ],
    sections: [
      {
        type: "compare",
        title: "跨页通知「核保已通过」",
        vue2: {
          lang: "js",
          code: `// main.js\nVue.prototype.$bus = new Vue()\n\n// 列表\ncreated() {\n  this._onPass = (id) => { this.refreshRow(id) }\n  this.$bus.$on('underwrite:pass', this._onPass)\n},\ndestroyed() {\n  this.$bus.$off('underwrite:pass', this._onPass)\n}`,
        },
        vue3: {
          lang: "ts",
          code: `// 不要 $on。用 Pinia 或\n// mitt / 提供一个 tiny emitter，在 onUnmounted 里 off\nimport mitt from 'mitt'\nexport const bus = mitt<{ pass: string }>()\n\nonMounted(() => bus.on('pass', onPass))\nonUnmounted(() => bus.off('pass', onPass))`,
        },
        note: "Vue3 实例去掉了 $on / $off / $once。从 Vue2 抄 bus 模式会直接运行时报错。",
      },
      {
        type: "pitfall",
        title: "$off 时写了另一个箭头函数",
        wrong: `created() {\n  this.$bus.$on('pass', (id) => this.refresh(id))\n},\ndestroyed() {\n  this.$bus.$off('pass') // 把别人的 pass 监听也摘了\n  // 或 $off('pass', (id) => this.refresh(id)) 对不上引用\n}`,
        right: `created() {\n  this._onPass = (id) => this.refresh(id)\n  this.$bus.$on('pass', this._onPass)\n},\ndestroyed() {\n  this.$bus.$off('pass', this._onPass)\n}`,
        why: "匿名函数每次都是新引用，摘不掉。无参 $off('pass') 会误伤同事件的其他页面。列表缓存一多，审核通过后会刷新到已经离开的页，控制台一堆「setState on destroyed vm」。",
      },
      {
        type: "table",
        title: "错误往哪挂",
        columns: ["钩子", "接到什么"],
        rows: [
          ["window.onerror / unhandledrejection", "原生、Promise，接不到 Vue 渲染栈"],
          ["Vue.config.errorHandler", "渲染函数、生命周期、watch 里抛的错"],
          ["errorCaptured", "子树里的错，返回 false 不再往上传"],
          ["路由 onError", "导航守卫、懒加载 chunk 失败"],
        ],
      },
    ],
  },
  {
    slug: "vue27-bridge",
    track: "vue2",
    title: "Vue 2.7 过渡写法",
    kicker: "能写 composition，仍是 Vue2",
    minutes: 8,
    summary:
      "有的仓库已经升到 2.7：能在 setup() 里写 ref，但 Element 还是 UI，没有 script setup 宏，也没有多根节点。别当成 Vue3。",
    takeaways: [
      "先看 package.json 的 vue 是 ^2.6、^2.7 还是 ^3",
      "2.7 的 setup() 要 return 暴露；没有 defineProps 宏",
      "2.6 要用 @vue/composition-api 插件，行为仍有差异",
      "组件、指令、v-model 仍然是 Vue2 的",
    ],
    sections: [
      {
        type: "table",
        title: "三个版本能写什么",
        columns: ["能力", "2.6", "2.7", "3"],
        rows: [
          ["Options API", "是", "是", "是"],
          ["setup() + ref", "要插件", "是", "是"],
          ["<script setup> 宏", "否", "实验/受限", "是"],
          ["多根节点", "否", "否", "是"],
          ["v-model:visible", "否，用 .sync", "否", "是"],
          ["Element Plus", "否", "否", "是"],
          ["this.$set", "要", "要", "不需要"],
        ],
      },
      {
        type: "compare",
        title: "2.7 里写 composition",
        vue2: {
          caption: "Vue 2.7 SFC",
          code: `<script>\nimport { ref, computed } from 'vue'\nexport default {\n  name: 'PremiumBox',\n  props: { price: Number },\n  setup(props) {\n    const seats = ref(1)\n    const premium = computed(() => seats.value * props.price)\n    function add() { seats.value += 1 }\n    return { seats, premium, add }\n  }\n}\n</script>`,
        },
        vue3: {
          caption: "Vue 3 script setup",
          code: `<script setup>\nimport { ref, computed } from 'vue'\nconst props = defineProps<{ price: number }>()\nconst seats = ref(1)\nconst premium = computed(() => seats.value * props.price)\nfunction add() { seats.value += 1 }\n</script>`,
        },
      },
      {
        type: "pitfall",
        title: "在 2.7 里贴 Vue3 多根节点",
        wrong: `<!-- Vue 2.7 组件 -->\n<template>\n  <el-form-item label=\"姓名\">...</el-form-item>\n  <el-form-item label=\"证件\">...</el-form-item>\n</template>`,
        right: `<template>\n  <div>\n    <el-form-item label=\"姓名\">...</el-form-item>\n    <el-form-item label=\"证件\">...</el-form-item>\n  </div>\n</template>`,
        why: "Vue2 模板必须单根。报错 Unexpected text / Adjacent JSX 时先数根节点，别怀疑 Element。",
      },
    ],
  },
];
