import type { Lesson } from "./types";

export const vue2Lessons: Lesson[] = [
  {
    slug: "options-api",
    track: "vue2",
    title: "Options API 心智模型",
    kicker: "先能读懂页面",
    minutes: 8,
    summary:
      "Vue2 页面几乎都是 data / computed / watch / methods 四件套。存量泰康后台多数停在 2.6，没有 setup。",
    takeaways: [
      "data 必须是函数，否则组件实例会共享同一份对象",
      "先找 template 里的变量，再回 options 对号入座",
      "methods 里的 this 指向当前实例；箭头函数会丢 this",
      "2.6 项目不要一上来写 setup，先按仓库现状写",
    ],
    sections: [
      {
        type: "prose",
        title: "拿到一个 .vue 怎么读",
        body: "打开投保、核保这类页面，先不要纠结语法糖。顺序是：\n\n1. `template` 里出现了哪些变量、事件\n2. 回 `data` 找初始值\n3. 回 `computed` 找派生（保费合计、是否可提交）\n4. 回 `methods` 找接口和跳转\n5. `watch` 往往藏着「改了险种就要重算」这类副作用\n\n泰康存量项目大量从 `vue-element-admin` 长出来，页面文件会再混 `mixins`、`filters`、`components` 局部注册。mixin 放到第五课专门讲。",
      },
      {
        type: "compare",
        title: "最小页面骨架",
        vue2: {
          caption: "Options API · Vue 2.6",
          code: `<template>
  <div>
    <p>保费 {{ premium }} 元</p>
    <button @click="addSeat">加座</button>
  </div>
</template>

<script>
export default {
  data() {
    return { seats: 1, price: 120 }
  },
  computed: {
    premium() {
      return this.seats * this.price
    }
  },
  methods: {
    addSeat() {
      this.seats += 1
    }
  }
}
</script>`,
        },
        vue3: {
          caption: "对照：同一需求的 Vue3",
          lang: "vue",
          code: `<script setup>
import { ref, computed } from 'vue'
const seats = ref(1)
const price = ref(120)
const premium = computed(() => seats.value * price.value)
function addSeat() {
  seats.value += 1
}
</script>

<template>
  <p>保费 {{ premium }} 元</p>
  <button @click="addSeat">加座</button>
</template>`,
        },
        note: "Vue3 模板里 ref 会自动解包，不必写 seats.value。Options 里没有 .value 这回事。",
      },
      {
        type: "playground",
        title: "跑一下：改 data 看 computed",
        version: 2,
        template: `<div class="demo">
  <p>座位数 {{ seats }} · 单价 {{ price }}</p>
  <p class="em">保费合计 <b>{{ premium }}</b> 元</p>
  <button @click="addSeat">加座</button>
  <button @click="price += 10">涨价</button>
</div>`,
        script: `data() {
    return { seats: 1, price: 120 }
  },
  computed: {
    premium() { return this.seats * this.price }
  },
  methods: {
    addSeat() { this.seats += 1 }
  }`,
        hint: "点加座 / 涨价，合计应同步变。这就是「data 变 → computed 重算 → 视图更新」。",
      },
      {
        type: "pitfall",
        title: "methods 里写箭头函数",
        wrong: `methods: {
  submit: () => {
    this.$api.save(this.form) // this 是 undefined
  }
}`,
        right: `methods: {
  submit() {
    this.$api.save(this.form)
  }
}`,
        why: "箭头函数没有自己的 this，会绑到模块作用域。线上表现是「点了没反应」，控制台报 Cannot read property '$api' of undefined。核保提交按钮最常见。",
      },
      {
        type: "pitfall",
        title: "data 写成对象而不是函数",
        wrong: `export default {
  data: { form: { name: '' } }
}`,
        right: `export default {
  data() {
    return { form: { name: '' } }
  }
}`,
        why: "组件复用时会共享同一份 form。受益人列表这种循环组件会互相改到对方的数据。根实例偶发能跑，列表里必炸。",
      },
    ],
  },
  {
    slug: "reactivity",
    track: "vue2",
    title: "响应式：Vue.set 与数组",
    kicker: "改了值界面不动",
    minutes: 10,
    summary:
      "Vue2 用 Object.defineProperty 劫持已经存在的 key。后加的字段、按下标改数组，视图都不会更新。这是存量后台第一高频 bug。",
    takeaways: [
      "data 里先把字段声明出来，不要运行时再挂",
      "后加字段用 this.$set(obj, key, val) 或 Vue.set",
      "数组按下标赋值、改 length 都不响应，用 splice / Vue.set",
      "不要对表单对象整体替换后又去改旧引用",
    ],
    sections: [
      {
        type: "prose",
        title: "为什么投保回填会「有数据没画面」",
        body: "接口把核保结论动态塞进 `form.underwriteResult`，但 `data()` 里没声明这个字段。Vue2 **检测不到新属性**。你在 Vue DevTools 里能看到值，输入框却是空的。\n\n数组同理：`this.beneficiaries[0] = row` 不会触发更新，要用 `this.$set(this.beneficiaries, 0, row)` 或 `splice`。",
      },
      {
        type: "compare",
        title: "后加字段",
        vue2: {
          lang: "js",
          caption: "必须 $set",
          code: `// data() { return { form: { name: '' } } }

// 不响应
this.form.idNo = '110101...'

// 响应
this.$set(this.form, 'idNo', '110101...')
// 或一开始就声明 idNo: ''`,
        },
        vue3: {
          lang: "js",
          caption: "Proxy，直接加即可",
          code: `const form = reactive({ name: '' })
form.idNo = '110101...' // 响应

// 注意：替换整个 ref 要改 .value
const formRef = ref({ name: '' })
formRef.value = { name: '', idNo: '110101...' }`,
        },
      },
      {
        type: "playground",
        title: "自己试：直接赋值 vs $set",
        version: 2,
        template: `<div class="demo">
  <p>form.extra = <b>{{ form.extra == null ? '（还没有这个字段）' : form.extra }}</b></p>
  <button @click="badAdd">直接赋值 extra</button>
  <button @click="goodAdd">用 $set 加 extra</button>
  <button @click="bump" v-if="form.extra !== undefined">改 extra 的值</button>
</div>`,
        script: `data() {
    return { form: { name: '张三' } }
  },
  methods: {
    badAdd() {
      this.form.extra = '直接挂上的'
    },
    goodAdd() {
      this.$set(this.form, 'extra', '用 $set 挂上的')
    },
    bump() {
      this.form.extra += ' · 又改了'
    }
  }`,
        hint: "先点「直接赋值」：数据变了，这句话可能不动。再点「$set」，视图会跟上。这就是线上「回填了但框是空的」。",
      },
      {
        type: "table",
        title: "数组哪些操作是响应的",
        columns: ["写法", "Vue2 是否响应", "建议"],
        rows: [
          ["push / pop / shift / unshift / splice / sort / reverse", "是", "优先用这些"],
          ["arr[i] = x", "否", "this.$set(arr, i, x) 或 splice"],
          ["arr.length = 0", "否", "arr.splice(0) 或 arr = []（替换引用）"],
          ["arr = otherArr", "是（替换引用）", "可以，注意丢掉旧引用上的观察者"],
        ],
      },
      {
        type: "pitfall",
        title: "接口回填用 Object.assign 到未声明字段",
        wrong: `this.form = Object.assign(this.form, res.data)`,
        right: `this.form = { ...this.initForm(), ...res.data }
// 或对每个新 key：this.$set(this.form, k, v)`,
        why: "assign 到已有对象等于「往旧对象上打补丁」，新 key 仍然不是响应式。整体换成新对象（data 里声明过 form）才会走 setter。",
      },
    ],
  },
  {
    slug: "lifecycle",
    track: "vue2",
    title: "生命周期与 $nextTick",
    kicker: "接口该在哪发",
    minutes: 7,
    summary:
      "created 能拿 data 但还没有 DOM；mounted 才有 $refs。keep-alive 的页面要用 activated，否则从详情返回列表不刷新。",
    takeaways: [
      "拉接口：created 或 mounted 都可以，要操作 DOM 必须 mounted + $nextTick",
      "this.$refs.xxx 在 created 里是 undefined",
      "keep-alive 缓存的列表走 activated，不是再走 mounted",
      "destroyed 里清定时器、解绑 bus，防止核保页泄漏",
    ],
    sections: [
      {
        type: "table",
        title: "钩子对照（先混个眼熟）",
        columns: ["Vue2", "Vue3", "典型用途"],
        rows: [
          ["beforeCreate / created", "setup 里同步代码 ≈ created", "读 props、发请求、初始化表单"],
          ["beforeMount / mounted", "onBeforeMount / onMounted", "DOM、$refs、ECharts 初始化"],
          ["beforeUpdate / updated", "onBeforeUpdate / onUpdated", "少用；容易循环"],
          ["beforeDestroy / destroyed", "onBeforeUnmount / onUnmounted", "清 timer、取消请求、dispose chart"],
          ["activated / deactivated", "onActivated / onDeactivated", "keep-alive 列表页"],
        ],
      },
      {
        type: "prose",
        body: "现场经验：列表页被 `keep-alive` 包了，从保单详情返回时 **mounted 不会再跑**。筛选条件还在，但你期望「回来刷新」就必须在 `activated` 里调 `this.getList()`。第八张现场卡会专门挖这个坑。",
      },
      {
        type: "pitfall",
        title: "mounted 里立刻读 $refs 里的 Element 表单",
        wrong: `mounted() {
  this.$refs.form.clearValidate()
}`,
        right: `mounted() {
  this.$nextTick(() => {
    this.$refs.form && this.$refs.form.clearValidate()
  })
}`,
        why: "子组件（el-form）可能还没挂上。核保页一进就报 Cannot read clearValidate of undefined，在慢网或 v-if 包着表单时必现。",
      },
      {
        type: "compare",
        title: "created 发请求 vs setup",
        vue2: {
          lang: "js",
          code: `created() {
  this.fetchDetail(this.$route.query.id)
},
watch: {
  '$route.query.id'(id) {
    if (id) this.fetchDetail(id)
  }
}`,
        },
        vue3: {
          lang: "js",
          code: `import { onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
function load() {
  fetchDetail(route.query.id)
}
onMounted(load)
watch(() => route.query.id, load)`,
        },
      },
    ],
  },
  {
    slug: "communicate",
    track: "vue2",
    title: "组件通信",
    kicker: "props / $emit / .sync / bus",
    minutes: 9,
    summary:
      "父子用 props + $emit。Vue2 的 .sync 就是后来的 v-model:xxx。跨层不要 $parent 爬树，存量代码里却到处都是。",
    takeaways: [
      ".sync 对应 Vue3 的 v-model:prop",
      "Vue2 自定义组件 v-model 默认 value + input，不是 modelValue",
      "$parent / $children / $refs 能跑但经不起改版",
      "event bus（new Vue()）在大项目里是事故源，优先 Vuex",
    ],
    sections: [
      {
        type: "compare",
        title: "双向绑定在组件上",
        vue2: {
          code: `<!-- 父 -->
<AmountInput :value="form.premium" @input="form.premium = $event" />
<AmountInput v-model="form.premium" />
<Drawer :visible.sync="open" />

<!-- 子 -->
props: { value: Number, visible: Boolean },
methods: {
  onInput(v) { this.$emit('input', v) },
  close() { this.$emit('update:visible', false) }
}`,
        },
        vue3: {
          code: `<AmountInput v-model="form.premium" />
<Drawer v-model="open" />
<Drawer v-model:open="open" />

<!-- 子 script setup -->
const premium = defineModel({ type: Number })
const open = defineModel('open', { type: Boolean })
// 或
defineProps({ modelValue: Number })
defineEmits(['update:modelValue'])`,
        },
        note: "Element UI 的 el-dialog 用 visible.sync；Element Plus 改成 v-model。改组件库时第一批要全局搜 .sync。",
      },
      {
        type: "prose",
        title: "provide / inject 和 event bus",
        body: "核保流程如果层层钻（页 → 险种卡片 → 责任项），props 会钻得很深。Vue2 可以用 `provide/inject`，但注入的是非响应引用时，改了父级对象字段子级不一定更新。\n\n`this.$bus.$on('refresh-list')` 在泰康这种多页签后台很常见。漏了 `$off`，切走页面后仍会收到事件，表现为「关了的核保页突然弹 Message」。销毁时必须对称解绑。",
      },
      {
        type: "pitfall",
        title: "子改了 props 对象字段",
        wrong: `props: { form: Object },
created() {
  this.form.channel = 'agent' // 能改，但父级很懵
}`,
        right: `this.$emit('update:form', { ...this.form, channel: 'agent' })
// 或只传需要的字段，不要整包 form 往下丢`,
        why: "对象/数组 props 是引用，子组件改字段不会报警，但双向污染。保险表单字段一多，排查「谁改了投保人证件号」会耗一下午。",
      },
    ],
  },
  {
    slug: "slots-mixins",
    track: "vue2",
    title: "Slot、Mixin、Filter",
    kicker: "能复用也会埋雷",
    minutes: 8,
    summary:
      "scoped slot 是表格列自定义的正经做法。mixin 是存量项目里的定时炸弹。filter 在 Vue3 删除，迁移时要先清。",
    takeaways: [
      "表格列自定义用 scoped slot，slot-scope 是老语法",
      "mixin 同名钩子会合并、同名 methods 会被组件覆盖（后写优先）",
      "filter 只适合纯展示（金额千分位），不要在 filter 里请求接口",
      "Vue3 没有 filter，迁移前用方法或 computed 替掉",
    ],
    sections: [
      {
        type: "compare",
        title: "表格列：老 slot-scope vs 新 #default",
        vue2: {
          code: `<el-table :data="list">
  <el-table-column label="保单号">
    <template slot-scope="scope">
      <a @click="goDetail(scope.row)">{{ scope.row.policyNo }}</a>
    </template>
  </el-table-column>
</el-table>`,
        },
        vue3: {
          code: `<el-table :data="list">
  <el-table-column label="保单号">
    <template #default="{ row }">
      <a @click="goDetail(row)">{{ row.policyNo }}</a>
    </template>
  </el-table-column>
</el-table>`,
        },
      },
      {
        type: "pitfall",
        title: "两个 mixin 都有 created，接口发两次",
        wrong: `mixins: [listMixin, dictMixin]
// 两者 created 里都调 this.init()
// 组件自己又写了 created() { this.init() }`,
        right: `// 钩子会合并执行：mixin 先、组件后。methods 同名则组件覆盖 mixin。
// 列表页把请求收到组件自己的 created，mixin 只放纯函数。`,
        why: "核保列表「进入页面打了三遍 /page」多半是 mixin 叠加。DevTools 看 Network，再搜 mixins 数组。",
      },
      {
        type: "compare",
        title: "金额千分位：filter 退场",
        vue2: {
          code: `filters: {
  money(v) {
    if (v == null || v === '') return '--'
    return Number(v).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')
  }
}
// 模板：{{ premium | money }}`,
        },
        vue3: {
          code: `function money(v) {
  if (v == null || v === '') return '--'
  return Number(v).toFixed(2).replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',')
}
// 模板：{{ money(premium) }}
// 金额计算不要用 Number，见「金额精度」现场卡`,
        },
      },
    ],
  },
  {
    slug: "directives",
    track: "vue2",
    title: "指令与列表渲染",
    kicker: "v-if / v-for / key / v-model",
    minutes: 8,
    summary:
      "v-if 和 v-for 不要写在同一节点。key 用业务 id（保单号），不要用 index。权限指令是中后台标配。",
    takeaways: [
      "同一节点上 v-for 优先于 v-if（Vue2），容易渲染出不该出现的行",
      "key 用 policyNo / id，用 index 会导致输入框「串行」",
      "v-show 只切 display，适合频繁切换的抽屉；v-if 才销毁",
      "v-model 修饰符 .number .trim .lazy 在保费输入上很有用",
    ],
    sections: [
      {
        type: "pitfall",
        title: "v-for 和 v-if 写在一起",
        wrong: `<tr v-for="row in list" v-if="row.status !== 'VOID'" :key="row.id">`,
        right: `<template v-for="row in list">
  <tr v-if="row.status !== 'VOID'" :key="row.id">...</tr>
</template>
<!-- 更好：computed 先过滤 validList -->`,
        why: "Vue2 先 for 后 if，row 在 if 里其实能访问，但会先生成所有 watcher。作废保单一多，列表卡。Vue3 反过来，v-if 拿不到 row，直接报错。两边都不要这么写。",
      },
      {
        type: "playground",
        title: "key 用 index：输入会串",
        version: 2,
        template: `<div class="demo">
  <div v-for="(item, i) in list" :key="i" class="row">
    <input v-model="item.name" />
    <button @click="remove(i)">删</button>
  </div>
  <button @click="add">加受益人</button>
</div>`,
        script: `data() {
    return {
      list: [
        { id: 1, name: '配偶' },
        { id: 2, name: '子女' }
      ]
    }
  },
  methods: {
    add() {
      const id = Date.now()
      this.list.push({ id, name: '新受益人' })
    },
    remove(i) { this.list.splice(i, 1) }
  }`,
        hint: "在第二行输入「张三」，再删第一行。输入框内容会错位。把 :key=\"i\" 改成 :key=\"item.id\" 才稳。受益人列表是重灾区。",
      },
      {
        type: "prose",
        title: "自定义指令 v-permission",
        body: "中后台按钮级权限几乎都是指令：`v-permission=\"'claim:approve'\"`。实现上在 `inserted` 里读 Vuex 的 `permission.buttons`，没有该 code 就 `el.parentNode.removeChild(el)`。\n\n注意：`v-if=\"has('claim:approve')\"` 更可预测，能配合 computed；指令移除 DOM 后，`v-if` 再显示也不会回来。两种不要叠着用。",
      },
    ],
  },
  {
    slug: "vuex-router",
    track: "vue2",
    title: "Vuex 与 Vue Router 3",
    kicker: "权限路由和请求状态",
    minutes: 10,
    summary:
      "vue-element-admin 套路：登录后拉菜单，动态 addRoutes。路由守卫里没 token 就去登录。Vuex 模块要 namespaced。",
    takeaways: [
      "改 state 必须走 mutation，异步走 action",
      "mapState / mapGetters 记得模块前缀",
      "动态路由 addRoutes 后要 next({ ...to, replace: true })，否则刷新空白",
      "keep-alive 的 include 用组件 name，不是 path",
    ],
    sections: [
      {
        type: "compare",
        title: "改一份用户信息",
        vue2: {
          lang: "js",
          caption: "Vuex 3",
          code: `// store/modules/user.js
export default {
  namespaced: true,
  state: { token: '', name: '' },
  mutations: {
    SET_TOKEN(s, t) { s.token = t }
  },
  actions: {
    async login({ commit }, form) {
      const { token } = await api.login(form)
      commit('SET_TOKEN', token)
    }
  }
}

// 组件
this.$store.dispatch('user/login', form)
this.$store.state.user.token`,
        },
        vue3: {
          lang: "js",
          caption: "Pinia",
          code: `export const useUserStore = defineStore('user', {
  state: () => ({ token: '', name: '' }),
  actions: {
    async login(form) {
      const { token } = await api.login(form)
      this.token = token
    }
  }
})

const user = useUserStore()
await user.login(form)`,
        },
      },
      {
        type: "pitfall",
        title: "动态路由刷新 404 / 空白",
        wrong: `if (store.getters.token) {
  next()
}`,
        right: `if (store.getters.token) {
  if (store.getters.routes.length === 0) {
    const access = await store.dispatch('permission/generateRoutes')
    router.addRoutes(access)
    next({ ...to, replace: true })
    return
  }
  next()
}`,
        why: "刷新时 Vuex 空了，静态路由里没有核保页，直接 next() 会落到 404。必须先 addRoutes 再 **重新进入当前 to**。这是 vue-element-admin 项目入职第一周必踩。",
      },
      {
        type: "table",
        title: "Router 3 常用守卫",
        columns: ["守卫", "写在哪", "现场用途"],
        rows: [
          ["beforeEach", "全局", "token、拉菜单、埋点、NProgress"],
          ["beforeEnter", "单条路由", "某产品线要额外角色"],
          ["beforeRouteEnter", "组件", "进页前不能用 this，用 next(vm => ...)"],
          ["beforeRouteLeave", "组件", "投保单未保存拦截"],
        ],
      },
    ],
  },
  {
    slug: "nexttick-gotchas",
    track: "vue2",
    title: "现场杂项：refs、表格、内存",
    kicker: "改完就能查的清单",
    minutes: 7,
    summary:
      "把第一周最高频的「能跑但不对」收在一课：闭包里的 this、watch 立刻触发、el-table 高度、内存泄漏。",
    takeaways: [
      "watch 默认不立即执行；要先拉一次加 immediate: true",
      "el-table 在 tab 里要在激活后再 doLayout",
      "全局 bus / setInterval 必须在 destroyed 清掉",
      "大列表不要在模板里调重函数，用 computed",
    ],
    sections: [
      {
        type: "pitfall",
        title: "watch 了路由但第一次不跑",
        wrong: `watch: {
  'query.policyNo'(v) { this.search(v) }
}`,
        right: `watch: {
  'query.policyNo': {
    handler(v) { this.search(v) },
    immediate: true
  }
}`,
        why: "从菜单点进来 query 已经在，watch 不会因为「已经是这个值」而跑。表现为第一次空白、改一次搜索框才有列表。",
      },
      {
        type: "pitfall",
        title: "Tab 里的表格列对不齐",
        wrong: `<!-- el-tab-pane 里直接放 el-table，display:none 时算不出宽度 -->`,
        right: `activated() { // 或 tab @tab-click
  this.$nextTick(() => this.$refs.table && this.$refs.table.doLayout())
}`,
        why: "核保工作台常把「待审 / 已审」做成 tab。隐藏的 pane 宽度是 0，表头和表体错位。`doLayout` 是 Element UI 的官方出路。",
      },
      {
        type: "prose",
        title: "第一周排查顺序",
        body: "页面「没反应」按这个顺序查：\n\n1. 控制台红字（this 丢了、clearValidate undefined）\n2. Network 有没有发出去、状态码、网关前缀 `/api`\n3. Vue DevTools 里 data 变没变（变了视图不变 → 响应式坑）\n4. 路由有没有被 addRoutes、刷新是否 404\n5. keep-alive 是不是把脏列表缓存回来了",
      },
    ],
  },
  {
    slug: "attrs-wrap",
    track: "vue2",
    title: "$attrs、$listeners 与二次封装",
    kicker: "业务组件怎么包 Element",
    minutes: 8,
    summary:
      "存量项目会把 el-dialog、el-table 再包一层。漏了 $attrs / $listeners，外面传的 title、@close 会静默丢失。",
    takeaways: [
      "inheritAttrs: false 再 v-bind=\"$attrs\"，根节点才不会多出一堆 attribute",
      "事件走 v-on=\"$listeners\"（Vue2）；Vue3 合并进 $attrs",
      "props 声明过的不会出现在 $attrs 里，所以 title 要么声明要么透传，不要两头都不管",
      "封装时尽量透传，不要把 Element 的 API 再发明一遍",
    ],
    sections: [
      {
        type: "prose",
        title: "为什么核保弹窗关不掉",
        body: "团队封装了 `<TkDialog>`，页面写 `<TkDialog :visible.sync=\"open\" title=\"核保意见\" @close=\"onClose\">`。封装组件根节点是一个 `div`，没把 `$attrs` 绑到内部 `el-dialog` 上。结果：title 丢了、close 丢了、visible 还能用是因为你专门声明了 prop。\n\n这类 bug 在 DevTools 里看子组件 props 是空的，父级却传了。",
      },
      {
        type: "compare",
        title: "正确透传",
        vue2: {
          code: `export default {
  inheritAttrs: false,
  props: { visible: Boolean },
  computed: {
    innerVisible: {
      get() { return this.visible },
      set(v) { this.$emit('update:visible', v) }
    }
  }
}

<template>
  <el-dialog
    :visible.sync="innerVisible"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <slot />
    <slot name="footer" />
  </el-dialog>
</template>`,
        },
        vue3: {
          code: `<script setup>
defineOptions({ inheritAttrs: false })
const open = defineModel({ type: Boolean })
const attrs = useAttrs()
</script>

<template>
  <el-dialog v-model="open" v-bind="attrs">
    <slot />
    <template #footer><slot name="footer" /></template>
  </el-dialog>
</template>`,
        },
        note: "Vue2 的原生监听（@click.native）在封装层经常被吃掉。能透传就透传，不要在包装里重新绑定一遍 click。",
      },
      {
        type: "pitfall",
        title: "既声明 title 又不从 props 往下传",
        wrong: `props: { title: String }
<template>
  <el-dialog :visible.sync="visible"><!-- 没用 title -->
    <slot />
  </el-dialog>
</template>`,
        right: `<el-dialog :visible.sync="visible" :title="title" v-bind="$attrs">`,
        why: "声明了 title，它就不会出现在 $attrs 里。你以为「透传了」，其实被 props 吸走了。弹窗标题空白。",
      },
    ],
  },
  {
    slug: "element-table-wrap",
    track: "vue2",
    title: "封装业务表格",
    kicker: "TkTable 怎么写才不绑死",
    minutes: 8,
    summary:
      "几乎每个后台都有「带分页的表格」。封装过猛（把列写死在组件里）和封装过弱（每页复制 80 行）都会让你加班。",
    takeaways: [
      "列用 slot / scoped slot 交给页面，不要在公共组件里写死保单号",
      "分页、loading、空态可以收进封装；查询条件留在页面",
      "row-key、reserve-selection 必须由页面传入",
      "不要在封装里直接调 this.$parent.getList()",
    ],
    sections: [
      {
        type: "compare",
        title: "可插槽的列表壳",
        vue2: {
          code: `<!-- TkTable -->
<el-table
  v-bind="$attrs"
  :data="data"
  :row-key="rowKey"
  v-on="$listeners"
>
  <slot />
</el-table>
<el-pagination
  :current-page="page"
  :total="total"
  @current-change="$emit('page-change', $event)"
/>

<!-- 页面 -->
<TkTable :data="list" row-key="claimNo" :total="total" @page-change="onPage">
  <el-table-column prop="claimNo" label="案件号" />
  <el-table-column label="操作">
    <template slot-scope="{ row }">
      <el-button @click="go(row)">详情</el-button>
    </template>
  </el-table-column>
</TkTable>`,
        },
        vue3: {
          code: `<el-table v-bind="$attrs" :data="data" :row-key="rowKey">
  <slot />
</el-table>
<el-pagination
  v-model:current-page="page"
  :total="total"
  @current-change="emit('pageChange', $event)"
/>`,
        },
      },
      {
        type: "pitfall",
        title: "封装组件里写死 /claim/page",
        wrong: `created() {
  this.$http.get('/claim/page').then(res => { this.list = res.records })
}`,
        right: `// 公共组件只收 data / total / loading
// 请求放页面或 useTable(fetcher)`,
        why: "下一个产品线是保全不是理赔，却打到理赔接口。公共组件不要认识业务 URL。",
      },
    ],
  },
  {
    slug: "webpack-cli",
    track: "vue2",
    title: "Vue CLI、代理与环境变量",
    kicker: "本地能调、打包不能",
    minutes: 8,
    summary:
      "存量是 Vue CLI 4/5 + webpack。跨域靠 devServer.proxy，环境变量必须 VUE_APP_ 前缀。这两条搞错，会表现为「只有我这台电脑不行」。",
    takeaways: [
      "只有 VUE_APP_ 开头的变量会进前端包",
      "proxy 只在 npm run serve 生效，生产靠 nginx / 网关",
      "publicPath 必须和部署目录一致，否则刷新 404、图片裂",
      "alias @ 指向 src，不要在 jsconfig 和 vue.config 里各写一套还不一致",
    ],
    sections: [
      {
        type: "table",
        title: "环境变量对照",
        columns: ["写法", "开发", "生产"],
        rows: [
          [".env.development 里 VUE_APP_BASE_API=/api", "走 proxy", "不会用到"],
          [".env.production 里 VUE_APP_BASE_API=/gateway", "—", "打进包"],
          ["process.env.BASE_URL", "publicPath", "publicPath"],
          ["没前缀的 SECRET=xxx", "前端拿不到", "前端拿不到"],
        ],
      },
      {
        type: "compare",
        title: "本地代理",
        vue2: {
          lang: "js",
          caption: "vue.config.js",
          code: `devServer: {
  proxy: {
    '/api': {
      target: 'https://claim-test.example.com',
      changeOrigin: true,
      pathRewrite: { '^/api': '/gateway' }
    }
  }
}

// axios
baseURL: process.env.VUE_APP_BASE_API`,
        },
        vue3: {
          lang: "js",
          caption: "vite.config.ts",
          code: `server: {
  proxy: {
    '/api': {
      target: 'https://claim-test.example.com',
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\\/api/, '/gateway')
    }
  }
}

// 变量：VITE_ 前缀，用 import.meta.env.VITE_BASE_API`,
        },
        note: "生产环境没有 proxy。把测试域名写进 axios baseURL 且没配 CORS，线上必跨域。",
      },
      {
        type: "pitfall",
        title: "publicPath 默认 '/'，部署在 /claim-ui/",
        wrong: `module.exports = { publicPath: '/' }
// 服务器路径是 https://oa.xxx.com/claim-ui/`,
        right: `module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/claim-ui/' : '/'
}`,
        why: "js/css 去根路径找，页面白屏。微前端子应用尤其常见。先看 Network 里 app.js 是不是 404。",
      },
    ],
  },
  {
    slug: "devtools",
    track: "vue2",
    title: "DevTools 与性能",
    kicker: "先看数据再改代码",
    minutes: 7,
    summary:
      "视图不对时，先问 DevTools：data 变了没有。变了视图没变就是响应式；没变就是方法没跑或跑错对象。",
    takeaways: [
      "Components 面板看当前实例的 data / computed，不要猜",
      "Vue2 打开 Performance 能看到组件 render 次数，找「谁在狂刷」",
      "v-for 里放重过滤器、模板里 JSON.parse，列表一卡就是它",
      "destroyed 里 dispose echarts、清 timer，否则切页越来越慢",
    ],
    sections: [
      {
        type: "prose",
        title: "三条最快的检查",
        body: "1. **数据**：DevTools → 当前组件 → data。投保人姓名在这儿是对的，输入框是空的 → 响应式 / key / 绑错字段。\n2. **事件**：点按钮看 methods 会不会亮。不亮就是绑定写错或被权限指令删掉了 DOM。\n3. **路由**：Vuex permission.routes 里有没有当前 path。没有就是动态路由没 add。",
      },
      {
        type: "pitfall",
        title: "模板里现场算",
        wrong: `<div v-for="row in list" :key="row.id">
  {{ heavyFormat(row) }}
</div>`,
        right: `computed: {
  viewList() {
    return this.list.map(row => ({ ...row, label: format(row) }))
  }
}`,
        why: "每次父组件 render，所有行的 heavyFormat 全跑一遍。理赔列表 50 行 × 复杂格式化，输入搜索会掉帧。",
      },
      {
        type: "table",
        title: "内存泄漏常见源",
        columns: ["源", "清理"],
        rows: [
          ["this.$bus.$on", "destroyed 里 $off 同一个函数引用"],
          ["setInterval / setTimeout", "clearInterval / clearTimeout"],
          ["window.addEventListener('resize')", "removeEventListener，函数不能是匿名的"],
          ["echarts.init", "chart.dispose()"],
          ["new MutationObserver", "observer.disconnect()"],
        ],
      },
    ],
  },
];
