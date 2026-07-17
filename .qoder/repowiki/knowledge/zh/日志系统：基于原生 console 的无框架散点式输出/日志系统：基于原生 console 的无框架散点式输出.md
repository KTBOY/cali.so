---
kind: logging_system
name: 日志系统：基于原生 console 的无框架散点式输出
category: logging_system
scope:
    - '**'
source_files:
    - package.json
    - .gitignore
---

本仓库未引入任何第三方日志框架（如 pino、winston、bunyan、morgan、next-logger 等），也未在 `lib/`、`config/` 或根目录发现统一的 logger 初始化文件。所有日志输出均直接调用浏览器/Node.js 原生的 `console.log`、`console.error`、`console.warn`，属于无集中管理的散点式调试输出。

主要使用位置与模式：
- 前端组件中用 `console.warn` / `console.error` 记录 UI 异常，例如加载分析脚本失败、Service Worker 注册失败、复制代码块失败、社交链接图标缺失等；
- API Route 中使用 `console.error('[Newsletter]', error)` 等形式打印服务端错误；
- 搜索与游戏相关工具函数中大量使用 `console.log` 做临时调试输出；
- `env.mjs` 中通过 `console.error` 输出环境变量校验失败的提示。

依赖层面，`pnpm-lock.yaml` 中出现 `debug@4.3.4` 等版本，但均为第三方库的间接依赖，项目自身并未 `import` 或使用 `debug` 包进行结构化日志输出。

由于缺乏统一 logger 模块、日志级别策略、结构化字段约定以及日志收集/转储机制，该仓库当前不具备可维护的企业级日志系统能力。若需改进，建议引入 pino 或 bunyan，并封装为 `lib/logger.ts` 供全栈共享。