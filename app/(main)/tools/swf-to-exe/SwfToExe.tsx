'use client'

import { clsxm } from '@zolplay/utils'
import React, { useCallback, useRef, useState } from 'react'

/** 打包后的 Flash 独立播放器（干净的 projector，末尾无附带 SWF） */
const BUNDLED_PROJECTOR_URL = '/tools/flash-projector.exe'

/** Flash projector 读取附带 SWF 时使用的页脚魔数：0xFA123456（小端存储） */
const FOOTER_MAGIC = [0x56, 0x34, 0x12, 0xfa] as const

type Status = 'idle' | 'converting' | 'done' | 'error'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/** 校验是否为合法 SWF：文件头应为 FWS / CWS / ZWS */
function isLikelySwf(bytes: Uint8Array): boolean {
  if (bytes.length < 3) return false
  const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2])
  return sig === 'FWS' || sig === 'CWS' || sig === 'ZWS'
}

/**
 * 将 SWF 附加到 Flash 独立播放器末尾，生成自运行 EXE。
 * 结构： [projector.exe] + [swf] + [魔数 4B] + [swf 长度 4B 小端]
 */
function buildExe(projector: Uint8Array, swf: Uint8Array): Blob {
  const footer = new Uint8Array(8)
  footer.set(FOOTER_MAGIC, 0)
  const len = swf.length
  footer[4] = len & 0xff
  footer[5] = (len >>> 8) & 0xff
  footer[6] = (len >>> 16) & 0xff
  footer[7] = (len >>> 24) & 0xff

  const out = new Uint8Array(projector.length + swf.length + footer.length)
  out.set(projector, 0)
  out.set(swf, projector.length)
  out.set(footer, projector.length + swf.length)

  return new Blob([out], { type: 'application/octet-stream' })
}

