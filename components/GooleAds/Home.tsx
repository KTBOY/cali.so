/*
 * @Author: zlc
 * @Date: 2025-10-21 10:17:02
 * @LastEditTime: 2025-10-21 14:36:43
 * @LastEditors: zlc
 * @Description: 
 * @FilePath: \cali.so\components\GooleAds\Home.tsx
 */

'use client'

import React from 'react';

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
    <div>
      <ins className="adsbygoogle"
        style={{display: 'block'}}
        data-ad-client="ca-pub-8512812906555915"
        data-ad-slot="2392600980"
        data-ad-format="auto"
        data-full-width-responsive="true"></ins>
    </div>
  )
};