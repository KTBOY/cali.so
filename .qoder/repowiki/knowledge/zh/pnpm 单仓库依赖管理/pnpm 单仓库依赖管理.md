---
kind: dependency_management
name: pnpm 单仓库依赖管理
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - pnpm-lock.yaml
    - pnpm-workspace.yaml
    - turbo.json
---

本项目采用 pnpm 作为包管理器，使用单一 `package.json` 声明所有运行时与开发时依赖，并通过 `pnpm-lock.yaml` 锁定版本。项目未启用多包工作区（`pnpm-workspace.yaml` 中 `packages: []`），所有依赖集中在根级安装，由 Next.js + Turborepo 驱动构建与缓存。

- 包管理器与锁文件：pnpm + `pnpm-lock.yaml`；`pnpm-workspace.yaml` 仅配置 `onlyBuiltDependencies: [esbuild]`，无子包。
- 依赖分类：`dependencies` 包含 Next.js、React、Sanity、Drizzle ORM、Upstash Redis、Clerk、Resend 等运行时库；`devDependencies` 包含 TypeScript、ESLint、Prettier、Tailwind、Turborepo 等开发工具。
- 脚本入口：通过 `scripts` 暴露 `dev`/`build`/`lint`/`db:*`/`twa:*` 等命令，其中 `dev:turbo` 走 Turborepo 的 turbo dev 管线。
- 构建缓存：`turbo.json` 将 `.next/**` 标记为 build 输出并排除 cache，配合 pnpm 的 store 实现跨任务增量构建。
- 无私有源或 vendoring：未发现 `.npmrc`/`.pnpmfile.cjs`/`vercel.json` 中的 registry 覆盖，也未见 vendor 目录，依赖均从 npm 官方源拉取。

开发者约定
- 新增依赖统一在根 `package.json` 的对应字段下声明，避免在子目录重复声明。
- 修改依赖后提交 `pnpm-lock.yaml`，确保 CI 与本地行为一致。
- 仅在需要时调整 `pnpm-workspace.yaml` 的 `onlyBuiltDependencies`，以优化原生模块安装性能。
- 使用 `pnpm add -D` 添加开发依赖，`pnpm add` 添加运行依赖，保持 `devDependencies` 与 `dependencies` 边界清晰。