import type { Lesson } from "./types";

export const vue3Lessons: Lesson[] = [
  {
    slug: "script-setup",
    track: "vue3",
    title: "script setup 怎么对上 Options",
    kicker: "同一页面两种写法",
    minutes: 8,
    summary:
      "新项目几乎全是 <script setup>。变量、函数、import 的组件都会自动进模板。和 Vue2 的对应关系先记牢。",
    takeaways: [
      "顶层绑定自动暴露给模板，不必 return",
      "props / emits 要用 defineProps、defineEmits，它们是编译器宏，不用 import",
      "defineExpose 才把方法交给父级 $refs",
      "存量若是 2.6，不要硬上 setup",
    ],
    sections: [
      {
        type: "table",
        title: "Options → setup 速查",
        columns: ["Vue2 Options", "Vue3 setup", "注意"],
        rows: [
          ["data()", "ref / reactive", "模板自动解包 ref"],
          ["computed", "computed()", "要 .value 才能读"],
          ["methods", "function", "直接写"],
          ["watch", "watch / watchEffect", "默认不 immediate"],
          ["props", "defineProps()", "不要解构，会丢响应（除非 toRefs）"],
          ["this.$emit", "defineEmits()", "建议声明事件名"],
          ["this.$refs", "ref() 绑到模板 + defineExpose", "子方法默认不暴露"],
          ["mixins", "composable 函数", "见第五课"],
        ],
      },
      {
        type: "compare",
        title: "核保抽屉：开关 + 提交",
        vue2: {
          code: `export default {
  props: { visible: Boolean, caseId: String },
  methods: {
    close() { this.$emit('update:visible', false) },
    async submit() { /* ... */ this.close() }
  }
}`,
        },
        vue3: {
          code: `<script setup>
const props = defineProps({ caseId: String })
const open = defineModel({ type: Boolean })
async function submit() {
  // await save(props.caseId)
  open.value = false
}
defineExpose({ submit })
</script>`,
        },
      },
      {
        type: "playground",
        title: "setup 里 ref 在模板会解包",
        version: 3,
        template: `<div class="demo">
  <p>count 在脚本里是 ref，模板里直接 {{ count }}</p>
  <button @click="inc">+1</button>
  <button @click="reset">归零</button>
</div>`,
        script: `const count = ref(0)
function inc() { count.value += 1 }
function reset() { count.value = 0 }
return { count, inc, reset }`,
        hint: "注意：脚本里改值必须 count.value。模板里 ++ 能用是因为编译器帮你解包。",
      },
      {
        type: "pitfall",
        title: "解构 props 丢响应",
        wrong: `const { caseId } = defineProps({ caseId: String })
watch(caseId, load) // caseId 是一次性的普通 string`,
        right: `const props = defineProps({ caseId: String })
watch(() => props.caseId, load)
// 或 const { caseId } = toRefs(props)`,
        why: "解构那一瞬间取值，后面父级换了案件 id，子组件还在看旧单。核保抽屉切下一件时「数据不刷新」就是它。",
      },
    ],
  },
  {
    slug: "reactivity",
    track: "vue3",
    title: "ref / reactive / Proxy",
    kicker: "不用 Vue.set 了，但有新坑",
    minutes: 9,
    summary:
      "Vue3 用 Proxy，后加字段、按下标改数组都响应。新坑变成：ref 忘了 .value、reactive 被整体换掉、解构丢代理。",
    takeaways: [
      "基本类型用 ref，对象用 reactive 或 ref(object)",
      "reactive 不能替换整个对象，要改字段或改用 ref",
      "模板解包只在模板里发生，script 里必须 .value",
      "reactive 再套 ref 会解包，容易看懵，保持一层即可",
    ],
    sections: [
      {
        type: "compare",
        title: "同一份投保表单",
        vue2: {
          lang: "js",
          code: `data() {
  return { form: { name: '', extra: undefined } }
},
methods: {
  patch(res) {
    this.$set(this.form, 'idNo', res.idNo)
  }
}`,
        },
        vue3: {
          lang: "js",
          code: `const form = reactive({ name: '' })
function patch(res) {
  form.idNo = res.idNo // 直接加
}

// 若要整体替换：
const form = ref({ name: '' })
form.value = { ...form.value, ...res }`,
        },
      },
      {
        type: "playground",
        title: "reactive 被整个换掉",
        version: 3,
        template: `<div class="demo">
  <p>name: {{ form.name }}</p>
  <button @click="badReplace">整体换成新对象（不推荐）</button>
  <button @click="patch">改字段</button>
</div>`,
        script: `const form = reactive({ name: '张三' })
function badReplace() {
  // 这只换了局部变量，模板还绑着旧 proxy
  // 演示：我们故意不生效的写法没法在 setup return 后换绑定
  Object.assign(form, { name: '李四' })
}
function patch() {
  form.name = '王五'
}
return { form, badReplace, patch }`,
        hint: "reactive 要用改字段或 Object.assign 到同一个 proxy。真正的「form = { name: '李四' }」在 setup 里会丢掉响应，必须用 formRef.value = ...",
      },
      {
        type: "pitfall",
        title: "ref 对象在脚本里忘了 .value",
        wrong: `const list = ref([])
list.push(row)          // list.push is not a function
list = res.records      // 赋值给常量；且丢响应`,
        right: `list.value.push(row)
list.value = res.records`,
        why: "一进列表页就红字。Options 写惯了没有 .value，这是 Vue2 同学迁 Vue3 的第一周主旋律。",
      },
      {
        type: "table",
        title: "怎么选",
        columns: ["场景", "用", "原因"],
        rows: [
          ["开关、keyword、pageNum", "ref(0) / ref('')", "基本类型只能 ref"],
          ["一整份 form", "reactive 或 ref({})", "团队定一种，别混"],
          ["组件模板绑定", "ref 更省心（解包规则清晰）", "reactive 没有 .value，传递时易懵"],
          ["要整体替换的列表", "ref([])", "list.value = records"],
        ],
      },
    ],
  },
  {
    slug: "lifecycle",
    track: "vue3",
    title: "生命周期对照",
    kicker: "onMounted 写在哪",
    minutes: 6,
    summary:
      "钩子变成 onXxx 函数，只能在 setup 同步调用。异步回调里再写 onMounted 会报错。",
    takeaways: [
      "destroyed → onUnmounted，名字变了",
      "onMounted 必须写在 setup 同步作用域",
      "keep-alive 仍然用 onActivated",
      "ECharts / 地图务必 onUnmounted dispose",
    ],
    sections: [
      {
        type: "compare",
        title: "拉详情 + 图表",
        vue2: {
          lang: "js",
          code: `mounted() {
  this.chart = echarts.init(this.$el)
  this.load()
},
destroyed() {
  this.chart && this.chart.dispose()
}`,
        },
        vue3: {
          lang: "js",
          code: `const el = ref(null)
let chart
onMounted(() => {
  chart = echarts.init(el.value)
  load()
})
onUnmounted(() => {
  chart && chart.dispose()
})`,
        },
      },
      {
        type: "pitfall",
        title: "await 之后再注册钩子",
        wrong: `const props = defineProps({ id: String })
const res = await fetchDetail(props.id) // 顶层 await
onMounted(() => {
  draw(res)
})`,
        right: `onMounted(async () => {
  const res = await fetchDetail(props.id)
  draw(res)
})
// 若必须顶层 await，把 onMounted 写在 await 之前`,
        why: "script setup 的顶层 await 会推迟后续代码。onMounted 若出现在 await 之后，当前实例已经 mounted，钩子报 Unhandled error。保单详情页用 Suspense 时常见。",
      },
    ],
  },
  {
    slug: "vmodel-emits",
    track: "vue3",
    title: "v-model、emits、defineExpose",
    kicker: "组件接口变了",
    minutes: 8,
    summary:
      "一个组件可以多个 v-model。父级 $refs.xxx.submit() 在 setup 里默认拿不到，要 defineExpose。",
    takeaways: [
      "v-model 默认 modelValue / update:modelValue",
      "v-model:visible 取代 .sync",
      "emits 声明后，监听器不会掉进 $attrs",
      "父调子方法必须 defineExpose",
    ],
    sections: [
      {
        type: "compare",
        title: "弹窗 + 金额两个绑定",
        vue2: {
          code: `<PayDialog :visible.sync="open" :amount.sync="pay" />

<!-- 子 -->
props: { visible: Boolean, amount: Number }
this.$emit('update:visible', false)
this.$emit('update:amount', n)`,
        },
        vue3: {
          code: `<PayDialog v-model="open" v-model:amount="pay" />

<script setup>
const open = defineModel({ type: Boolean })
const amount = defineModel('amount', { type: Number })
</script>`,
        },
      },
      {
        type: "pitfall",
        title: "父组件 this.$refs.form.submit 是 undefined",
        wrong: `// 子 script setup 里写了 function submit() {}
// 父
this.$refs.form.submit()`,
        right: `// 子
function submit() { /* 校验并抛给接口 */ }
defineExpose({ submit })`,
        why: "setup 默认不把内部方法暴露给父。投保向导「下一步」去调子表单校验时会炸。Options API 没有这个问题。",
      },
      {
        type: "prose",
        body: "顺手记：`inheritAttrs: false` + `v-bind=\"$attrs\"` 在 Vue3 仍然有用。`emits: ['save']` 声明之后，`@save` 不会再作为原生监听器落到根节点上。没声明时，控制台会提示，Dialog 根节点误绑 click 会出现「点遮罩触发两次」。",
      },
    ],
  },
  {
    slug: "composables",
    track: "vue3",
    title: "Composable 替代 Mixin",
    kicker: "useXxx 怎么拆",
    minutes: 8,
    summary:
      "把「拉分页列表」「拉字典」「按钮权限」做成 useXxx()。比 mixin 可追踪：变量从哪来一眼能看到。",
    takeaways: [
      "useXxx 必须在 setup 同步调用，才能注册钩子",
      "返回的 ref 在组件里记得保持引用，不要解构丢 .value 语义",
      "副作用（watch、onUnmounted）写在 composable 内部",
      "不要一个 usePage 里塞 20 个职责",
    ],
    sections: [
      {
        type: "compare",
        title: "分页列表：mixin vs useTable",
        vue2: {
          lang: "js",
          code: `// mixin
export default {
  data() {
    return { list: [], page: 1, total: 0, loading: false }
  },
  methods: {
    async getList() {
      this.loading = true
      const res = await this.fetch({ page: this.page })
      this.list = res.records
      this.total = res.total
      this.loading = false
    }
  },
  created() { this.getList() }
}`,
        },
        vue3: {
          lang: "js",
          code: `export function useTable(fetcher) {
  const list = ref([])
  const page = ref(1)
  const total = ref(0)
  const loading = ref(false)
  async function getList() {
    loading.value = true
    try {
      const res = await fetcher({ page: page.value })
      list.value = res.records
      total.value = res.total
    } finally {
      loading.value = false
    }
  }
  onMounted(getList)
  return { list, page, total, loading, getList }
}

// 页面
const { list, page, total, loading, getList } = useTable(fetchClaimPage)`,
        },
      },
      {
        type: "pitfall",
        title: "在 click 回调里调用 useTable",
        wrong: `function onSearch() {
  const { getList } = useTable(fetchClaimPage) // 非法
  getList()
}`,
        right: `const { getList } = useTable(fetchClaimPage)
function onSearch() { getList() }`,
        why: "composable 里的 onMounted / watch 必须在 setup 阶段注册。放进点击事件会报 getCurrentInstance() 为空。",
      },
    ],
  },
  {
    slug: "pinia-router",
    track: "vue3",
    title: "Pinia 与 Vue Router 4",
    kicker: "从 Vuex / Router3 迁过来",
    minutes: 9,
    summary:
      "Pinia 没有 mutation。Router 4 的 catch-all、history、addRoute 单数形式都和 3 不一样，动态路由刷新空白的修法也略有变化。",
    takeaways: [
      "Pinia 直接 this.xx = 赋值，可 $patch 批量",
      "router.addRoute（没有 s），重复添加要先 remove",
      "通配符 * 改成 /:pathMatch(.*)*",
      "router.push 返回 Promise，用它接失败而不是回调",
    ],
    sections: [
      {
        type: "compare",
        title: "动态路由",
        vue2: {
          lang: "js",
          code: `router.addRoutes(access)
next({ ...to, replace: true })

{ path: '*', component: NotFound }`,
        },
        vue3: {
          lang: "js",
          code: `access.forEach((r) => router.addRoute(r))
next({ ...to, replace: true })

{ path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }`,
        },
        note: "Router 4 还有 addRoute('layoutName', child) 往 layout children 里塞。刷新空白的原因没变：守卫里先 add 再 next(to)。",
      },
      {
        type: "pitfall",
        title: "Pinia 在路由守卫里直接 import store 报错",
        wrong: `// router.ts 顶层
const user = useUserStore() // pinia 还没挂到 app`,
        right: `router.beforeEach((to) => {
  const user = useUserStore() // 守卫回调里再拿
  if (!user.token && to.meta.auth) return '/login'
})`,
        why: "必须 app.use(pinia) 之后才能 useStore()。把 store 写在 router 模块顶层，启动直接炸，登录页都进不去。",
      },
      {
        type: "table",
        title: "Vuex → Pinia",
        columns: ["Vuex", "Pinia"],
        rows: [
          ["commit('SET_TOKEN', t)", "user.token = t 或 user.$patch({ token: t })"],
          ["dispatch('user/login')", "user.login()"],
          ["mapState('user', ['token'])", "storeToRefs(user) 保住响应"],
          ["namespaced: true", "每个 defineStore 自带 id"],
          ["插件订阅 mutation", "$subscribe / $onAction"],
        ],
      },
    ],
  },
  {
    slug: "teleport-fragments",
    track: "vue3",
    title: "Teleport、多根节点、attrs",
    kicker: "对话框和包一层 div",
    minutes: 6,
    summary:
      "Vue3 组件可以多个根节点。对话框、Loading 用 Teleport 丢到 body，避免被父级 overflow:hidden 裁掉——后台抽屉里的日期面板常中招。",
    takeaways: [
      "多根节点时 $attrs 不会自动落在根上，要自己 v-bind=\"$attrs\"",
      "el-date-picker 被抽屉裁切，优先查 teleport / append-to-body",
      "Vue2 的 $listeners 合并进了 $attrs",
      "KeepAlive 的 include 仍然对组件 name，script setup 要另写 name",
    ],
    sections: [
      {
        type: "prose",
        body: "Element Plus 的 Dialog、Drawer、DatePicker 弹出层都走 Teleport。自己写的核保备注气泡如果停在组件内部，父级 `overflow: auto` 会把它剪掉。\n\n```vue\n<Teleport to=\"body\">\n  <div class=\"note-pop\" v-if=\"open\">...</div>\n</Teleport>\n```\n\nscript setup 默认没有 name，KeepAlive 的 include: ['ClaimList'] 会失效。用编译器宏 `defineOptions({ name: 'ClaimList' })` 或再开一个普通 script 写 name。",
      },
      {
        type: "compare",
        title: "$attrs / $listeners 合并",
        vue2: {
          lang: "js",
          code: `// 非 prop 的 attribute → $attrs
// 事件监听 → $listeners
v-on="$listeners"
v-bind="$attrs"`,
        },
        vue3: {
          lang: "js",
          code: `// 事件也在 $attrs 里（onClick 这种）
v-bind="$attrs"

defineOptions({ inheritAttrs: false })`,
        },
      },
    ],
  },
  {
    slug: "watch-computed",
    track: "vue3",
    title: "watch、watchEffect、computed",
    kicker: "别写出死循环",
    minutes: 8,
    summary:
      "watch 要指定源。watchEffect 自动收集依赖，一进就会跑。在 effect 里改自己依赖的值，就是死循环和页面卡死。",
    takeaways: [
      "watch(ref) 可以直接传 ref；watch 对象字段要用 getter",
      "watchEffect 立即执行，适合「依赖一堆、懒得列」",
      "deep: true 对大表单很贵，尽量听具体字段",
      "computed 必须纯，不要在里面发请求或改别的 state",
    ],
    sections: [
      {
        type: "compare",
        title: "听险种变化重算保费",
        vue2: {
          lang: "js",
          code: `watch: {
  'form.productCode': {
    handler(code) { this.recalc(code) },
    immediate: true
  }
}`,
        },
        vue3: {
          lang: "js",
          code: `watch(
  () => form.productCode,
  (code) => recalc(code),
  { immediate: true }
)

// 或
watchEffect(() => {
  recalc(form.productCode)
})`,
        },
      },
      {
        type: "pitfall",
        title: "watchEffect 里改依赖",
        wrong: `watchEffect(() => {
  if (!form.channel) form.channel = 'default'
})`,
        right: `onMounted(() => {
  if (!form.channel) form.channel = 'default'
})
// 或 watch 特定字段，不要在 effect 里写回同一源`,
        why: "effect 收集到 form.channel，你又改它，触发下一次 effect。投保页 CPU 打满、输入框打不出字。Vue2 的 watch 默认不 immediate，这坑在 Vue3 更常见。",
      },
      {
        type: "playground",
        title: "computed 派生，不要用 watch 去「同步」",
        version: 3,
        template: `<div class="demo">
  <p>单价 <input :value="price" @input="setPrice" /></p>
  <p>份数 <input :value="qty" @input="setQty" /></p>
  <p class="em">合计 <b>{{ total }}</b>（computed）</p>
</div>`,
        script: `const price = ref(120)
const qty = ref(1)
const total = computed(() => (Number(price.value) || 0) * (Number(qty.value) || 0))
function setPrice(e) { price.value = Number(e.target.value) }
function setQty(e) { qty.value = Number(e.target.value) }
return { price, qty, total, setPrice, setQty }`,
        hint: "能用 computed 就不要 watch 里 total = price * qty。少一份可变状态，核保试算少一份不同步。",
      },
    ],
  },
  {
    slug: "typescript",
    track: "vue3",
    title: "Vue3 + TypeScript",
    kicker: "新项目几乎都开了 TS",
    minutes: 9,
    summary:
      "defineProps 有运行时声明和纯类型声明两种。混用会炸。和 Element Plus 的 FormInstance 对不上时，先别关类型。",
    takeaways: [
      "script setup 里 defineProps<{ xxx }>() 是编译器宏，运行时会被擦掉",
      "运行时声明和类型声明不要写两份，选一种",
      "不要解构 props，要 toRefs 或始终 props.x",
      "组件 ref 用 InstanceType 或 FormInstance，不要 as any 了事",
    ],
    sections: [
      {
        type: "compare",
        title: "给核保抽屉声明 props",
        vue2: {
          lang: "js",
          caption: "Vue2 基本没类型",
          code: `props: {
  caseId: { type: String, required: true },
  readonly: { type: Boolean, default: false }
}`,
        },
        vue3: {
          lang: "ts",
          code: `// 推荐：纯类型（要 withDefaults 才能给默认值）
const props = withDefaults(defineProps<{
  caseId: string
  readonly?: boolean
}>(), { readonly: false })

// 或运行时（能生成运行时校验，和 Vue2 更像）
defineProps({
  caseId: { type: String, required: true },
  readonly: { type: Boolean, default: false }
})`,
        },
      },
      {
        type: "pitfall",
        title: "既写泛型又写运行时对象",
        wrong: `defineProps<{ caseId: string }>({
  caseId: String
})`,
        right: `// 二选一
defineProps<{ caseId: string }>()
// 或
defineProps({ caseId: { type: String, required: true } })`,
        why: "宏只能吃一种参数。两种一起写，编译期就报错，页面起不来。",
      },
      {
        type: "prose",
        title: "表单 ref 类型",
        body: "```ts\nimport type { FormInstance } from 'element-plus'\nconst formRef = ref<FormInstance>()\nasync function submit() {\n  await formRef.value?.validate()\n}\n```\n\n不要 `ref<any>`。校验失败时 Element Plus 抛错，用 try/catch，别指望返回值一定是 boolean（和 Element UI 不完全一样）。",
      },
    ],
  },
  {
    slug: "async-suspense",
    track: "vue3",
    title: "异步组件与 Suspense",
    kicker: "大页不要一次全加载",
    minutes: 7,
    summary:
      "核保详情很重时用 defineAsyncComponent。顶层 await 必须包在 Suspense 里，否则控制台一堆 warn，页面空白。",
    takeaways: [
      "defineAsyncComponent 配 loadingComponent / errorComponent",
      "script setup 顶层 await 的页面，父级要有 <Suspense>",
      "路由级可以用路由懒加载 () => import(...)，不必再套一层",
      "别把所有弹窗都 async，首屏用得到的同步引入",
    ],
    sections: [
      {
        type: "compare",
        title: "拆一个重的核保面板",
        vue2: {
          lang: "js",
          code: `components: {
  UnderwritePanel: () => import('./UnderwritePanel.vue')
}`,
        },
        vue3: {
          lang: "ts",
          code: `import { defineAsyncComponent } from 'vue'
const UnderwritePanel = defineAsyncComponent({
  loader: () => import('./UnderwritePanel.vue'),
  delay: 200,
  timeout: 15000
})

// 页面里
<Suspense>
  <UnderwritePanel :id="id" />
  <template #fallback>加载中…</template>
</Suspense>`,
        },
      },
      {
        type: "pitfall",
        title: "页面顶层 await，父级没有 Suspense",
        wrong: `<script setup>
const detail = await fetchDetail(props.id)
</script>`,
        right: `// 父
<Suspense>
  <ClaimDetail :id="id" />
</Suspense>

// 或不要顶层 await，onMounted 里再拉`,
        why: "没有 Suspense 时，顶层 await 的组件会变成异步依赖，路由切过去可能空白一阵子还带警告。后台详情页很常见。",
      },
    ],
  },
  {
    slug: "vite-tooling",
    track: "vue3",
    title: "Vite、自动导入、按需 Element",
    kicker: "新项目的工程骨架",
    minutes: 8,
    summary:
      "Vite 用 import.meta.env.VITE_*。unplugin-auto-import 会让你「没 import ref 也能用」，在存量脑海里这像魔法，审查代码时容易慌。",
    takeaways: [
      "环境变量必须 VITE_ 前缀，用 import.meta.env，不是 process.env",
      "auto-import 的 API 在 eslintrc-auto-import.json 里，不要再手写 import { ref }",
      "Element Plus 用 unplugin-vue-components 按需，不要全量 import ElementPlus",
      "开发代理和 Vue CLI 一样只在 dev 有效",
    ],
    sections: [
      {
        type: "compare",
        title: "读接口地址",
        vue2: {
          lang: "js",
          code: `axios.create({
  baseURL: process.env.VUE_APP_BASE_API
})`,
        },
        vue3: {
          lang: "ts",
          code: `axios.create({
  baseURL: import.meta.env.VITE_BASE_API
})
// .env.development
// VITE_BASE_API=/api`,
        },
      },
      {
        type: "pitfall",
        title: "全量引入 Element Plus",
        wrong: `import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
app.use(ElementPlus)`,
        right: `// vite.config.ts
Components({ resolvers: [ElementPlusResolver()] })
AutoImport({ resolvers: [ElementPlusResolver()] })
// 页面直接 <el-button>，样式按需`,
        why: "全量 CSS + 全量 JS，首页多几百 KB。保险后台在内网还能忍，但首屏会明显慢，流水线也变慢。",
      },
      {
        type: "table",
        title: "Vue CLI → Vite 搬家",
        columns: ["旧", "新"],
        rows: [
          ["vue.config.js", "vite.config.ts"],
          ["process.env.VUE_APP_X", "import.meta.env.VITE_X"],
          ["require('xxx')", "import，或 import.meta.glob"],
          ["~@/ 或 @/", "resolve.alias '@': fileURLToPath(...) "],
          ["npm run serve", "npm run dev"],
          ["public/index.html", "根目录 index.html"],
        ],
      },
    ],
  },
  {
    slug: "style-memo",
    track: "vue3",
    title: "样式绑定与 v-memo",
    kicker: "大表再抠一点性能",
    minutes: 6,
    summary:
      "Vue3 可以在 CSS 里 v-bind 变量。v-memo 能跳过没有变的行。大列表比过早上虚拟滚动更便宜。",
    takeaways: [
      "v-bind 在 style 里写的是组件状态，会变成 CSS 变量",
      "v-memo 依赖数组没变就跳过该节点的更新",
      "v-once 是永远不更新，静态块才用",
      "优先 computed / key / 少在模板里算，再考虑 v-memo",
    ],
    sections: [
      {
        type: "compare",
        title: "状态色条",
        vue2: {
          code: `<div :style="{ borderLeftColor: color }"></div>
computed: {
  color() { return this.status === 'PASS' ? '#2c6a4d' : '#9b2335' }
}`,
        },
        vue3: {
          code: `<div class="rail"></div>
<script setup>
const color = computed(() => status.value === 'PASS' ? '#2c6a4d' : '#9b2335')
</script>
<style scoped>
.rail { border-left: 3px solid v-bind(color); }
</style>`,
        },
      },
      {
        type: "pitfall",
        title: "v-memo 依赖写错",
        wrong: `<tr v-for="row in list" :key="row.id" v-memo="[list]">`,
        right: `<tr v-for="row in list" :key="row.id" v-memo="[row.status, row.amount]">`,
        why: "依赖 list 本身，任何一行变了所有行重渲，等于没写。只把这一行会变的字段放进去。",
      },
    ],
  },
];