export function SwfToExe() {
  const [swfFile, setSwfFile] = useState<File | null>(null)
  const [useCustomProjector, setUseCustomProjector] = useState(false)
  const [projectorFile, setProjectorFile] = useState<File | null>(null)
  const [outputName, setOutputName] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [result, setResult] = useState<{ url: string; name: string; size: number } | null>(
    null
  )

  const swfInputRef = useRef<HTMLInputElement>(null)
  const projectorInputRef = useRef<HTMLInputElement>(null)

  const resetResult = useCallback(() => {
    setResult((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return null
    })
    setStatus('idle')
    setMessage('')
  }, [])

  const pickSwf = useCallback(
    (file: File) => {
      resetResult()
      setSwfFile(file)
      // 依据 swf 文件名推导默认输出名
      const base = file.name.replace(/\.swf$/i, '')
      setOutputName(base || 'flash-game')
    },
    [resetResult]
  )

  const handleSwfInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) pickSwf(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!/\.swf$/i.test(file.name)) {
      setStatus('error')
      setMessage('请拖入 .swf 格式的文件。')
      return
    }
    pickSwf(file)
  }

  const handleConvert = useCallback(async () => {
    if (!swfFile) return
    setStatus('converting')
    setMessage('正在读取文件…')

    try {
      // 1. 读取 SWF
      const swf = new Uint8Array(await swfFile.arrayBuffer())
      if (!isLikelySwf(swf)) {
        setStatus('error')
        setMessage('这个文件看起来不是有效的 SWF（文件头应为 FWS / CWS / ZWS）。')
        return
      }

      // 2. 读取播放器（内置或自定义）
      let projector: Uint8Array
      if (useCustomProjector) {
        if (!projectorFile) {
          setStatus('error')
          setMessage('你选择了使用自定义播放器，请先选择一个 Flash 播放器 .exe 文件。')
          return
        }
        setMessage('正在读取自定义播放器…')
        projector = new Uint8Array(await projectorFile.arrayBuffer())
      } else {
        setMessage('正在载入内置 Flash 播放器…')
        const res = await fetch(BUNDLED_PROJECTOR_URL)
        if (!res.ok) {
          throw new Error(`内置播放器加载失败（${res.status}）`)
        }
        projector = new Uint8Array(await res.arrayBuffer())
      }

      if (projector[0] !== 0x4d || projector[1] !== 0x5a) {
        setStatus('error')
        setMessage('播放器文件似乎不是有效的 Windows 可执行程序（缺少 MZ 头）。')
        return
      }

      // 3. 拼装 EXE
      setMessage('正在打包…')
      const blob = buildExe(projector, swf)
      const url = URL.createObjectURL(blob)
      const safeName = (outputName.trim() || 'flash-game').replace(/\.exe$/i, '')

      setResult({ url, name: `${safeName}.exe`, size: blob.size })
      setStatus('done')
      setMessage('打包完成！')
    } catch (err) {
      setStatus('error')
      setMessage(
        err instanceof Error ? `打包出错：${err.message}` : '打包过程中发生未知错误。'
      )
    }
  }, [swfFile, useCustomProjector, projectorFile, outputName])

  const triggerDownload = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.url
    a.download = result.name
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* ============ 左侧：操作区 ============ */}
      <div className="lg:col-span-3">
        <div className="rounded-3xl border border-black/[0.06] bg-white/80 p-6 shadow-[0_10px_40px_-24px_rgba(0,0,0,0.3)] backdrop-blur sm:p-8 dark:border-white/[0.06] dark:bg-white/[0.03]">
          {/* 步骤 1：选择 SWF */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
              1
            </span>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              选择 SWF 文件
            </h2>
          </div>

          {/* 拖放区 */}
          <div
            onClick={() => swfInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={clsxm(
              'mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-300',
              isDragging
                ? 'border-rose-300 bg-rose-50/70 dark:border-rose-400/50 dark:bg-rose-500/5'
                : 'border-zinc-200 bg-zinc-50/50 hover:border-rose-200 hover:bg-rose-50/40 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-rose-400/30'
            )}
          >
            <input
              ref={swfInputRef}
              type="file"
              accept=".swf,application/x-shockwave-flash"
              className="hidden"
              onChange={handleSwfInput}
            />
            {swfFile ? (
              <div className="flex flex-col items-center gap-1.5">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <p className="mt-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {swfFile.name}
                </p>
                <p className="text-xs font-light text-zinc-400">
                  {formatBytes(swfFile.size)} · 点击可重新选择
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-400 dark:bg-white/5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </span>
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
                  点击选择，或将 .swf 文件拖到这里
                </p>
                <p className="text-xs font-light text-zinc-400">
                  仅支持 Flash 的 .swf 格式
                </p>
              </div>
            )}
          </div>

          {/* 步骤 2：输出名称 */}
          <div className="mt-8 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-xs font-semibold text-rose-500 dark:bg-rose-500/15 dark:text-rose-300">
              2
            </span>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              输出文件名
            </h2>
          </div>
          <div className="mt-4 flex items-center overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/50 focus-within:border-rose-300 dark:border-white/10 dark:bg-white/[0.02] dark:focus-within:border-rose-400/40">
            <input
              type="text"
              value={outputName}
              onChange={(e) => setOutputName(e.target.value)}
              placeholder="flash-game"
              className="w-full bg-transparent px-4 py-3 text-sm text-zinc-700 outline-none placeholder:text-zinc-400 dark:text-zinc-200"
            />
            <span className="select-none px-4 py-3 text-sm font-light text-zinc-400">
              .exe
            </span>
          </div>

          {/* 步骤 3（可选）：自定义播放器 */}
          <div className="mt-8 flex items-center gap-2.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-400 dark:bg-white/5">
              3
            </span>
            <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              播放器内核
              <span className="ml-1.5 text-xs font-light text-zinc-400">
                （可选）
              </span>
            </h2>
          </div>

          <div className="mt-4 space-y-2.5">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 transition-colors has-[:checked]:border-rose-300 has-[:checked]:bg-rose-50/50 dark:border-white/10 dark:bg-white/[0.02] dark:has-[:checked]:border-rose-400/40 dark:has-[:checked]:bg-rose-500/5">
              <input
                type="radio"
                name="projector"
                checked={!useCustomProjector}
                onChange={() => {
                  setUseCustomProjector(false)
                  resetResult()
                }}
                className="mt-0.5 h-4 w-4 accent-rose-400"
              />
              <span>
                <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  使用内置 Flash 播放器（推荐）
                </span>
                <span className="mt-0.5 block text-xs font-light text-zinc-400">
                  站点已内置一份干净的 Flash 独立播放器，开箱即用。
                </span>
              </span>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 transition-colors has-[:checked]:border-rose-300 has-[:checked]:bg-rose-50/50 dark:border-white/10 dark:bg-white/[0.02] dark:has-[:checked]:border-rose-400/40 dark:has-[:checked]:bg-rose-500/5">
              <input
                type="radio"
                name="projector"
                checked={useCustomProjector}
                onChange={() => {
                  setUseCustomProjector(true)
                  resetResult()
                }}
                className="mt-0.5 h-4 w-4 accent-rose-400"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  使用自定义播放器
                </span>
                <span className="mt-0.5 block text-xs font-light text-zinc-400">
                  自备一份 Flash Player 独立播放器（projector）.exe。
                </span>
                {useCustomProjector && (
                  <div className="mt-3">
                    <input
                      ref={projectorInputRef}
                      type="file"
                      accept=".exe,application/x-msdownload"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0]
                        if (f) {
                          setProjectorFile(f)
                          resetResult()
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        projectorInputRef.current?.click()
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition-colors hover:border-rose-300 hover:text-rose-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300"
                    >
                      选择 .exe 播放器
                    </button>
                    {projectorFile && (
                      <span className="ml-2 text-xs font-light text-zinc-500">
                        {projectorFile.name} · {formatBytes(projectorFile.size)}
                      </span>
                    )}
                  </div>
                )}
              </span>
            </label>
          </div>

          {/* 生成按钮 */}
          <button
            type="button"
            onClick={handleConvert}
            disabled={!swfFile || status === 'converting'}
            className={clsxm(
              'mt-8 flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-sm font-semibold transition-all duration-300',
              !swfFile || status === 'converting'
                ? 'cursor-not-allowed bg-zinc-100 text-zinc-400 dark:bg-white/5'
                : 'bg-gradient-to-r from-rose-400 to-orange-400 text-white shadow-lg shadow-rose-400/25 hover:from-rose-500 hover:to-orange-500 hover:shadow-rose-400/40'
            )}
          >
            {status === 'converting' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                打包中…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
                生成 EXE
              </>
            )}
          </button>

          {/* 状态提示 */}
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
              成果
            </h2>
          </div>
          <div className="px-6 py-8">
            {result && status === 'done' ? (
              <div className="flex flex-col items-center text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-500 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                </span>
                <p className="mt-4 text-sm font-medium text-zinc-700 dark:text-zinc-200">
                  {result.name}
                </p>
                <p className="text-xs font-light text-zinc-400">
                  {formatBytes(result.size)}
                </p>
                <button
                  type="button"
                  onClick={triggerDownload}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-400/25 transition-all hover:from-emerald-500 hover:to-teal-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  下载 EXE
                </button>
                <p className="mt-3 text-[11px] font-light leading-relaxed text-zinc-400">
                  若浏览器拦截了下载，请在提示中选择「保留」。
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-300 dark:bg-white/5 dark:text-zinc-600">
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                  </svg>
                </span>
                <p className="mt-4 text-sm font-light text-zinc-400">
                  生成的 EXE 会出现在这里
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 说明卡片 */}
        <div className="rounded-3xl border border-black/[0.06] bg-gradient-to-b from-sky-50/60 to-white p-6 dark:border-white/[0.06] dark:from-sky-500/[0.04] dark:to-transparent">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-sky-400" />
            使用须知
          </h3>
          <ul className="mt-4 space-y-3 text-xs font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
            <li className="flex gap-2">
              <span className="text-sky-400">·</span>
              生成的程序是 <b className="font-medium text-zinc-600 dark:text-zinc-300">Windows 可执行文件</b>，仅能在 Windows 上运行。
            </li>
            <li className="flex gap-2">
              <span className="text-sky-400">·</span>
              全程在浏览器本地完成，<b className="font-medium text-zinc-600 dark:text-zinc-300">文件不会上传服务器</b>，请放心。
            </li>
            <li className="flex gap-2">
              <span className="text-sky-400">·</span>
              成品已内嵌 Flash 播放器，双击即可运行，<b className="font-medium text-zinc-600 dark:text-zinc-300">无需安装 Flash</b>。
            </li>
            <li className="flex gap-2">
              <span className="text-sky-400">·</span>
              首次运行若被杀毒软件 / SmartScreen 拦截，选择「仍要运行」即可（这是自解压程序的常见误报）。
            </li>
          </ul>
        </div>

        {/* 原理卡片 */}
        <div className="rounded-3xl border border-black/[0.06] bg-white/60 p-6 dark:border-white/[0.06] dark:bg-white/[0.02]">
          <h3 className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" />
            原理
          </h3>
          <p className="mt-4 text-xs font-light leading-relaxed text-zinc-500 dark:text-zinc-400">
            Flash 独立播放器（projector）会在自身文件末尾寻找一段特殊页脚。工具把你的 SWF 追加到播放器之后，并写入{' '}
            <code className="rounded bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
              0xFA123456
            </code>{' '}
            魔数与文件长度。播放器启动时读到这段页脚，就会加载并播放内嵌的 SWF。
          </p>
        </div>
      </div>
    </div>
  )
}
