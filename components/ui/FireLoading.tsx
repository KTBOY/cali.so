import { useTranslations } from 'next-intl'

import styles from './FireLoading.module.css'

// 全站统一的火焰 Loading 效果（Uiverse.io by S3nouy，深红色定制版）
export function FireLoading({ text }: { text?: string }) {
  const t = useTranslations('common')
  const displayText = text ?? t('loading')
  return (
    <div className={styles.wrapper}>
      <div className={styles.fire}>
        <div className={styles.fireLeft}>
          <div className={styles.mainFire} />
          <div className={styles.particleFire} />
        </div>
        <div className={styles.fireCenter}>
          <div className={styles.mainFire} />
          <div className={styles.particleFire} />
        </div>
        <div className={styles.fireRight}>
          <div className={styles.mainFire} />
          <div className={styles.particleFire} />
        </div>
        <div className={styles.fireBottom}>
          <div className={styles.mainFire} />
        </div>
      </div>
      <p className={styles.text}>{displayText}</p>
    </div>
  )
}
