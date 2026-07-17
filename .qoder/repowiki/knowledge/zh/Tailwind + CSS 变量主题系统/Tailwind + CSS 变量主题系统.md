---
kind: frontend_style
name: Tailwind + CSS 变量主题系统
category: frontend_style
scope:
    - '**'
source_files:
    - tailwind.config.cjs
    - app/globals.css
    - postcss.config.cjs
    - app/prism.css
    - components/ui/Button.tsx
    - components/Prose.tsx
    - app/(main)/ThemeSwitcher.tsx
---

## 样式体系概览

本项目采用 **Tailwind CSS** 作为核心样式框架，结合 **CSS 自定义属性（CSS Variables）** 实现明暗主题切换，并辅以少量手写 CSS 文件处理特定场景（代码高亮、第三方库覆盖等）。

### 1. 样式工具链
- **构建器**: Tailwind CSS v3 + PostCSS（`postcss.config.cjs` 启用 `tailwindcss/nesting`、`autoprefixer`）
- **内容扫描**: `app/**/*.tsx`、`components/**/*.tsx`、`node_modules/@tremor/**/*`（Tremor 图表组件）
- **插件**: `@tailwindcss/typography`（博客排版）、`@headlessui/tailwindcss`（无头 UI 样式）
- **类名合并**: 通过 `clsxm`（来自 `@zolplay/utils`）统一拼接 className，避免冲突

### 2. 主题与颜色设计
- **深色模式策略**: `darkMode: 'class'`，通过 `<html>` 的 `light` / `dark` class 切换
- **背景色变量**: `--bg-color` 在 `globals.css` 中定义，`html.light` → `zinc.50`，`html.dark` → `primary.900`（`#000212`）
- **品牌色**: `colors.primary.900 = '#000212'` 作为深色主背景；正文使用 `zinc` 色系，链接强调用 `teal` 系列
- **Tremor 扩展**: 为图表组件提供独立的 light/dark 调色板（`tremor.*`、`dark-tremor.*`），包含 brand/background/border/ring/content 五组语义化色阶
- **字体**: `fontFamily.sans` 注入 `var(--font-sans)`，配合 Next.js 字体优化
- **字号阶梯**: 从 `xs(0.8125rem)` 到 `9xl(8rem)` 完整定义行高，标题行高压缩至 1

### 3. 排版系统（Typography）
- 基于 `@tailwindcss/typography` 深度定制 `prose` 样式：
  - 正文 `zinc.600`，标题 `zinc.900`，链接 `teal.500`，引用边框 `yellow.300`
  - 代码块 `pre` 圆角 `3xl`，左侧无边框，背景 `zinc.900`（浅色）/ 半透明黑（深色）
  - 表格、列表、引用、图片 caption 均有精细间距与边框控制
  - 提供 `invert` 变体用于深色模式下的 prose 反色
- 博客文章通过 `<Prose>` 组件包裹，自动应用 `prose dark:prose-invert`

### 4. 代码高亮（Prism.js）
- 独立 `app/prism.css` 文件，使用 Tailwind `@apply` 指令复用主题色
- 支持 diff 语法（inserted/deleted 行带左侧边框与 +/- 标记）
- 深浅色下 token 颜色映射不同（如 tag/class-name 浅色用 `blue-700`，深色用 `blue-300`）

### 5. 组件级样式约定
- **基础按钮** (`components/ui/Button.tsx`): 定义 `primary` / `secondary` 两种 variant，通过 `variantStyles` 对象集中管理，使用 `clsxm` 合并用户传入 className
- **图标资源** (`assets/icons/*.tsx`): 全部以 React 函数组件形式导出 SVG，通过 `className` 传递尺寸与颜色，保持与 Tailwind 一致
- **全局 z-index**: `globals.css` 中为 Radix Popper/Floating UI 设置 `z-index: 99999+`，确保弹窗层级正确
- **选择器样式**: 文本选中区域使用 `lime.500` 背景 + `lime.950` 文字，形成视觉亮点
- **动画**: 定义 `typing-pulse` keyframes，配合 Tailwind `animate-typing` 使用

### 6. 开发者规范
- 优先使用 Tailwind 原子类，仅在必要时写独立 `.css` 文件
- 所有组件 className 必须经 `clsxm` 合并，禁止直接字符串拼接
- 主题相关样式统一通过 `dark:` 前缀或 CSS 变量，不硬编码颜色值
- 新增颜色需同步更新 `safelist` 中的正则白名单（当前已覆盖 `bg-/text-/border-/ring-/stroke-/fill-*` 全色系）
- 第三方库样式覆盖放在独立 CSS 文件（如 `prism.css`、`clerk.css`），不在组件内嵌 style