# 现场手册

Vue2 / Vue3 对照复习 + 泰康在线中后台现场课。进度存在浏览器本地，不登录、不连库。

仓库：https://github.com/suntianjing/xianchang-shouce

## 环境

Node **20 或 22**。国内网可先：

```bash
npm config set registry https://registry.npmmirror.com
```

## 运行

```bash
git clone https://github.com/suntianjing/xianchang-shouce.git
cd xianchang-shouce
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
npm install
npm run dev
```

Windows Git Bash 同上。CMD：

```bat
set PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
npm install
npm run dev
```

浏览器打开终端提示的地址，默认 http://127.0.0.1:8080/

`npm install` 时跳过 Playwright 浏览器，课程不需要它。`postinstall` 会把 Vue2 / Vue3 运行时拷到 `public/vendor/`，课里的演示才跑得起来。

## 里面有什么

- 56 课：Vue2 16 + Vue3 16 + 现场 24，按入职六日走
- 64 道坑题、对照速查、术语表
- 课里的演示在页面里跑 Vue2 / Vue3，不用另装 Vue CLI
