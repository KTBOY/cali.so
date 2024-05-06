/*
 * @Author: zlc
 * @Date: 2024-03-26 19:40:33
 * @LastEditTime: 2024-04-29 16:33:21
 * @LastEditors: zlc
 * @Description:
 * @FilePath: \cali.so\lib\seo.ts
 */
export const seo = {
  title: 'Cali Castle | 开发者、设计师、细节控、创始人',
  description: '我叫 舒克',
  url: new URL(
    process.env.NODE_ENV === 'production'
      ? 'https://cali.so'
      : 'http://localhost:3000'
  ),
} as const
