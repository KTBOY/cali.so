## Cali 个人博客网站

Cali 的个人博客网站 [https://cali.so/](https://cali.so/) 的源代码。

需要其他服务商的环境变量才能正常运行，所以如果你想要在本地运行，需要自己配置。

可查看 `.env.example` 文件，里面包含了所有需要的环境变量。

### 技术栈

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)
- [Clerk](https://clerk.com/)
- [Neon](https://neon.tech/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Sanity](https://www.sanity.io/)
- [React Email](https://react.email)
- [Resend](https://resend.com/)

### 教程

想部署成自己的网站？可以查看 Cali 的[官方教程](https://cali.so/blog/guide-for-cloning-my-site)

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建
pnpm build
```

通过 [Vercel](https://vercel.com/) 一键部署。

### 变更日志

- 2024-03-13: **v2.0** 更新了 Sanity 到最新版，Next.js 到 v14.1，提取了首页图片和工作经历到 Sanity 设置里。
- 2024-03-10: **v1.1** 从 PlanetScale 数据库迁移到了 [Neon](https://neon.tech/) 数据库（MySQL -> PostgreSQL），因为 PlanetScale [宣布不再支持免费数据库](https://planetscale.com/blog/planetscale-forever)。



广告支持
npm install --save react-ssr-adsense
react接入google广告: 支持服务端渲染
原创:react01/18/2021发布pv：1uv：0ip：0twitter #react
原文地址：https://www.douyacun.com/article/43284034aeede40846638a36caa18592
https://www.douyacun.com/article/43284034aeede40846638a36caa18592
@hustcc react-adsense 不支持服务端渲染框架，受 react-adsense 启发写了 react-ssr-adsense

/*
 * @Author: zlc
 * @Date: 2025-10-21 10:17:02
 * @LastEditTime: 2025-10-22 19:51:11
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\components\GooleAds\Home.tsx
 */

'use client'
import React from 'react';
import AdSense from 'react-ssr-adsense';

// 扩展 window 接口类型
declare global {
  interface Window {
    adsbygoogle: Array<unknown>;
  }
}
export const GoogleAds = () => {
  React.useEffect(() => {
    window.adsbygoogle = window.adsbygoogle || []
  }, []);

  return (
    // <div>
    //   <ins className="adsbygoogle"
    //     style={{display: 'block'}}
    //     data-ad-client="ca-pub-8512812906555915"
    //     data-ad-slot="2392600980"
    //     data-ad-format="auto"
    //     data-full-width-responsive="true"></ins>
    // </div>
    <AdSense
      client='ca-pub-8512812906555915'
      slot='2392600980'
      style={{ display: 'block' }}
      layout='in-article'
      format='fluid'
    />
    // auto full width responsive ads 自动全屏广告
    /* <AdSense
      client='ca-pub-7292810486004926'
      slot='7806394673'
      style={{ display: 'block' }}
      format='auto'
      responsive='true'
      layoutKey='-gw-1+2a-9x+5c'
    /> */

  )
};
## Bubblewrap Android ���
已给项目加好 Bubblewrap/TWA 打包基础配置，并把前置 PWA 条件补齐了。

主要改动：

新增 Bubblewrap 主配置：twa-manifest.json
增加打包脚本（twa:init / doctor / update / build / install）：package.json
修正 Web Manifest（name/short_name/start_url/scope/icons）：site.webmanifest
新增 Service Worker：sw.js
在布局中注册 SW：layout.tsx
新增 Digital Asset Links 模板：assetlinks.json
防止签名文件误提交：.gitignore
补充了 README 打包说明：README.md
校验结果：

npm run lint 已通过。
尝试运行 twa:doctor 时，Bubblewrap 提示需要 JDK 17（你当前是 Java 8），所以还不能在这里直接产出 APK/AAB。
下一步你本机执行：

安装 JDK 17（并配置 JAVA_HOME），准备 Android SDK。
运行 npm run twa:init，然后 npm run twa:update。
运行 npm run twa:build 生成包。
另外我按 https://www.ps520.asia 作为线上域名写入了配置；如果你最终域名不是它，我可以帮你一键改成正确域名。