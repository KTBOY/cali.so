'use client'

import { clsxm } from '@zolplay/utils'
import { useTranslations } from 'next-intl'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import {
  type CancelToken,
  compressGif,
  type CompressProgress,
  type CompressResult,
  inspectGif,
  isLikelyGif,
} from '~/app/(main)/tools/gif-compress/compress'

type Status = 'idle' | 'compressing' | 'done' | 'error'

/** 目标体积档位 */
const TARGET_OPTIONS = [
  { label: '512 KB', bytes: 512 * 1024 },
  { label: '1 MB', bytes: 1024 * 1024 },
  { label: '2 MB', bytes: 2 * 1024 * 1024 },
  { label: '5 MB', bytes: 5 * 1024 * 1024 },
] as const

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

type GifInfo = {
  width: number
  height: number
  frameCount: number
  totalDuration: number
}

export function GifCompressor() {
  const t = useTranslations('gifCompress')
  const [gifFile, setGifFile] = useState<File | null>(null)
  const [gifInfo, setGifInfo] = useState<GifInfo | null>(null)
  const [originalUrl, setOriginalUrl] = useState<string | null>(null)
  const [targetBytes, setTargetBytes] = useState<number>(1024 * 1024)
  const [dither, setDither] = useState(true)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [progress, setProgress] = useState<CompressProgress | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<
    (CompressResult & { url: string; name: string }) | null
  >(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const bufferRef = useRef<ArrayBuffer | null>(null)
  const cancelRef = useRef<CancelToken | null>(null)

  const fmtDuration = (ms: number) =>
    t('durationSeconds', { value: (ms / 1000).toFixed(1) })

  // 卸载时取消进行中的任务并释放 URL
  useEffect(() => {
    return () => {
      if (cancelRef.current) cancelRef.current.cancelled = true
    }
  }, [])

  const resetResult = useCallback(() => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return null
    })
    setStatus('idle')
    setMessage('')
    setProgress(null)
  }, [])

  const pickGif = useCallback(
    async (file: File) => {
      resetResult()
      setGifInfo(null)
      try {
        const buffer = await file.arrayBuffer()
        if (!isLikelyGif(new Uint8Array(buffer))) {
          setStatus('error')
          setMessage(t('invalidGif'))
          return
        }
        bufferRef.current = buffer
        setGifFile(file)
        setGifInfo(inspectGif(buffer))
        setOriginalUrl((prev) => {
          if (prev) URL.revokeObjectURL(prev)
          return URL.createObjectURL(file)
        })
      } catch (err) {
        setStatus('error')
        setMessage(
          err instanceof Error
            ? t('readFailed', { message: err.message })
            : t('readUnknownError')
        )
      }
    },
    [resetResult, t]
  )

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void pickGif(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!/\.gif$/i.test(file.name)) {
      setStatus('error')
      setMessage(t('dropGifOnly'))
      return
    }
    void pickGif(file)
  }

  const handleCompress = useCallback(async () => {
    const buffer = bufferRef.current
    if (!buffer || !gifFile) return

    resetResult()
    setStatus('compressing')
    setMessage(t('decoding'))

    const token: CancelToken = { cancelled: false }
    cancelRef.current = token

    try {
      const res = await compressGif(buffer, {
        targetBytes,
        dither,
        cancelToken: token,
        onProgress: (p) => {
          setProgress(p)
          setMessage(
            t('progressText', {
              attempt: p.attempt,
              total: p.totalAttempts,
              scale: Math.round(p.params.scale * 100),
              step: p.params.frameStep,
              colors: p.params.colors,
              frame: p.frame,
              totalFrames: p.totalFrames,
            })
          )
        },
      })
      if (token.cancelled) return

      const base = gifFile.name.replace(/\.gif$/i, '')
      setResult({
        ...res,
        url: URL.createObjectURL(res.blob),
        name: `${base}-compressed.gif`,
      })
      setStatus('done')
      setMessage(res.metTarget ? t('done') : t('doneNotMet'))
    } catch (err) {
      if (token.cancelled) return
      setStatus('error')
      setMessage(
        err instanceof Error
          ? t('compressError', { message: err.message })
          : t('compressUnknownError')
      )
    } finally {
      setProgress(null)
    }
  }, [gifFile, targetBytes, dither, resetResult, t])

  const triggerDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = result.name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const ratio =
    result && gifFile ? ((result.blob.size / gifFile.size) * 100).toFixed(1) : null

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* ============ 左侧：操作区 ============ */}
      <div className="lg:col-span-3">
        <div className="rounded-3xl border border-black/[0.06] bg-white/80 p-6 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] backdrop-blur sm:p-8 dark:border-white/[0.06] dark:bg-white/[0.03]">
          {/* 步骤 1：选择 GIF */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              1
            </span>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('step1')}
            </h2>
          </div>

          {/* 拖放区 */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={clsxm(
              'mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300',
              isDragging
                ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-400/50 dark:bg-emerald-500/5'
                : 'border-zinc-200 bg-zinc-50/50 hover:border-emerald-200 hover:bg-emerald-50/40 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-emerald-400/30'
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".gif,image/gif"
              className="hidden"
              onChange={handleInput}
            />
            {gifFile ? (
              <div className="flex flex-col items-center gap-1.5">
                {originalUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={originalUrl}
                    alt={t('originalPreviewAlt')}
                    className="max-h-40 rounded-xl border border-black/[0.06] object-contain dark:border-white/10"
                  />
                )}
                <p className="mt-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {gifFile.name}
                </p>
                <p className="text-xs font-light text-zinc-400">
                  {formatBytes(gifFile.size)}
                  {gifInfo &&
                    ` · ${gifInfo.width}×${gifInfo.height} · ${t('frames', {
                      count: gifInfo.frameCount,
                    })} · ${fmtDuration(gifInfo.totalDuration)}`}
                  {` · ${t('reselectHint')}`}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </span>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  {t('dropHint')}
                </p>
                <p className="text-xs font-light text-zinc-400">
                  {t('gifOnlyHint')}
                </p>
              </div>
            )}
          </div>

          {/* 步骤 2：目标体积 */}
          <div className="mt-8 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
              2
            </span>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('step2')}
            </h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {TARGET_OPTIONS.map((opt) => (
              <label
                key={opt.bytes}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm transition-colors has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50/50 has-[:checked]:font-medium has-[:checked]:text-emerald-700 dark:border-white/10 dark:bg-white/[0.02] dark:has-[:checked]:border-emerald-400/40 dark:has-[:checked]:bg-emerald-500/5 dark:has-[:checked]:text-emerald-300"
              >
                <input
                  type="radio"
                  name="target"
                  className="hidden"
                  checked={targetBytes === opt.bytes}
                  onChange={() => {
                    setTargetBytes(opt.bytes)
                    resetResult()
                  }}
                />
                <span className="text-zinc-600 dark:text-zinc-300">{opt.label}</span>
              </label>
            ))}
          </div>

          {/* 步骤 3：抖动开关 */}
          <div className="mt-8 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-400 dark:bg-white/5">
              3
            </span>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('step3')}
              <span className="ml-1.5 text-xs font-light text-zinc-400">
                {t('optional')}
              </span>
            </h2>
          </div>
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 transition-colors has-[:checked]:border-emerald-300 has-[:checked]:bg-emerald-50/50 dark:border-white/10 dark:bg-white/[0.02] dark:has-[:checked]:border-emerald-400/40 dark:has-[:checked]:bg-emerald-500/5">
            <input
              type="checkbox"
              checked={dither}
              onChange={(e) => {
                setDither(e.target.checked)
                resetResult()
              }}
              className="mt-0.5 h-4 w-4 accent-emerald-400"
            />
            <span>
              <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                {t('ditherLabel')}
              </span>
              <span className="mt-0.5 block text-xs font-light text-zinc-400">
                {t('ditherDesc')}
              </span>
            </span>
          </label>

          {/* 压缩按钮 */}
          <button
            type="button"
            onClick={handleCompress}
            disabled={!gifFile || status === 'compressing'}
            className={clsxm(
              'mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-300',
              !gifFile || status === 'compressing'
                ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-white/5'
                : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-white shadow-lg shadow-emerald-400/25 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-400/40'
            )}
          >
            {status === 'compressing' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t('compressing')}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
                </svg>
                {t('startCompress')}
              </>
            )}
          </button>

          {/* 进度 / 状态提示 */}
          {status === 'compressing' && message && (
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
              <p className="text-xs font-light text-emerald-700 dark:text-emerald-300">
                {message}
              </p>
              {progress && (
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-500/20">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all duration-200"
                    style={{
                      width: `${Math.round((progress.frame / progress.totalFrames) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          )}
          {message && status === 'error' && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-300">
              {message}
            </p>
          )}
        </div>
      </div>

      {/* ============ 右侧：结果 + 说明 ============ */}
      <div className="space-y-6 lg:col-span-2">
        {/* 结果卡片 */}
        <div className="overflow-hidden rounded-3xl border border-black/[0.06] bg-white/80 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] backdrop-blur dark:border-white/[0.06] dark:bg-white/[0.03]">
          <div className="border-b border-black/[0.04] px-6 py-4 dark:border-white/[0.06]">
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t('resultTitle')}
            </h2>
          </div>
          <div className="px-6 py-8">
            {result && status === 'done' ? (
              <div className="flex flex-col items-center text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.url}
                  alt={t('resultPreviewAlt')}
                  className="max-h-48 rounded-xl border border-black/[0.06] object-contain dark:border-white/10"
                />
                <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {result.name}
                </p>
                <p className="text-xs font-light text-zinc-400">
                  {formatBytes(result.blob.size)}
                  {gifFile &&
                    ` · ${t('originalSize', { size: formatBytes(gifFile.size) })}`}
                  {ratio && ` · ${t('compressedTo', { ratio })}`}
                </p>

                {/* 方案明细 */}
                <dl className="mt-4 w-full space-y-1.5 rounded-2xl bg-zinc-50/80 px-4 py-3 text-left text-xs font-light text-zinc-500 dark:bg-white/[0.03] dark:text-zinc-400">
                  <div className="flex justify-between">
                    <dt>{t('dlSize')}</dt>
                    <dd>
                      {result.originalWidth}×{result.originalHeight} →{' '}
                      {result.width}×{result.height}
                      {t('scalePercent', {
                        percent: Math.round(result.scale * 100),
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t('dlFrames')}</dt>
                    <dd>
                      {t('frames', { count: result.originalFrameCount })} →{' '}
                      {t('frames', { count: result.frameCount })}
                      {result.frameStep > 1 &&
                        t('frameStepNote', { step: result.frameStep })}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t('dlColors')}</dt>
                    <dd>
                      {t('colorsValue', { count: result.colors })}
                      {dither && t('withDither')}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>{t('dlDuration')}</dt>
                    <dd>
                      {fmtDuration(result.totalDuration)}
                      {t('unchanged')}
                    </dd>
                  </div>
                </dl>
                {!result.metTarget && (
                  <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] font-light leading-relaxed text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
                    {t('notMetHint')}
                  </p>
                )}

                <button
                  type="button"
                  onClick={triggerDownload}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-400/25 transition-all hover:from-emerald-500 hover:to-teal-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  {t('downloadGif')}
                </button>
                <p className="mt-3 text-[11px] font-light leading-relaxed text-zinc-400">
                  {t('downloadNote')}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-zinc-600">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 19.5h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Z" />
                  </svg>
                </span>
                <p className="mt-4 text-sm font-light text-zinc-400">
                  {t('emptyResult')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 说明卡片 */}
        <div className="rounded-3xl border border-black/[0.06] bg-gradient-to-b from-emerald-50/60 to-white p-6 dark:border-white/[0.06] dark:from-emerald-500/[0.04] dark:to-transparent">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t('notesTitle')}
          </h3>
          <ul className="mt-4 space-y-3 text-xs font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
            <li className="flex gap-2">
              <span className="text-emerald-400">·</span>
              <span>
                {t.rich('note1Rich', {
                  b: (chunks) => (
                    <b className="font-medium text-zinc-600 dark:text-zinc-300">
                      {chunks}
                    </b>
                  ),
                })}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">·</span>
              <span>
                {t.rich('note2Rich', {
                  b: (chunks) => (
                    <b className="font-medium text-zinc-600 dark:text-zinc-300">
                      {chunks}
                    </b>
                  ),
                })}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">·</span>
              {t('note3')}
            </li>
            <li className="flex gap-2">
              <span className="text-emerald-400">·</span>
              {t('note4')}
            </li>
          </ul>
        </div>

        {/* 原理卡片 */}
        <div className="rounded-3xl border border-black/[0.06] bg-white/60 p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t('principleTitle')}
          </h3>
          <p className="mt-4 text-xs font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
            {t.rich('principleRich', {
              code: (chunks) => (
                <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
                  {chunks}
                </code>
              ),
            })}
          </p>
        </div>
      </div>
    </div>
  )
}
