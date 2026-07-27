/*
 * @Author: zlc
 * @Date: 2025-07-17 20:28:13
 * @LastEditTime: 2026-04-13 11:35:10
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\config\nav.ts
 */
// text 为 messages/*.json 中 nav 命名空间的词条 key，渲染时翻译
export const navigationItems = [
  // { href: '/', text: 'home' }, // 首页暂时隐藏，/ 已重定向到 /bz
  { href: '/bz', text: 'wallpaper' },
  { href: '/game-center', text: 'gameCenter' },
  // { href: '/game', text: '电脑游戏' },
  // { href: '/cg', text: '橙光游戏' },
  { href: '/tools', text: 'tools' },
  { href: '/projects', text: 'projects' },
  // { href: '/guestbook', text: '留言墙' },
  // { href: '/ama', text: 'AMA 咨询' },
  // { href: '/about', text: '关于' },
]
