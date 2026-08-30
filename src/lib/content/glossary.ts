import type { GlossaryGroup } from "./types";

export const glossaryGroups: GlossaryGroup[] = [
  {
    id: "biz",
    title: "业务词（先能听懂站会）",
    items: [
      {
        term: "投保",
        def: "客户填写信息、选产品、交费，生成投保单的过程。前端常是很长的动态表单。",
        related: { track: "scene", slug: "dynamic-form" },
      },
      {
        term: "核保",
        def: "保险公司审核能不能承保。页面是工作台：待审列表 + 详情里通过 / 驳回 / 上报。",
        related: { track: "scene", slug: "approval-flow" },
      },
      {
        term: "承保 / 出单",
        def: "核保通过后生成正式保单。出单失败常见于金额差一分、必填漏传、证件校验。",
        related: { track: "scene", slug: "money" },
      },
      {
        term: "保全",
        def: "保单生效后的变更：改受益人、联系方式、退保、加减保额。另一套状态机。",
        related: { track: "scene", slug: "approval-flow" },
      },
      {
        term: "理赔",
        def: "出险后报案、材料、审核、赔付。大表、影像上传、金额估损最密集。",
        related: { track: "scene", slug: "upload" },
      },
      {
        term: "投保人 / 被保险人 / 受益人",
        def: "谁付钱、保谁、出事给谁。受益人是列表，份额合计 100%。",
        related: { track: "scene", slug: "dynamic-form" },
      },
      {
        term: "标的",
        def: "保的对象：人、车、房屋。车险里常和「车辆信息」一块出现。",
      },
      {
        term: "险种 / 责任 / 条款",
        def: "产品代码、保障项、法律文本。条款经常是富文本，展示要消毒。",
        related: { track: "scene", slug: "richtext-xss" },
      },
      {
        term: "保额 / 保费 / 费率",
        def: "出事赔多少、现在交多少、怎么算。保费用分计算，费率可能四位小数。",
        related: { track: "scene", slug: "money" },
      },
      {
        term: "告知",
        def: "健康告知、职业告知。回答决定核保结论，前端是问卷 + 签名。",
      },
      {
        term: "案件号 / 保单号 / 投保单号",
        def: "不同阶段的主键。表格 row-key 必须用业务号，不要用数组下标。",
        related: { track: "scene", slug: "mega-table" },
      },
    ],
  },
  {
    id: "eng",
    title: "工程词（仓库里会碰到）",
    items: [
      {
        term: "字典 / code",
        def: "状态、证件类型、职业的编码。一律当字符串，保留前导 0。",
        related: { track: "scene", slug: "dict" },
      },
      {
        term: "网关",
        def: "前端只打 /api 或 /gateway，由 nginx / 网关转发到核保、保全、用户服务。",
        related: { track: "scene", slug: "axios-gateway" },
      },
      {
        term: "401 / 刷新令牌",
        def: "登录过期。多个请求同时 401 时 refresh 必须单飞，否则被踢。",
        related: { track: "scene", slug: "axios-gateway" },
      },
      {
        term: "权限码",
        def: "如 claim:approve。按钮、路由、接口三层都要。不要只判断角色名。",
        related: { track: "scene", slug: "permission" },
      },
      {
        term: "keep-alive",
        def: "列表缓存。从详情返回不重新 mounted，刷新逻辑放 activated。",
        related: { track: "scene", slug: "keepalive" },
      },
      {
        term: "qiankun",
        def: "微前端。门户是主应用，核保/理赔可能是子应用。样式、路由、弹层单独处理。",
        related: { track: "scene", slug: "qiankun" },
      },
      {
        term: "publicPath",
        def: "静态资源前缀。必须等于部署目录，否则白屏。",
        related: { track: "vue2", slug: "webpack-cli" },
      },
      {
        term: "YApi / Apifox",
        def: "接口文档。联调先对字段和示例，再写 mock。",
        related: { track: "scene", slug: "env-mock" },
      },
      {
        term: "test / uat / prod",
        def: "测试、预发、生产。地址走环境变量，不要写死。",
        related: { track: "scene", slug: "env-mock" },
      },
    ],
  },
  {
    id: "ui",
    title: "组件词（Element 现场）",
    items: [
      {
        term: "el-form prop 路径",
        def: "校验靠 prop 去 form 上取值。列表必须 beneficiaries.0.name。",
        related: { track: "scene", slug: "dynamic-form" },
      },
      {
        term: "row-key / reserve-selection",
        def: "跨页勾选依赖稳定主键。没有就全丢。",
        related: { track: "scene", slug: "mega-table" },
      },
      {
        term: "doLayout",
        def: "表格在 tab / 隐藏容器里列错位，nextTick 后调一次。",
        related: { track: "vue2", slug: "nexttick-gotchas" },
      },
      {
        term: ".sync / v-model",
        def: "Element UI 对话框用 visible.sync；Plus 改 v-model。",
        related: { track: "vue3", slug: "vmodel-emits" },
      },
      {
        term: "value-format",
        def: "日期选择器交字符串给后端，避开 Date 时区。",
        related: { track: "scene", slug: "date-range" },
      },
      {
        term: "remote-method",
        def: "下拉远程搜。要防抖、最少二字、丢弃过期响应。",
        related: { track: "scene", slug: "remote-search" },
      },
      {
        term: "FormData",
        def: "上传用它。拦截器遇到时删掉 Content-Type，让浏览器补 boundary。",
        related: { track: "scene", slug: "upload" },
      },
      {
        term: "blob 导出",
        def: "Excel 下载 responseType: 'blob'。失败时 blob 里可能是 json。",
        related: { track: "scene", slug: "excel" },
      },
    ],
  },
];
