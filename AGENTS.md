# AGENTS.md

面向 AI 编码代理的项目说明。基于 [Cali](https://cali.so) 开源个人博客二次开发的个人站点（Next.js App Router 全栈应用），已扩展游戏中心、工具库等模块。

## 项目概览

- 类型：个人博客 / 内容站点，单体 Next.js 应用（非 monorepo，尽管存在 turbo.json / pnpm-workspace.yaml）
- 内容：博客文章、项目、留言墙、AMA、Newsletter、后台管理、游戏中心（Flash/SWF）、工具库
- 部署：Vercel

## 技术栈

- **框架**：Next.js 14.1（App Router）+ React 18 + TypeScript 5
- **样式**：Tailwind CSS 3（`darkMode: 'class'`）、Framer Motion、Radix UI、Headless UI、Tremor（后台图表）
- **CMS**：Sanity（`/studio` 内嵌 Sanity Studio，博客/项目内容源）
- **数据库**：Neon（PostgreSQL）+ Drizzle ORM
- **鉴权**：Clerk（`middleware.ts` 中 `authMiddleware`）
- **缓存/限流**：Upstash Redis + `@upstash/ratelimit`；Vercel Edge Config（IP 封禁、访客地理信息）
- **邮件**：React Email + Resend
- **校验**：Zod（`env.mjs` 用 `@t3-oss/env` 风格做环境变量校验）
- **Flash 游戏**：`@ruffle-rs/ruffle`（通过 CDN 脚本加载，见游戏中心）

## 常用命令

包管理器为 **pnpm**（务必用 pnpm，勿用 npm/yarn）。

```bash
pnpm install          # 安装依赖
pnpm dev              # 启动开发服务器 (localhost:3000)
pnpm dev:turbo        # Turbopack 模式开发
pnpm dev:email        # React Email 预览 (端口 3333)
pnpm build            # 生产构建
pnpm start            # 启动生产服务
pnpm lint             # ESLint 检查
pnpm db:generate      # Drizzle 生成迁移 (drizzle-kit generate:pg)
pnpm db:push          # 推送 schema 到数据库 (drizzle-kit push:pg)
```

> Windows PowerShell 注意：命令分隔符用 `;` 而非 `&&`。

## 目录结构

```
app/
  (main)/            # 前台页面（路由组），含各页面局部组件（Header/Footer 等）
    game-center/     # 游戏中心（SWF/Flash，Ruffle 模拟器）
    blog/ projects/ ama/ guestbook/ newsletters/ tools/ game/ cg/ ...
  admin/             # 后台管理（评论/订阅者/Newsletter）
  api/               # Route Handlers（activity/comments/guestbook/newsletter/...）
  studio/            # Sanity Studio 内嵌
components/          # 全局共享组件（ui/、portable-text/、links/、GameUi/ 等）
config/              # 站点配置：nav.ts（导航）、kv.ts、email.ts
db/                  # Drizzle：schema.ts、queries/、dto/、migrations/
sanity/              # Sanity schema、queries、lib
emails/              # React Email 模板
lib/                 # 工具函数（date/ip/redis/seo/validation 等）
assets/              # 图标（icons/）与图片
public/              # 静态资源（含 swf/ 游戏文件、images/games/ 封面）
env.mjs              # 环境变量校验（server/client 分区）
middleware.ts        # Clerk 鉴权 + IP 封禁 + 访客地理
```

## 代码约定

- **路径别名**：`~/*` 映射到项目根（如 `~/components/ui/Container`、`~/config/nav`）。禁用相对路径 `../../`，统一用 `~`。
- **组件划分**：默认 Server Component；需要交互/浏览器 API 的文件顶部加 `'use client'`。仅客户端库用 `dynamic(() => import(...), { ssr: false })`。
- **样式**：只用 Tailwind 工具类；深色模式用 `dark:` 前缀。自定义动画在 `tailwind.config.cjs` 的 `extend.animation` / `keyframes` 中定义（如 `animate-gradient-x`、`animate-glow-pulse`）。
- **Prettier**：单引号、无分号、`trailingComma: es5`。已启用 `prettier-plugin-tailwindcss`（自动排序类名）。
- **ESLint**：`next lint`，含 `simple-import-sort`、`unused-imports`。import 顺序由插件自动排序。
- **TypeScript**：`strict: false`，但 `noUncheckedIndexedAccess: true`（数组/对象索引访问需判空）。
- **导航**：新增前台页面需在 `config/nav.ts` 注册；非公开页面需在 `middleware.ts` 的 `publicRoutes` 白名单中配置（否则会被 Clerk 拦截）。
- **数据库**：改表结构先改 `db/schema.ts`，再 `pnpm db:generate` 生成迁移。查询集中在 `db/queries/`。
- **环境变量**：新增变量必须在 `env.mjs` 中声明（server/client 分区 + Zod 校验），否则运行时校验失败。本地缺变量可用 `SKIP_ENV_VALIDATION=1` 跳过。

## 验证流程

改完代码后，建议按序验证：

1. `pnpm lint` 通过
2. `pnpm dev` 启动，浏览器访问相关页面确认无运行时报错
3. 涉及构建配置（`next.config.mjs` / `tailwind.config.cjs`）改动后，若遇到 `ChunkLoadError`，清理缓存重启：`Remove-Item -Recurse -Force .next; pnpm dev`

## 注意事项

- 本仓库不修改 git 全局配置；提交时若身份缺失，用 `git -c user.name=... -c user.email=...` 临时指定。
- 提交前排除临时截图、`.next`、调试产物等，勿混入无关改动。
- 需要第三方服务（Clerk / Neon / Sanity / Upstash / Resend）的环境变量才能完整运行，本地缺失时部分功能不可用属正常。
- SWF 游戏文件放在 `public/swf/`，通过 Ruffle 从 CDN 加载运行；封面图在 `public/images/games/`。
