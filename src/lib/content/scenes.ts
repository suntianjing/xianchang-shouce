import type { Lesson } from "./types";

export const sceneLessons: Lesson[] = [
  {
    slug: "dynamic-form",
    track: "scene",
    title: "投保动态表单",
    kicker: "险种一变，字段跟着变",
    minutes: 10,
    summary:
      "受益人是列表、责任是勾选、证件类型决定校验规则。el-form 的 prop 必须拼出路径，否则校验永远过。",
    takeaways: [
      "动态项 prop 写成 beneficiaries.0.name 这种路径",
      "切换险种先清掉隐藏字段，避免把脏数据提交上去",
      "校验规则用 computed，不要一份 rules 用到死",
      "列表 key 用稳定 id，新增用临时 id，提交前再丢掉",
    ],
    sections: [
      {
        type: "scene",
        demand: "车险投保：投保人信息固定；「添加受益人」可增删；证件类型选身份证时校 18 位，选护照则不校。切换产品要换一套责任条款字段。",
        trap: "v-for 里 :prop=\"'name'\"，所有行抢同一个校验字段。或者 v-if 切掉的证件号仍留在 form 里，后端按身份证校验护照号，整单失败。",
        fix: `:prop="'beneficiaries.' + i + '.name'"
:rules="idType === 'ID' ? idRules : passportRules"

watch(productCode, () => {
  form.clauses = []
  nextTick(() => formRef.value?.clearValidate())
})`,
        extra: "隐藏字段用 v-if 而不是 v-show（v-show 不销毁，值还在）。提交前按当前产品 schema 挑字段，不要把整个 form 一锅端。",
      },
      {
        type: "compare",
        title: "动态 prop",
        vue2: {
          code: `<el-form-item
  v-for="(b, i) in form.beneficiaries"
  :key="b._id"
  :label="'受益人' + (i + 1)"
  :prop="'beneficiaries.' + i + '.name'"
  :rules="[{ required: true, message: '必填', trigger: 'blur' }]"
>
  <el-input v-model="b.name" />
</el-form-item>`,
        },
        vue3: {
          code: `<el-form-item
  v-for="(b, i) in form.beneficiaries"
  :key="b._id"
  :label="\`受益人 \${i + 1}\`"
  :prop="\`beneficiaries.\${i}.name\`"
>
  <el-input v-model="b.name" />
</el-form-item>`,
        },
      },
      {
        type: "pitfall",
        title: "用 index 当受益人 key",
        wrong: `<div v-for="(b, i) in form.beneficiaries" :key="i">
  <el-input v-model="b.name" />
</div>`,
        right: `:key="b._id"
add() {
  form.beneficiaries.push({ _id: nanoid(), name: '', rate: 0 })
}`,
        why: "删掉中间一行，下面输入框的值和校验提示会错位。出单前受益人份额加总必须 100%，串行会直接算错。",
      },
    ],
  },
  {
    slug: "mega-table",
    track: "scene",
    title: "保单 / 理赔大表",
    kicker: "跨页勾选和合计",
    minutes: 9,
    summary:
      "中后台一半时间在跟 el-table 打架：固定列、reserve-selection、合计行、tab 里错位、十万级数据卡死。",
    takeaways: [
      "row-key 必须是稳定业务主键，跨页勾选才活",
      "reserve-selection 要配合 row-key，否则翻页勾丢",
      "模板里不要写重函数，格式化放在 computed 或列 formatter",
      "tab / 抽屉里表格记得 doLayout",
    ],
    sections: [
      {
        type: "scene",
        demand: "理赔列表支持跨页勾选后批量「转交」。底部要合计已选案件的估损金额。列很多，左侧固定保单号，右侧固定操作。",
        trap: "没写 row-key，或 row-key 用了 index。翻到第二页再回来，勾选没了，或者勾的是另一单。合计用 Number 加出来精度漂。",
        fix: `<el-table
  row-key="claimNo"
  :data="list"
  @selection-change="onSelect"
>
  <el-table-column type="selection" reserve-selection />
  <el-table-column prop="claimNo" label="案件号" fixed />
</el-table>`,
        extra: "跨页勾选要自己在 Map 里按 claimNo 存行，不要相信 selection-change 每次都给你全集。合计金额用分（整数）或 decimal，见金额课。",
      },
      {
        type: "table",
        title: "表格现场清单",
        columns: ["症状", "先查"],
        rows: [
          ["表头表体错位", "父级 display:none / flex；调用 doLayout"],
          ["固定列把操作列挡住", "fixed 列宽写死，别用 min-width 混固定"],
          ["勾选翻页丢失", "row-key + reserve-selection"],
          ["滚动卡顿", "不要在单元格里塞复杂组件；虚拟滚动或分页"],
          ["合计不对", "show-summary 的 summary-method，别在模板里 reduce Number"],
        ],
      },
      {
        type: "pitfall",
        title: "在模板里过滤整表",
        wrong: `<el-table :data="list.filter(r => r.status !== 'VOID')">`,
        right: `const visibleList = computed(() =>
  list.value.filter(r => r.status !== 'VOID')
)`,
        why: "每次渲染都 filter 一遍。理赔列表字段多、还有 formatter，输入搜索框会明显掉帧。",
      },
    ],
  },
  {
    slug: "permission",
    track: "scene",
    title: "按钮级权限",
    kicker: "code 对不上就没有按钮",
    minutes: 7,
    summary:
      "菜单来自后端路由表，按钮来自 permission 数组。前端写死的 v-if=\"role === 'admin'\" 过不了验收。",
    takeaways: [
      "权限 code 和后端约定，不要自己发明 claim:pass",
      "指令移除 DOM 后难以再显示，偏好函数 + v-if",
      "路由 meta.permission 和按钮 code 是两套，别混",
      "超管也要走同一套，不要 if (isAdmin) 短路，除非后端明确给 *",
    ],
    sections: [
      {
        type: "scene",
        demand: "核保页「通过 / 驳回 / 转交」三个按钮，分别对应 underwrite:pass / reject / transfer。没有权限的人不能靠改 DOM 显示。",
        trap: "前端写 v-if=\"user.role === 'underwriter'\"。后端角色改名、一人多岗立刻错。或者 v-permission 把按钮 remove 了，但接口没拦，懂的人仍能调。",
        fix: `function has(code) {
  return permissionStore.buttons.includes(code)
}

<el-button v-if="has('underwrite:pass')" type="primary" @click="pass">
  通过
</el-button>`,
        extra: "权限只藏按钮不够。提交接口 403 时要给出人话，不要只在控制台红字。超管一般是 buttons: ['*']，has 里要处理通配。",
      },
      {
        type: "compare",
        title: "指令实现（能看懂存量代码）",
        vue2: {
          lang: "js",
          code: `Vue.directive('permission', {
  inserted(el, binding, vnode) {
    const code = binding.value
    const has = vnode.context.$store.getters.buttons.includes(code)
    if (!has) el.parentNode && el.parentNode.removeChild(el)
  }
})`,
        },
        vue3: {
          lang: "js",
          code: `app.directive('permission', {
  mounted(el, binding) {
    const buttons = usePermissionStore().buttons
    if (!buttons.includes(binding.value)) {
      el.parentNode && el.parentNode.removeChild(el)
    }
  }
})`,
        },
      },
    ],
  },
  {
    slug: "axios-gateway",
    track: "scene",
    title: "axios、网关与 token",
    kicker: "401、前缀、脱敏",
    minutes: 10,
    summary:
      "保险后台很少直连业务服务，请求打到网关。前缀、租户头、token 刷新、身份证脱敏，全写在拦截器里。",
    takeaways: [
      "baseURL 走环境变量，不要写死域名",
      "401 刷新要排队，否则并发请求把用户踢出去",
      "展示层脱敏，提交层仍用完整值（两套字段）",
      "取消重复请求：切页要把列表请求 abort",
    ],
    sections: [
      {
        type: "scene",
        demand: "所有接口走 /gateway/claim。Header 带 Authorization 和 X-Tenant-Id。token 过期用 refreshToken 续一次；续失败才跳登录。列表页展示身份证中间打星。",
        trap: "每个 401 都直接跳登录，核保页同时 5 个请求会刷新 5 次，第二次 refresh 失效，人被踢。或者把脱敏后的 idNo 写回 form，提交校验失败。",
        fix: `// 伪代码：单飞刷新
let refreshing
http.interceptors.response.use(r => r, async (err) => {
  if (err.response?.status !== 401) throw err
  if (!refreshing) refreshing = store.refresh().finally(() => { refreshing = null })
  await refreshing
  return http(err.config)
})`,
        extra: "脱敏：`idNoMask` 给表格，`idNo` 给提交。从接口来的如果已经是带星的，不要再拿去 OCR 比对。",
      },
      {
        type: "table",
        title: "联调时先对这几项",
        columns: ["项", "常见坑"],
        rows: [
          ["baseURL", "开发 /api 代理到网关，生产是同域 /gateway"],
          ["cookie vs header", "有的系统 token 在 cookie，axios withCredentials 要开"],
          ["Content-Type", "文件上传不能写死 application/json"],
          ["时间戳", "后端 LocalDateTime 带 T，dayjs 格式化要一致"],
          ["错误码", "网关 200 + { code: 1 } 和 HTTP 500 两套，拦截器都要认"],
        ],
      },
      {
        type: "pitfall",
        title: "GET 把对象 params 直接丢进去",
        wrong: `http.get('/claim/page', { policyNo, dates: [start, end] })`,
        right: `http.get('/claim/page', {
  params: { policyNo, startDate: start, endDate: end }
})`,
        why: "数组和嵌套对象的序列化各项目不一样（a[0]= vs a=）。列表筛不出来，后端说没收到日期。和后端对一下 qs 约定，封装进拦截器。",
      },
    ],
  },
  {
    slug: "money",
    track: "scene",
    title: "保费金额精度",
    kicker: "0.1 + 0.2 !== 0.3",
    minutes: 7,
    summary:
      "保费、税额、估损全部是钱。JavaScript Number 是 IEEE 754，累加必漂。用「分」做整数，或 decimal 库。",
    takeaways: [
      "计算用分（整数），展示再 /100 并格式化",
      "不要把 toFixed 的字符串拿去相加",
      "输入框用字符串收，失焦再规范化",
      "和后端对一下小数位：保费一般 2 位，费率可能 4 位",
    ],
    sections: [
      {
        type: "scene",
        demand: "三款附加险保费 0.10、0.20、0.05 元，合计应等于 0.35，再加主险 999.90。提交给核保引擎的是两位小数的字符串或整数分。",
        trap: "`0.1 + 0.2` 得到 0.3000...04。`toFixed(2)` 再 `Number` 回去，累加一列责任项就会和核心差 1 分，出不了单。",
        fix: `function yuanToFen(v) {
  return Math.round(Number(v) * 100)
}
function fenToYuan(fen) {
  return (fen / 100).toFixed(2)
}
const totalFen = items.reduce((s, it) => s + yuanToFen(it.premium), 0)`,
        extra: "展示千分位只在表格 / 打印。计算层始终是分。Element 输入框 v-model.number 会先转 Number，保费框更适合字符串。",
      },
      {
        type: "playground",
        title: "亲眼看精度漂",
        version: 3,
        template: `<div class="demo">
  <p>0.1 + 0.2 = <b>{{ naive }}</b></p>
  <p>用分计算再回来 = <b>{{ fen }}</b></p>
</div>`,
        script: `const naive = (0.1 + 0.2).toString()
const fen = ((Math.round(0.1 * 100) + Math.round(0.2 * 100)) / 100).toFixed(2)
return { naive, fen }`,
        hint: "左边不是 0.3。核保合计差一分，先别怀疑接口，先看前端有没有用 Number 加钱。",
      },
    ],
  },
  {
    slug: "dict",
    track: "scene",
    title: "字典与枚举缓存",
    kicker: "下拉是空的、回显是码",
    minutes: 7,
    summary:
      "证件类型、险种、案件状态全是字典。进页拉一次、缓存、按 code 回显 label。code 下线后旧单要仍能显示。",
    takeaways: [
      "列表回显用字典 map，不要对每一行请求一次",
      "缓存放到 Vuex/Pinia，不要每个页面自己 fetch",
      "value 用 code 的字符串，别把 01 转成 1",
      "停用的项：回显保留，下拉剔除",
    ],
    sections: [
      {
        type: "scene",
        demand: "理赔详情回显案件状态。列表页 20 行都要显示中文。新增时下拉只给启用项。",
        trap: "el-select 的 value 是 number 1，字典 code 是 \"01\"，对不上，框是空的。或者把停用 code 从 map 里删了，旧案变成空白。",
        fix: `const dictMap = computed(() => {
  const m = new Map()
  for (const d of dict.claimStatus) m.set(String(d.code), d.label)
  return m
})
function label(code) {
  const k = String(code)
  return dictMap.value.get(k) || k
}`,
        extra: "远程搜索的险种下拉不要和本地字典混用同一份 v-model 类型。进页先 dispatch('dict/loadOnce')，拦截器里可做 TTL。",
      },
      {
        type: "pitfall",
        title: "01 被转成 1",
        wrong: `<el-option :value="Number(d.code)" :label="d.label" />
// 或 v-model.number`,
        right: `<el-option :value="String(d.code)" :label="d.label" />
// 比较一律 String(code)`,
        why: "保险核心系统 code 带前导 0 是常态。Number 吃掉前导 0，回显全空，还不好查。",
      },
    ],
  },
  {
    slug: "keepalive",
    track: "scene",
    title: "keep-alive 脏数据",
    kicker: "从详情返回，列表还是旧的",
    minutes: 8,
    summary:
      "vue-element-admin 默认缓存列表。好处是筛选还在，坏处是你刚审完的单回来还显示「待审」。",
    takeaways: [
      "需要刷新的逻辑放 activated，不是只放 mounted",
      "详情页不要缓存；include 白名单比 exclude 好管",
      "script setup 必须给组件 name，否则 include 失效",
      "切走时把弹窗 / 定时器停掉，activated 再开",
    ],
    sections: [
      {
        type: "scene",
        demand: "核保列表进入详情审核通过后返回，当前行应变成「已通过」，筛选条件和滚动位置尽量保留。",
        trap: "只在 mounted 调 getList。keep-alive 命中后 mounted 不跑，列表仍是进详情前的快照。或者返回时无脑 reload，用户筛的条件丢了。",
        fix: `activated() {
  if (this.needReload) this.getList() // 详情里通过后设一个标记
}
// 或详情返回带 query.refresh=1，activated 里读完删掉`,
        extra: "不要把详情也 keep-alive。多开几个案件会串数据。AppMain 里 include 只放 *List 组件名。",
      },
      {
        type: "compare",
        title: "钩子",
        vue2: {
          lang: "js",
          code: `activated() {
  this.getList()
},
deactivated() {
  this.timer && clearInterval(this.timer)
}`,
        },
        vue3: {
          lang: "js",
          code: `onActivated(() => getList())
onDeactivated(() => {
  timer && clearInterval(timer)
})
defineOptions({ name: 'ClaimList' })`,
        },
      },
      {
        type: "pitfall",
        title: "include 写了路由 path",
        wrong: `<keep-alive :include="['/claim/list']">`,
        right: `<keep-alive :include="['ClaimList']">
<!-- 组件 options.name 或 defineOptions({ name: 'ClaimList' }) -->`,
        why: "keep-alive 匹配的是组件 name。写 path 等于没缓存，或你以为没缓存其实缓存了别的。",
      },
    ],
  },
  {
    slug: "joint-debug",
    track: "scene",
    title: "联调、分页、微前端",
    kicker: "跨域、从 0 还是从 1、样式泄漏",
    minutes: 9,
    summary:
      "和后端对分页、和网关对 cookie、和别的外包团队对微前端路由。这些不是 Vue 语法，但会让你的页面「看起来像 Vue 坏了」。",
    takeaways: [
      "先确认 page 从 0 还是 1；Element 分页是 1 起",
      "本地代理没配 websocket / cookie 时别先改业务代码",
      "qiankun 下弹层要挂到主应用 body，注意样式前缀",
      "不要在微应用里改 document.title 打架太勤，听主应用",
    ],
    sections: [
      {
        type: "scene",
        demand: "列表「一共 37 条，每页 10 条」。前端页码 1 起，有的 Java 接口 page 0 起。微前端子应用里的 Message 被主应用样式覆盖。",
        trap: "把 Element 的 current-page 直接当 pageIndex 传，首页重复或漏第一页。子应用的 el-dialog 挂到自己的根节点，滚动主应用时错位。",
        fix: `params: {
  pageNum: page,      // 和后端约定好名字
  pageSize: size
}
// 若后端 0 起：pageNum: page - 1

// Element Plus 弹层
<el-dialog append-to-body />`,
        extra: "跨域：开发用 vite/webpack proxy，生产走同域网关。withCredentials 和 CORS Access-Control-Allow-Origin: * 不能共存。",
      },
      {
        type: "table",
        title: "微前端（qiankun）检查单",
        columns: ["现象", "处理"],
        rows: [
          ["样式污染主应用", "webpack 加前缀 / experimentalStyleIsolation，避免改 body 全局"],
          ["弹层位置错误", "append-to-body + getPopupContainer 指向子应用容器或 body"],
          ["刷新 404", "主应用 history 回退、nginx try_files，子应用 publicPath 动态"],
          ["公共 Vue 冲突", "externals 或各玩各的，不要两个 Vue 抢原型"],
          ["登录态", "token 放 cookie 主域，或主应用 props 下发"],
        ],
      },
      {
        type: "pitfall",
        title: "分页 total 当 pages",
        wrong: `this.total = res.pages // 一共 4 页
<el-pagination :total="total" /> <!-- 以为 4 条 -->`,
        right: `this.total = res.total // 37 条
this.page = res.pageNum`,
        why: "页脚显示「共 4 条」而实际 37 条。后端字段 pages / total / pageSize 每次对一下 swagger，不要凭记忆。",
      },
    ],
  },
  {
    slug: "approval-flow",
    track: "scene",
    title: "审批流状态机",
    kicker: "按钮跟着状态走",
    minutes: 9,
    summary:
      "核保、理赔、保全都是状态机：待审 / 通过 / 驳回 / 上报。前端不要 if-else 铺满模板，用一张表驱动按钮和可编辑性。",
    takeaways: [
      "状态 code 当键，配置「能看、能改、能点哪些按钮」",
      "操作前二次确认；通过/驳回要填意见，意见走必填校验",
      "按钮权限和状态条件是且关系：has(code) && can('pass')",
      "不要在前端自己把状态改成下一档，等接口返回再刷新",
    ],
    sections: [
      {
        type: "scene",
        demand: "核保详情：待审可「通过 / 驳回 / 转交」；已通过只读；驳回可「重新提交」。通过必须填核保意见。",
        trap: "模板里 v-if=\"status==='WAIT'\" 复制三遍。后端加一个「上报」状态，六个页面漏改。或点通过后本地立刻改 status，接口失败页面和核心不一致。",
        fix: `const FLOW = {
  WAIT:    { edit: true,  actions: ['pass','reject','transfer'] },
  PASS:    { edit: false, actions: [] },
  REJECT:  { edit: true,  actions: ['resubmit'] },
  REPORT:  { edit: false, actions: ['pass','reject'] }
}
const cfg = computed(() => FLOW[form.status] || { edit: false, actions: [] })
function can(action) {
  return has('underwrite:' + action) && cfg.value.actions.includes(action)
}`,
        extra: "点通过：先 validate 意见 → ElMessageBox.confirm → 调接口 → 用返回的新 status 整单替换。失败不要改本地状态。",
      },
      {
        type: "playground",
        title: "状态机怎么切按钮",
        version: 3,
        template: `<div class="demo">
  <p>当前状态 <b>{{ status }}</b></p>
  <button v-if="can('pass')" @click="setStatus('PASS')">通过</button>
  <button v-if="can('reject')" @click="setStatus('REJECT')">驳回</button>
  <button v-if="can('resubmit')" @click="setStatus('WAIT')">重新提交</button>
  <p class="em">{{ cfg.edit ? '表单可编辑' : '表单只读' }}</p>
</div>`,
        script: `const FLOW = {
  WAIT:   { edit: true,  actions: ['pass','reject'] },
  PASS:   { edit: false, actions: [] },
  REJECT: { edit: true,  actions: ['resubmit'] }
}
const status = ref('WAIT')
const cfg = computed(() => FLOW[status.value])
function can(action) { return cfg.value.actions.includes(action) }
function setStatus(s) { status.value = s }
return { status, cfg, can, setStatus }`,
        hint: "这是前端演示。真项目里 setStatus 必须等接口成功。权限 has() 还要叠一层。",
      },
      {
        type: "pitfall",
        title: "前端抢先改状态",
        wrong: `async pass() {
  this.form.status = 'PASS' // 先改
  await api.pass(this.form)
}`,
        right: `async pass() {
  const res = await api.pass({ id: this.form.id, comment: this.comment })
  this.form = res.data // 以后端为准
}`,
        why: "接口 500 时页面已经是「已通过」，刷新又变回待审。审核员以为自己审过了。",
      },
    ],
  },
  {
    slug: "upload",
    track: "scene",
    title: "材料上传与回填",
    kicker: "身份证、告知书、影像",
    minutes: 8,
    summary:
      "投保和理赔都要传文件。限制类型和大小、预览、OCR 回填。回填时不要把原字段冲掉用户刚改过的值。",
    takeaways: [
      "accept + before-upload 双重拦，不要只信 input 的 accept",
      "Content-Type 不要写死 application/json，让浏览器带 boundary",
      "OCR 回填用「空才写」或弹出对比，别无声覆盖",
      "文件列表的 uid 用接口返回的 fileId，刷新页才能对上",
    ],
    sections: [
      {
        type: "scene",
        demand: "投保人身份证正反面，单张 ≤ 5MB，jpg/png/pdf。上传成功后 OCR，若姓名、证件号为空则回填。",
        trap: "axios 默认 json，FormData 被序列化成 {}。或 OCR 把用户刚改的姓名覆盖成识别错的字。",
        fix: `function beforeUpload(file) {
  const okType = /\\/(jpeg|png|pdf)$/.test(file.type)
  const okSize = file.size / 1024 / 1024 < 5
  if (!okType) ElMessage.error('仅支持 jpg / png / pdf')
  if (!okSize) ElMessage.error('不超过 5MB')
  return okType && okSize
}
function fillOcr(ocr) {
  if (!form.name) form.name = ocr.name
  if (!form.idNo) form.idNo = ocr.idNo
}`,
        extra: "el-upload 的 :http-request 自定义时，记得自己把 file 放到 FormData.append('file', file)。网关若要 token，header 里带，不要放进 form 字段。",
      },
      {
        type: "compare",
        title: "不要让拦截器把 FormData 改成 json",
        vue2: {
          lang: "js",
          code: `http.interceptors.request.use((cfg) => {
  if (cfg.data instanceof FormData) {
    delete cfg.headers['Content-Type']
  } else {
    cfg.headers['Content-Type'] = 'application/json'
  }
  return cfg
})`,
        },
        vue3: {
          lang: "js",
          code: `// 同：遇到 FormData 就删 Content-Type
// 让浏览器自己补 multipart/form-data; boundary=...`,
        },
      },
    ],
  },
  {
    slug: "excel",
    track: "scene",
    title: "Excel 导入导出",
    kicker: "批量导入受益人 / 导出列表",
    minutes: 8,
    summary:
      "导入要校验每一行再提交；导出用 blob 下载，文件名从 Content-Disposition 取。前端 xlsx 解析大文件会卡死。",
    takeaways: [
      "导入：前端做格式预检，真正入库仍走后端",
      "导出：responseType: 'blob'，不要当 json 解析",
      "错误行要能下载失败清单，不要只 toast「失败」",
      "列和字典 code 对齐，前导 0 当文本",
    ],
    sections: [
      {
        type: "scene",
        demand: "核保列表「导出当前筛选」。导入「批量新增受益人」，模板三列：姓名、证件号、份额。",
        trap: "导出接口返回文件流，axios 当 json 解析，下载出来是乱码或 {code:0}。导入用 Number 读证件号，01 变成 1。",
        fix: `const res = await http.get('/claim/export', {
  params: query,
  responseType: 'blob'
})
const cd = res.headers['content-disposition']
const name = decodeURIComponent(/filename\\*=UTF-8''([^;]+)/.exec(cd)?.[1] || 'export.xlsx')
const url = URL.createObjectURL(res.data)
const a = document.createElement('a')
a.href = url
a.download = name
a.click()
URL.revokeObjectURL(url)`,
        extra: "若后端失败时仍返回 json blob，要先看 blob.type 或切成 text 判断 code。否则用户下到一个「打不开的 xlsx」其实是错误 json。",
      },
      {
        type: "pitfall",
        title: "xlsx 读证件号当数字",
        wrong: `const idNo = row['证件号'] // 1101... 被 Excel 科学计数法吃掉`,
        right: `// 模板里证件号列设为文本
// 解析时：String(cell).trim()，不要 Number
// 科学计数法：1.10E+17 直接判为非法，让用户改模板`,
        why: "身份证 18 位超了 JS 安全整数。导出再导回来，人对不上。模板第一行加批注：此列必须文本。",
      },
    ],
  },
  {
    slug: "print",
    track: "scene",
    title: "打印保单与分页",
    kicker: "window.print 不是全文复印",
    minutes: 7,
    summary:
      "保单、告知书要能打。用独立打印页 + @media print 藏掉菜单。页眉页脚、表格切断，都要单独处理。",
    takeaways: [
      "不要把整个后台 layout 拿去 print，单独做打印视图",
      "用 @media print 隐藏 .no-print",
      "长表格 tr 上加 page-break-inside: avoid",
      "金额、印章位置用固定尺寸，不要靠屏幕 flex",
    ],
    sections: [
      {
        type: "scene",
        demand: "核保通过后「打印核保意见书」。只要正文、签章、日期，不要侧边栏和按钮。",
        trap: "直接 window.print() 当前页，把菜单、筛选、水印「内部资料」全打出来。或用 html2canvas 截长页，一页变成一张糊图。",
        fix: `@media print {
  .no-print, .el-menu, header { display: none !important; }
  .print-sheet { box-shadow: none; }
  table tr { page-break-inside: avoid; }
}
// 或路由 /claim/print/:id 独立布局，mounted 后 window.print()`,
        extra: "Chrome 打印边距选「默认」还是「无」要在操作说明里写一句。印章图用高分辨率 png，打印时 width 用 mm。",
      },
    ],
  },
  {
    slug: "echarts",
    track: "scene",
    title: "报表与 ECharts",
    kicker: "tab 里的图是扁的",
    minutes: 8,
    summary:
      "投保量、赔付率这类图几乎都是 ECharts。init 时机、resize、dispose、tab 切换后宽度为 0，是固定节目。",
    takeaways: [
      "onMounted / $nextTick 后再 init，容器要有实际宽高",
      "onUnmounted 必须 dispose，keep-alive 用 activated 里 resize",
      "tab 切换后调用 chart.resize()",
      "数据空时用 graphic 或 empty 组件，不要丢一个空白 canvas",
    ],
    sections: [
      {
        type: "compare",
        title: "生命周期",
        vue2: {
          lang: "js",
          code: `mounted() {
  this.$nextTick(() => {
    this.chart = echarts.init(this.$refs.chart)
    this.renderChart()
  })
  window.addEventListener('resize', this.onResize)
},
activated() { this.chart && this.chart.resize() },
beforeDestroy() {
  window.removeEventListener('resize', this.onResize)
  this.chart && this.chart.dispose()
}`,
        },
        vue3: {
          lang: "ts",
          code: `const el = ref<HTMLDivElement>()
let chart: echarts.ECharts
onMounted(() => {
  chart = echarts.init(el.value!)
  render()
  window.addEventListener('resize', onResize)
})
onActivated(() => chart?.resize())
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  chart?.dispose()
})`,
        },
      },
      {
        type: "pitfall",
        title: "el-tab-pane 里图表宽度 100px",
        wrong: `mounted() { this.chart = echarts.init(this.$refs.chart) }`,
        right: `@tab-click="() => $nextTick(() => chart.resize())"
// 或 v-if 当前 tab 才挂图表，切过来再 init`,
        why: "隐藏 pane 的 display:none，init 时宽度是 0。看起来像一条线。和表格 doLayout 是同一类病。",
      },
    ],
  },
  {
    slug: "qiankun",
    track: "scene",
    title: "微前端 qiankun",
    kicker: "子应用像 iframe，但不是",
    minutes: 10,
    summary:
      "保险中后台常把核保、保全、渠道拆成子应用。你改的可能只是其中一个。样式、路由、弹层、公共依赖，四件事单独记。",
    takeaways: [
      "子应用导出 bootstrap / mount / unmount，webpack 开 library",
      "publicPath 运行时算，否则二次进入资源 404",
      "弹层 append-to-body，主应用 overflow 会裁切",
      "不要两个 Vue 抢原型；能 external 就 external",
    ],
    sections: [
      {
        type: "scene",
        demand: "主应用是门户，子应用是「理赔」。菜单点理赔后，在内容区挂载。刷新 /claim/list 不能 404。",
        trap: "子应用自己用了 history 的 /，刷新打到子应用 nginx 没有的路径。或 CSS 把主应用按钮改成圆角全没。",
        fix: `// 子应用 vue.config.js
const { name } = require('./package.json')
module.exports = {
  publicPath: window.__POWERED_BY_QIANKUN__ ? '/claim/' : '/',
  configureWebpack: {
    output: {
      library: \`\${name}-[name]\`,
      libraryTarget: 'umd',
      jsonpFunction: \`webpackJsonp_\${name}\`
    }
  }
}`,
        extra: "主应用 registerMicroApps 的 activeRule 要和网关转发一致。登录态用 cookie 主域，或主应用 props 下发 token，不要让子应用再弹一次登录。",
      },
      {
        type: "table",
        title: "必查",
        columns: ["点", "做法"],
        rows: [
          ["样式隔离", "experimentalStyleIsolation，避免改 body / html"],
          ["弹层", "append-to-body / teleported，getPopupContainer"],
          ["路由", "子应用自己的 base，主应用 history 回退"],
          ["卸载", "unmount 里 $destroy / app.unmount，清 timer"],
          ["通信", "props / 官方 actions，不要 window.xxx 撒全局"],
        ],
      },
    ],
  },
  {
    slug: "coexist",
    track: "scene",
    title: "Vue2 与 Vue3 共存",
    kicker: "一个仓库两种写法",
    minutes: 8,
    summary:
      "迁移期常见：门户 Vue3，某个子应用还是 Vue2；或同一应用里 2.7 开了 composition API。不要假设「全是 setup」。",
    takeaways: [
      "先看 package.json 的 vue 版本，再动手",
      "2.7 可以写 composition API，但 Element UI 还是 Vue2 组件",
      "不要把 Vue3 的 v-model 写法拷进 Vue2 封装组件",
      "微前端里 Vue2 子应用和 Vue3 主应用不要共享一份 Vue",
    ],
    sections: [
      {
        type: "table",
        title: "混用时绝对不要做的事",
        columns: ["行为", "后果"],
        rows: [
          ["Vue3 语法写进 Vue2 SFC（多根节点、v-model:xx）", "编译失败或静默无效"],
          ["在 Vue2 项目 npm install vue@3", "整个构建崩"],
          ["主应用 provide 的响应式对象塞给 Vue2 子应用", "子应用不会追踪"],
          ["公共 utils 里用 import { ref } from 'vue'", "看是哪份 vue 被解析"],
          ["Element Plus 当 Element UI 用", "指令、事件名全错"],
        ],
      },
      {
        type: "prose",
        body: "入职第一天：打开 `package.json`，看 `vue` 是 `^2.6`、`^2.7` 还是 `^3`。打开一个页面，看是 `export default { data() }` 还是 `<script setup>`。两套都可能存在。\n\n2.7 的 composition API 没有 `<script setup>` 的宏（defineProps 要自己从 vue 引，且行为有差异）。存量 2.6 更是完全没有。不要用「我刚看的 Vue3 教程」直接贴。",
      },
    ],
  },
  {
    slug: "code-style",
    track: "scene",
    title: "规范、分支、联调纪律",
    kicker: "外包最容易在这挨骂",
    minutes: 7,
    summary:
      "能跑不是验收标准。eslint、提交信息、分支命名、别把 console.log 和调试账号推进主干。",
    takeaways: [
      "跟着仓库的 eslint / prettier，不要自带一套",
      "feat/fix/hotfix 前缀 + 单号，别在 master 上直接改",
      "不要提交 .env、密钥、内网地址到 git",
      "改公共组件先问，别为了一个页面改 TkTable",
    ],
    sections: [
      {
        type: "scene",
        demand: "修核保列表筛选 bug。你动了公共分页 mixin，顺手把别的产品线 pageSize 默认值改了。",
        trap: "公共文件「顺便优化」。或把测试环境 token 写进代码。或提交信息写「改了点东西」。",
        fix: `feat(claim): 修复核保列表日期筛选未传 endDate

# 分支
feature/CLAIM-1234-date-filter

# 公共组件
另开需求、找负责人 review，不要夹带`,
        extra: "debugger、console.log、v-if=\"true\" 的临时口子，提测前搜一遍。保险后台有审计，别把真实保单号贴到群里。",
      },
      {
        type: "table",
        title: "提交前 30 秒",
        columns: ["查", "怎么查"],
        rows: [
          ["eslint", "仓库脚本，不要 --no-verify 成习惯"],
          ["接口路径", "有没有写死测试域名"],
          ["权限", "按钮是不是只用了角色名"],
          ["打印", "有没有把客户证件号打进 log"],
          ["范围", "diff 里是不是夹带了无关文件"],
        ],
      },
    ],
  },
];
