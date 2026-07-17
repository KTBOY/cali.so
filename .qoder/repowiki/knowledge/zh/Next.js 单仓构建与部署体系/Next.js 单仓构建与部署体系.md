---
kind: build_system
name: Next.js 单仓构建与部署体系
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - turbo.json
    - vercel.json
    - next.config.mjs
    - env.mjs
    - next-sitemap.config.js
    - drizzle.config.ts
    - sanity.cli.ts
    - pnpm-workspace.yaml
---

本项目是一个基于 Next.js App Router 的单仓库个人站点，构建与部署围绕 Vercel + pnpm + Turborepo 展开，整体采用最小化脚本加集中配置的轻量风格。

1. 包管理与脚本
- 使用 pnpm 作为包管理器，根目录存在 pnpm-workspace.yaml（当前 packages 为空，仅声明 onlyBuiltDependencies），表明项目为单应用、未拆分子包。
- 核心 npm scripts 集中在 package.json：
  - 开发：dev 启动 Next.js dev server；dev:turbo 通过 next dev --turbo 启用 Next Turbopack 加速开发。
  - 构建：build 直接调用 next build，由上层编排器触发。
  - 数据库：db:generate / db:push 基于 drizzle-kit 生成/推送 schema。
  - 邮件模板：dev:email 启动 react-email 预览服务。
  - TWA：提供 bubblewrap CLI 初始化、检查、更新、打包等脚本，用于将 PWA 转为 Android Web App。
- 代码质量：lint 复用 next lint，配合 ESLint 与 Prettier 插件统一规范。

2. 构建缓存与任务编排（Turborepo）
- 通过 turbo.json 定义 pipeline：
  - dev：禁用缓存、标记为持久任务，适配交互式开发。
  - build：缓存产物 .next/**（排除 .next/cache）。
  - lint：默认行为。
- 该配置使项目具备多包扩展能力，当前虽为单应用，但已预留 Turborepo 缓存语义。

3. 运行时与环境校验
- next.config.mjs 在构建/开发入口动态导入 env.mjs，并通过 SKIP_ENV_VALIDATION 环境变量控制是否跳过校验（便于 Docker 等非 Vercel 环境）。
- env.mjs 使用 Zod 对服务端与客户端环境变量进行严格校验，并通过 Proxy 阻止客户端访问服务端变量，确保构建期/运行期安全。

4. 静态资源与 SEO 构建后处理
- next-sitemap.config.js 配置站点 URL、robots.txt 生成、sitemap 策略，在构建阶段产出 sitemap 与 robots 文件。
- public/ 下集中存放 favicon、manifest、ads.txt、sw.js 等静态资源，供 Next.js 静态托管。

5. 部署与平台集成
- vercel.json 指定 buildCommand: pnpm turbo build，Vercel 拉取代码后通过 Turborepo 执行构建，利用其远程缓存加速 CI。
- GitHub Actions 未在仓库中显式暴露（.github 下仅有 FUNDING.yml），说明主要依赖 Vercel 原生构建流程。

6. 数据层与内容管理构建辅助
- drizzle.config.ts 指向 ./db/schema.ts 与 ./db/migrations，配合 DATABASE_URL 完成迁移与类型生成。
- sanity.cli.ts 读取 NEXT_PUBLIC_SANITY_* 环境变量，驱动 sanity CLI 操作 CMS。
- Sanity 与 Next.js 的图像 CDN 白名单在 next.config.mjs 的 images.remotePatterns 中声明，确保构建期图片优化能正确解析远端资源。

7. 约定与约束
- 所有环境变量必须通过 env.mjs 的 Zod schema 声明，新增变量需同步更新 server/client 对象并保证 NEXT_PUBLIC_ 前缀区分。
- 构建产物以 .next 为核心，Turborepo 缓存路径与其保持一致。
- 如需本地或容器化构建，设置 SKIP_ENV_VALIDATION=1 可绕过 env 校验，但仍需提供必要的环境变量。
- 当前未引入 Dockerfile 或 Makefile，构建完全交由 pnpm/Turborepo/Next.js 生态完成。