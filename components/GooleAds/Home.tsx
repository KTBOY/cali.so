'use client'
// components/AdSense.tsx
import React, { useEffect, useRef } from 'react';

// 扩展Window接口
declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

interface AdSenseProps {
  client: string;
  slot: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
  layout?: string;
  layoutKey?: string;
  className?: string;
}

const AdSense: React.FC<AdSenseProps> = ({
  client,
  slot,
  style = { display: 'block' },
  format = 'auto',
  responsive = false,
  layout = '',
  layoutKey = '',
  className = '',
}) => {
  const adRef = useRef<HTMLModElement>(null); // 修改此处类型
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && adRef.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        initializedRef.current = true;
      } catch (err) {
        console.log(err);
      }
    }
  }, []);

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`.trim()}
      style={style}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? 'true' : 'false'}
      data-ad-layout={layout}
      data-ad-layout-key={layoutKey}
    />
  );
};

export default AdSense;