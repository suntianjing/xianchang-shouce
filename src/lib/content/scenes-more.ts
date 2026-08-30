import type { Lesson } from "./types";

export const scenesMore: Lesson[] = [
  {
    slug: "date-range",
    track: "scene",
    title: "日期范围与时区",
    kicker: "差一天、差 8 小时",
    minutes: 8,
    summary:
      "列表筛选「出单日期」最爱出 off-by-one。value-format、当天 23:59:59、Date 解析时区，三件事分开记。",
    takeaways: [
      "value-format 写成后端要的字符串，不要交 Date 对象碰时区",
      "结束日期补 23:59:59，或让后端按日期闭区间",
      "new Date('2024-01-01') 是 UTC 零点，东八区会变成前一天",
      "范围选择器拆成 startTime / endTime 两个字段再提交",
    ],
    sections: [
      {
        type: "scene",
        demand: "理赔列表按出险日期筛。选 1 月 1 日到 1 月 31 日，应包含 31 日当天所有单。",
        trap: "把 Date 直接 JSON 成 ISO，31 日 00:00+8 变成 30 日 16:00Z，少一天。或 end 只到 00:00:00，31 日下午的单全丢。",
        fix: `// value-format='YYYY-MM-DD'\nfunction toRange(dates) {\n  if (!dates) return { startTime: undefined, endTime: undefined }\n  const [a, b] = dates\n  return { startTime: a + ' 00:00:00', endTime: b + ' 23:59:59' }\n}\n\n// 禁止\nnew Date('2024-01-31') // UTC，别拿去 getDate()`,
        extra: "和后端约定时区：国内核心一般是 Asia/Shanghai。不要前端 toISOString 再让后端当本地时间解析。",
      },
      {
        type: "playground",
        title: "同一天，两种 new Date",
        version: 3,
        template: `<div class=\"demo\">\n  <p>new Date('2024-01-01')</p>\n  <p class=\"em\"><b>{{ iso }}</b></p>\n  <p>new Date(2024, 0, 1) 本地</p>\n  <p class=\"em\"><b>{{ local }}</b></p>\n  <p class=\"hint\">字符串含连字符的日期按 UTC 解析（ES5）。东八区会看到前一天晚上。</p>\n</div>`,
        script: `const iso = String(new Date('2024-01-01'))\nconst local = String(new Date(2024, 0, 1))\nreturn { iso, local }`,
        hint: "筛选、打印、年龄计算，不要用带连字符的日期字符串直接 new Date。",
      },
      {
        type: "pitfall",
        title: "el-date-picker 不设 value-format",
        wrong: `<el-date-picker v-model=\"form.issueDate\" type=\"date\" />\n// form.issueDate 是 Date，JSON 后带 Z`,
        right: `<el-date-picker\n  v-model=\"form.issueDate\"\n  type=\"date\"\n  value-format=\"YYYY-MM-DD\"\n/>`,
        why: "Element Plus 默认可能是 Date。核心要字符串。对不上就查无此单，日志里还是正常日期。",
      },
    ],
  },
  {
    slug: "privacy-mask",
    track: "scene",
    title: "证件号、手机号脱敏",
    kicker: "列表看掩码，提交看全文",
    minutes: 8,
    summary:
      "身份证、手机、银行卡、地址，列表和日志不能出全文。接口通常给 idNo 和 idNoMask 两套字段，别用错。",
    takeaways: [
      "展示用脱敏字段；提交、OCR 对比用完整字段",
      "完整字段不要打进 console / 埋点 / 错误上报",
      "复制、导出要权限码，默认导出也脱敏",
      "前端掩码只是展示，真正的权限在接口",
    ],
    sections: [
      {
        type: "scene",
        demand: "理赔列表展示投保人证件。详情页有权限可看全文并复制。导出 Excel 默认掩码。",
        trap: "列表直接绑 idNo。或自己用 slice 掩，却把全文写在 DOM title 里，鼠标一悬停就看见。",
        fix: `function maskId(v) {\n  const s = String(v || '')\n  if (s.length < 8) return '****'\n  return s.slice(0, 3) + '***********' + s.slice(-4)\n}\nfunction maskMobile(v) {\n  const s = String(v || '')\n  return s.replace(/(\\\\d{3})\\\\d{4}(\\\\d{4})/, '$1****$2')\n}\n\n<!-- 列表 -->\n{{ row.idNoMask || maskId(row.idNo) }}`,
        extra: "Sentry / 日志过滤手机与证件正则。群里贴「复现数据」先洗一遍。保险审计会抽查。",
      },
      {
        type: "playground",
        title: "掩码函数",
        version: 3,
        template: `<div class=\"demo\">\n  <div class=\"row\">\n    <input :value=\"raw\" @input=\"onInput\" placeholder=\"证件或手机\" />\n  </div>\n  <p>证件 <b>{{ maskId(raw) }}</b></p>\n  <p>手机 <b>{{ maskMobile(raw) }}</b></p>\n</div>`,
        script: `const raw = ref('110101199001011234')\nfunction onInput(e) { raw.value = e.target.value }\nfunction maskId(v) {\n  const s = String(v || '')\n  if (s.length < 8) return s\n  return s.slice(0, 3) + '***********' + s.slice(-4)\n}\nfunction maskMobile(v) {\n  const s = String(v || '')\n  if (s.length < 7) return s\n  return s.slice(0, 3) + '****' + s.slice(-4)\n}\nreturn { raw, onInput, maskId, maskMobile }`,
        hint: "真实列表优先用后端给的 mask 字段。前端函数只是兜底。",
      },
      {
        type: "pitfall",
        title: "把完整证件号写进异常 toast",
        wrong: `ElMessage.error('证件号非法：' + form.idNo)`,
        right: `ElMessage.error('证件号非法')\nlogger.warn('idNo_invalid', { id: form.customerId })`,
        why: "toast 会被截图发到群。错误上报若带 payload，等于证件号进了第三方。",
      },
    ],
  },
  {
    slug: "leave-guard",
    track: "scene",
    title: "未保存离开",
    kicker: "核保意见写到一半",
    minutes: 8,
    summary:
      "详情页编辑后点菜单、点返回、关浏览器，都要问一句。比较快照，不要拿 Proxy 跟自己比。",
    takeaways: [
      "进页 clone 一份 snapshot，离开时深比较",
      "Vue2 beforeRouteLeave；Vue3 onBeforeRouteLeave",
      "window.onbeforeunload 管刷新/关页，和路由守卫都要",
      "保存成功后更新 snapshot，否则刚保存还弹窗",
    ],
    sections: [
      {
        type: "scene",
        demand: "核保意见未保存时切到别的菜单，弹出「放弃修改？」。保存过或没改过，直接走。",
        trap: "isDirty = true 在任意 input 就置位，保存后忘了清。或比较两个 reactive，引用永远不等。",
        fix: `const snapshot = ref('')\nfunction takeShot() {\n  snapshot.value = JSON.stringify(toRaw(form))\n}\nonMounted(async () => {\n  Object.assign(form, await api.detail(id))\n  takeShot()\n})\nfunction isDirty() {\n  return JSON.stringify(toRaw(form)) !== snapshot.value\n}\nonBeforeRouteLeave(async (to, from, next) => {\n  if (!isDirty()) return next()\n  try {\n    await ElMessageBox.confirm('修改未保存，确定离开？')\n    next()\n  } catch {\n    next(false)\n  }\n})`,
        extra: "keep-alive 的页面切走不一定销毁，beforeRouteLeave 仍会触发。不要只写 onBeforeUnmount。",
      },
      {
        type: "pitfall",
        title: "snapshot = form",
        wrong: `this.snapshot = this.form // 同一个引用\nthis.isDirty = this.snapshot !== this.form // 永远 false`,
        right: `this.snapshot = JSON.stringify(this.form)`,
        why: "赋值的是引用。之后怎么改，两边都变，永远「没有未保存」。",
      },
    ],
  },
  {
    slug: "submit-lock",
    track: "scene",
    title: "防重复提交",
    kicker: "点两下出两单",
    minutes: 7,
    summary:
      "核保通过、支付、出单，按钮连点会打两次。loading 锁、接口幂等键，前端至少先锁死按钮。",
    takeaways: [
      "submitting 标志位，true 时直接 return",
      "按钮 :loading / disabled 绑同一份状态",
      "锁要在 finally 里释放，失败也要解开",
      "真正防重靠后端幂等号，前端锁只挡手快",
    ],
    sections: [
      {
        type: "scene",
        demand: "核保「通过」。网关 800ms 内连点，只能成功一次。",
        trap: "只写了按钮 disabled，但回车还在触发表单 submit。或 await 之后才置 loading，第一次点击的第二下已经发出去了。",
        fix: `const submitting = ref(false)\nasync function pass() {\n  if (submitting.value) return\n  submitting.value = true\n  try {\n    await api.pass({ id: form.id, comment: form.comment })\n  } finally {\n    submitting.value = false\n  }\n}`,
        extra: "表单 @submit.prevent。支付类再加后端 nonce。不要用 debounce 代替锁——debounce 会把第一次也推迟，用户以为没点上再点。",
      },
      {
        type: "playground",
        title: "连点：没锁 vs 有锁",
        version: 3,
        template: `<div class=\"demo\">\n  <p>提交次数 <b>{{ n }}</b></p>\n  <div class=\"row\">\n    <button @click=\"naive\">没锁的通过</button>\n    <button @click=\"locked\" :disabled=\"locking\">{{ locking ? '提交中…' : '有锁的通过' }}</button>\n  </div>\n  <p class=\"hint\">连点左边，次数狂加。右边 1.2 秒内只会加一次。</p>\n</div>`,
        script: `const n = ref(0)\nconst locking = ref(false)\nfunction naive() { n.value += 1 }\nfunction locked() {\n  if (locking.value) return\n  locking.value = true\n  n.value += 1\n  setTimeout(() => { locking.value = false }, 1200)\n}\nreturn { n, locking, naive, locked }`,
        hint: "真实接口把 setTimeout 换成 await。失败也要在 finally 解锁，否则按钮永远灰。",
      },
    ],
  },
  {
    slug: "list-query",
    track: "scene",
    title: "列表筛选写进 URL",
    kicker: "刷新、分享、返回都不丢",
    minutes: 8,
    summary:
      "核保列表的险种、日期、页码应在 query 上。刷新还在，从详情返回还在，把链接丢给同事也能复现。",
    takeaways: [
      "筛选变更 router.replace({ query })，不要 push 一堆历史",
      "页码、pageSize、关键字都进 URL",
      "query 全是字符串，数字自己 Number，空字符串当没选",
      "从详情返回靠 query，不靠 keep-alive 里的内存（可兼用）",
    ],
    sections: [
      {
        type: "scene",
        demand: "筛选「待审 + 今天 + 第 3 页」。点进详情再返回，条件还在。复制 URL 给测试能复现。",
        trap: "条件只存在 data 里。返回时 keep-alive 碰巧还在，刷新或新开页就丢。或每次改筛选 router.push，返回键要按 20 下。",
        fix: `function readQuery() {\n  const q = route.query\n  return {\n    status: String(q.status || ''),\n    page: Number(q.page) || 1,\n    keyword: String(q.keyword || '')\n  }\n}\nfunction writeQuery(next) {\n  router.replace({ query: { ...next } })\n}\nwatch(() => route.query, load, { immediate: true })`,
        extra: "日期范围拆 start/end 两个 query。数组用逗号或重复 key，和后端对齐。不要把 token 放 query。",
      },
      {
        type: "pitfall",
        title: "query.page 当数字用",
        wrong: `if (route.query.page === 2) // 永远 false，query 是 '2'`,
        right: `const page = Number(route.query.page) || 1`,
        why: "URL 没有类型。=== 2 让你第二页的高亮、请求都错，还以为分页组件坏了。",
      },
    ],
  },
  {
    slug: "richtext-xss",
    track: "scene",
    title: "条款、告知与 v-html",
    kicker: "别把 CMS 当字符串",
    minutes: 7,
    summary:
      "责任条款、健康告知、公告常是富文本。v-html 不消毒就是 XSS。保险后台内网不是借口。",
    takeaways: [
      "v-html 之前 DOMPurify.sanitize",
      "禁止条款里的 script、onerror、javascript:",
      "能用纯文本 + 白名单标签就不要开放 HTML",
      "预览和打印也走同一份消毒函数",
    ],
    sections: [
      {
        type: "scene",
        demand: "产品详情展示「责任免除」HTML。运营在 CMS 里排版。",
        trap: "<div v-html=\"clause\"> 原样灌。若 CMS 被掺了 <img onerror=...>，登录态 cookie 会被偷（即便 HttpOnly 还有其它风险）。",
        fix: `import DOMPurify from 'dompurify'\nconst safe = computed(() =>\n  DOMPurify.sanitize(props.html, { USE_PROFILES: { html: true } })\n)\n\n<template>\n  <div class=\"clause\" v-html=\"safe\"></div>\n</template>`,
        extra: "markdown 源更安全，渲染时仍要消毒。不要用 innerHTML 拼用户姓名。",
      },
      {
        type: "pitfall",
        title: "用 replace 剥 script 就算消毒",
        wrong: `html.replace(/<script[\\\\s\\\\S]*?<\\\\/script>/gi, '')`,
        right: `DOMPurify.sanitize(html)`,
        why: "<img onerror>、<svg>、<a href=javascript:> 都不是 script 标签。自己写白名单一定会漏。",
      },
    ],
  },
  {
    slug: "remote-search",
    track: "scene",
    title: "远程下拉与防抖",
    kicker: "投保人、保单号联想",
    minutes: 8,
    summary:
      "el-select remote 每敲一字打一次接口会把网关打满。防抖、最少 2 字、取消上一次请求。",
    takeaways: [
      "debounce 300–400ms，最短关键字 2 个字符",
      "用 AbortController 或自增序号丢掉过期响应",
      "回显已选：单独按 id 拉详情，不要指望搜索列表里一定有它",
      "loading 要绑到当前这次请求",
    ],
    sections: [
      {
        type: "scene",
        demand: "录入受益人时按姓名搜客户。选中后回填证件号。",
        trap: "watch query 立即搜，空串也打全表。先返回的慢请求覆盖后返回的快请求，选中的人和框里字对不上。",
        fix: `let seq = 0\nlet timer\nfunction remote(q) {\n  clearTimeout(timer)\n  if (!q || q.length < 2) { options.value = []; return }\n  timer = setTimeout(async () => {\n    const my = ++seq\n    const res = await api.searchCustomer(q)\n    if (my !== seq) return\n    options.value = res.list\n  }, 350)\n}`,
        extra: "el-select 的 remote-method 就是这个入口。value 用客户 id，label 用「姓名 / 证件掩码」，不要用姓名当 value（重名）。",
      },
      {
        type: "playground",
        title: "防抖：看请求打了几次",
        version: 3,
        template: `<div class=\"demo\">\n  <input :value=\"q\" @input=\"onInput\" placeholder=\"打字搜投保人\" />\n  <p>已发出请求 <b>{{ logs.length }}</b> 次</p>\n  <p v-for=\"(l, i) in logs\" :key=\"i\" class=\"hint\">{{ l }}</p>\n</div>`,
        script: `const q = ref('')\nconst logs = ref([])\nlet timer\nfunction onInput(e) {\n  q.value = e.target.value\n  clearTimeout(timer)\n  if (q.value.length < 2) return\n  timer = setTimeout(() => {\n    logs.value = logs.value.concat(new Date().toLocaleTimeString() + ' 搜 ' + q.value)\n  }, 400)\n}\nreturn { q, logs, onInput }`,
        hint: "连续敲 5 个字，不应出现 5 次请求。重置后再试。",
      },
    ],
  },
  {
    slug: "env-mock",
    track: "scene",
    title: "环境、Mock 与联调",
    kicker: "只有我这台不行",
    minutes: 8,
    summary:
      "dev / test / uat / prod 四套地址。Mock 只在本地开。联调账号、token、内网 IP 不要进仓库。",
    takeaways: [
      "接口地址走环境变量，不要写死测试域名",
      "Mock（mockjs / vite-plugin-mock）用 env 开关，打包必须关",
      ".env.*.local 进 gitignore；密钥不进代码",
      "联调先对环境和网关前缀，再怀疑自己的代码",
    ],
    sections: [
      {
        type: "scene",
        demand: "本地对着测试网关调核保详情。同事打包到测试环境，他的能通你的 404。",
        trap: "你把 https://test-gateway 写进 axios。他用相对路径 /api，测试 nginx 才有反代。或你开着 mock，他请求打到真接口字段不一样。",
        fix: `# .env.development\nVITE_BASE_API=/api\nVITE_USE_MOCK=true\n\n# .env.production\nVITE_BASE_API=/gateway\nVITE_USE_MOCK=false\n\nif (import.meta.env.VITE_USE_MOCK === 'true') {\n  setupMock()\n}`,
        extra: "Vue CLI 换 VUE_APP_ 前缀。问清楚当前联的是 test 还是 uat，cookie 域名、是否需要公司 VPN。",
      },
      {
        type: "table",
        title: "联调清单",
        columns: ["先问", "典型答案"],
        rows: [
          ["哪套环境", "dev 本地 / test / uat / prod"],
          ["网关前缀", "/api 反代还是绝对域名"],
          ["登录怎么过", "测试账号、是否要验证码、是否 SSO"],
          ["数据从哪来", "mock、测试库、对方在 Postman 里的示例"],
          ["字段文档", "YApi / Apifox / 接口人"],
          ["跨域", "本地 proxy；生产同域或 CORS"],
        ],
      },
      {
        type: "pitfall",
        title: "把测试 token 写进 main.js",
        wrong: `axios.defaults.headers.Authorization = 'Bearer eyJ...'`,
        right: `// 登录接口拿 token，放内存 + 约定的 cookie / session\n// 本地临时：.env.development.local，且 gitignore`,
        why: "token 进 git 等于账号进仓库。测试环境也有真实客户数据。外包审计会查。",
      },
    ],
  },
];
