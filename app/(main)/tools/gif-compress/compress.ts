/**
 * GIF 压缩核心逻辑（纯浏览器本地执行）
 *
 * 思路与 Python + Pillow 的做法一致：
 *   1. gifuct-js 解码 GIF，得到每一帧的补丁、延时与处置方式；
 *   2. 逐级尝试「缩放 + 抽帧 + 调色板量化（可带 Floyd–Steinberg 抖动）」组合；
 *   3. 取第一个满足目标体积且质量最高的方案。
 *
 * 抽帧时把被丢弃帧的延时累加到保留帧上，播放总时长与节奏保持不变。
 */
import { applyPalette, GIFEncoder, type Palette, quantize } from 'gifenc'
import { decompressFrames, type ParsedFrame, parseGIF } from 'gifuct-js'

/** 一档压缩参数：缩放比例 × 抽帧步长 × 调色板颜色数 */
export type CompressAttempt = {
  scale: number
  frameStep: number
  colors: number
}

/** 质量从高到低的尝试阶梯，取第一个满足目标体积的方案 */
const ATTEMPT_LADDER: CompressAttempt[] = [
  { scale: 1, frameStep: 1, colors: 256 },
  { scale: 1, frameStep: 1, colors: 128 },
  { scale: 1, frameStep: 2, colors: 128 },
  { scale: 1, frameStep: 2, colors: 64 },
  { scale: 0.9, frameStep: 3, colors: 64 },
  { scale: 0.8, frameStep: 3, colors: 64 },
  { scale: 0.8, frameStep: 4, colors: 64 },
  { scale: 0.7, frameStep: 4, colors: 64 },
  { scale: 0.6, frameStep: 4, colors: 64 },
  { scale: 0.5, frameStep: 4, colors: 64 },
  { scale: 0.5, frameStep: 5, colors: 32 },
  { scale: 0.4, frameStep: 6, colors: 32 },
]

export type CompressProgress = {
  /** 当前第几档尝试（1 起） */
  attempt: number
  totalAttempts: number
  /** 当前档内已处理的源帧数 */
  frame: number
  totalFrames: number
  /** 当前档参数 */
  params: CompressAttempt
}

export type CompressResult = {
  blob: Blob
  /** 输出尺寸 */
  width: number
  height: number
  /** 输出帧数 / 原始帧数 */
  frameCount: number
  originalFrameCount: number
  /** 原始尺寸 */
  originalWidth: number
  originalHeight: number
  colors: number
  scale: number
  frameStep: number
  /** 是否达成目标体积 */
  metTarget: boolean
  /** 播放总时长（ms，输出与原始一致） */
  totalDuration: number
}

export type CancelToken = { cancelled: boolean }

type Decoded = {
  width: number
  height: number
  frames: ParsedFrame[]
  totalDuration: number
}

/** GIF 规范中 delay=0 的帧，浏览器普遍按 100ms 播放，这里做同样的归一化 */
function normalizeDelay(delay: number): number {
  return delay > 10 ? delay : 100
}

function decodeGif(buffer: ArrayBuffer): Decoded {
  const parsed = parseGIF(buffer)
  const frames = decompressFrames(parsed, true)
  if (!frames.length) throw new Error('这个 GIF 里没有解出任何帧。')
  const totalDuration = frames.reduce(
    (sum, f) => sum + normalizeDelay(f.delay),
    0
  )
  return {
    width: parsed.lsd.width,
    height: parsed.lsd.height,
    frames,
    totalDuration,
  }
}

/**
 * 创建帧合成器：按 GIF 处置方式（disposal）把补丁帧逐帧叠加成完整画面。
 * 返回的函数必须按 0..n-1 顺序调用。
 */
function makeCompositor(decoded: Decoded) {
  const { width, height, frames } = decoded
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('无法创建 Canvas 2D 上下文。')

  const patchCanvas = document.createElement('canvas')
  patchCanvas.width = width
  patchCanvas.height = height
  const patchCtx = patchCanvas.getContext('2d', { willReadFrequently: true })
  if (!patchCtx) throw new Error('无法创建 Canvas 2D 上下文。')

  let prevDims: ParsedFrame['dims'] | null = null
  let prevDisposal = 0
  let savedState: ImageData | null = null

  return function renderFrame(i: number): HTMLCanvasElement {
    const frame = frames[i]
    // 处理上一帧的 disposal
    if (prevDisposal === 2 && prevDims) {
      ctx.clearRect(prevDims.left, prevDims.top, prevDims.width, prevDims.height)
    } else if (prevDisposal === 3 && savedState) {
      ctx.putImageData(savedState, 0, 0)
    }
    if (frame.disposalType === 3) {
      savedState = ctx.getImageData(0, 0, width, height)
    }

    const { dims, patch } = frame
    const imageData = new ImageData(
      new Uint8ClampedArray(patch),
      dims.width,
      dims.height
    )
    patchCtx.clearRect(0, 0, width, height)
    patchCtx.putImageData(imageData, 0, 0)
    // drawImage 会尊重补丁里的透明像素（putImageData 不会）
    ctx.drawImage(
      patchCanvas,
      0,
      0,
      dims.width,
      dims.height,
      dims.left,
      dims.top,
      dims.width,
      dims.height
    )

    prevDims = dims
    prevDisposal = frame.disposalType ?? 0
    return canvas
  }
}

/**
 * Floyd–Steinberg 误差扩散抖动 + 最近调色板色映射。
 * 用 15-bit 颜色键缓存最近色查询，避免逐像素全表扫描。
 */
function ditherApplyPalette(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  palette: Palette,
  transparentIndex: number
): Uint8Array {
  const n = width * height
  const index = new Uint8Array(n)
  // RGB 浮点工作区，用于承接扩散误差
  const buf = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    buf[i * 3] = data[i * 4]
    buf[i * 3 + 1] = data[i * 4 + 1]
    buf[i * 3 + 2] = data[i * 4 + 2]
  }

  const cache = new Map<number, number>()
  const findNearest = (r: number, g: number, b: number): number => {
    const key = ((r >> 3) << 10) | ((g >> 3) << 5) | (b >> 3)
    const hit = cache.get(key)
    if (hit !== undefined) return hit
    let best = 0
    let bestDist = Infinity
    for (let p = 0; p < palette.length; p++) {
      if (p === transparentIndex) continue
      const c = palette[p]
      const dr = r - c[0]
      const dg = g - c[1]
      const db = b - c[2]
      const dist = dr * dr + dg * dg + db * db
      if (dist < bestDist) {
        bestDist = dist
        best = p
      }
    }
    cache.set(key, best)
    return best
  }

  const clamp255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x
      if (transparentIndex >= 0 && data[i * 4 + 3] < 128) {
        index[i] = transparentIndex
        continue
      }
      const r = clamp255(Math.round(buf[i * 3]))
      const g = clamp255(Math.round(buf[i * 3 + 1]))
      const b = clamp255(Math.round(buf[i * 3 + 2]))
      const pi = findNearest(r, g, b)
      index[i] = pi
      const c = palette[pi]
      const er = r - c[0]
      const eg = g - c[1]
      const eb = b - c[2]
      // 向右 7/16、左下 3/16、正下 5/16、右下 1/16
      if (x + 1 < width) {
        const j = (i + 1) * 3
        buf[j] += (er * 7) / 16
        buf[j + 1] += (eg * 7) / 16
        buf[j + 2] += (eb * 7) / 16
      }
      if (y + 1 < height) {
        if (x > 0) {
          const j = (i + width - 1) * 3
          buf[j] += (er * 3) / 16
          buf[j + 1] += (eg * 3) / 16
          buf[j + 2] += (eb * 3) / 16
        }
        {
          const j = (i + width) * 3
          buf[j] += (er * 5) / 16
          buf[j + 1] += (eg * 5) / 16
          buf[j + 2] += (eb * 5) / 16
        }
        if (x + 1 < width) {
          const j = (i + width + 1) * 3
          buf[j] += (er * 1) / 16
          buf[j + 1] += (eg * 1) / 16
          buf[j + 2] += (eb * 1) / 16
        }
      }
    }
  }
  return index
}

/** 让出主线程，保持页面可响应 */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

/**
 * 按阶梯逐级尝试压缩，返回第一个满足目标体积的方案；
 * 如果全部超标，返回最后（最激进）一档的结果，metTarget = false。
 */
export async function compressGif(
  buffer: ArrayBuffer,
  options: {
    targetBytes: number
    dither: boolean
    onProgress?: (p: CompressProgress) => void
    cancelToken?: CancelToken
  }
): Promise<CompressResult> {
  const { targetBytes, dither, onProgress, cancelToken } = options
  const decoded = decodeGif(buffer)
  const { frames, width, height, totalDuration } = decoded

  // 单帧 GIF 抽帧无意义，去掉阶梯中的重复档位
  const ladder = ATTEMPT_LADDER.map((a) =>
    frames.length === 1 ? { ...a, frameStep: 1 } : a
  ).filter(
    (a, i, arr) =>
      arr.findIndex(
        (b) =>
          b.scale === a.scale &&
          b.frameStep === a.frameStep &&
          b.colors === a.colors
      ) === i
  )

  const workCanvas = document.createElement('canvas')
  const workCtx = workCanvas.getContext('2d', { willReadFrequently: true })
  if (!workCtx) throw new Error('无法创建 Canvas 2D 上下文。')

  for (let attemptIdx = 0; attemptIdx < ladder.length; attemptIdx++) {
    const attempt = ladder[attemptIdx]
    const isLast = attemptIdx === ladder.length - 1
    const outW = Math.max(1, Math.round(width * attempt.scale))
    const outH = Math.max(1, Math.round(height * attempt.scale))
    workCanvas.width = outW
    workCanvas.height = outH
    workCtx.imageSmoothingEnabled = true
    workCtx.imageSmoothingQuality = 'high'

    // 抽帧：每 frameStep 帧取 1 帧，丢弃帧的延时累加到保留帧上
    const keptDelays: number[] = []
    const keptSet = new Set<number>()
    for (let i = 0; i < frames.length; i += attempt.frameStep) {
      keptSet.add(i)
      let delay = 0
      for (let j = i; j < Math.min(i + attempt.frameStep, frames.length); j++) {
        delay += normalizeDelay(frames[j].delay)
      }
      keptDelays.push(delay)
    }

    const renderFrame = makeCompositor(decoded)
    const gif = GIFEncoder()
    let keptIdx = 0
    let aborted = false

    for (let i = 0; i < frames.length; i++) {
      if (cancelToken?.cancelled) throw new Error('已取消。')
      // 即使是被丢弃的帧也要合成，否则后续帧的画面会缺补丁
      const composited = renderFrame(i)
      if (keptSet.has(i)) {
        workCtx.clearRect(0, 0, outW, outH)
        workCtx.drawImage(composited, 0, 0, outW, outH)
        const imageData = workCtx.getImageData(0, 0, outW, outH)
        const rgba = imageData.data

        // 是否存在透明像素决定量化格式
        let hasAlpha = false
        for (let p = 3; p < rgba.length; p += 4) {
          if (rgba[p] < 128) {
            hasAlpha = true
            break
          }
        }

        const palette = hasAlpha
          ? quantize(rgba, attempt.colors, {
              format: 'rgba4444',
              oneBitAlpha: true,
            })
          : quantize(rgba, attempt.colors)
        const transparentIndex = hasAlpha
          ? palette.findIndex((c) => c.length === 4 && c[3] === 0)
          : -1

        const index = dither
          ? ditherApplyPalette(rgba, outW, outH, palette, transparentIndex)
          : applyPalette(rgba, palette, hasAlpha ? 'rgba4444' : 'rgb565')

        gif.writeFrame(index, outW, outH, {
          palette,
          delay: keptDelays[keptIdx],
          transparent: transparentIndex >= 0,
          transparentIndex: transparentIndex >= 0 ? transparentIndex : 0,
          // 有透明像素时每帧先清空画布，避免上一帧透出
          dispose: transparentIndex >= 0 ? 2 : -1,
        })
        keptIdx++

        // 中途已超标就放弃这一档（最后一档除外，留作兜底）
        if (!isLast && gif.bytesView().length > targetBytes) {
          aborted = true
          break
        }
      }

      if (i % 8 === 0) {
        onProgress?.({
          attempt: attemptIdx + 1,
          totalAttempts: ladder.length,
          frame: i + 1,
          totalFrames: frames.length,
          params: attempt,
        })
        await tick()
      }
    }

    if (aborted) continue

    gif.finish()
    const bytes = gif.bytes()
    if (bytes.length <= targetBytes || isLast) {
      return {
        blob: new Blob([bytes], { type: 'image/gif' }),
        width: outW,
        height: outH,
        frameCount: keptDelays.length,
        originalFrameCount: frames.length,
        originalWidth: width,
        originalHeight: height,
        colors: attempt.colors,
        scale: attempt.scale,
        frameStep: attempt.frameStep,
        metTarget: bytes.length <= targetBytes,
        totalDuration,
      }
    }
  }

  // 理论上到不了这里（最后一档必然返回）
  throw new Error('压缩失败：没有产出任何结果。')
}

/** 快速读取 GIF 基本信息（用于上传后展示） */
export function inspectGif(buffer: ArrayBuffer): {
  width: number
  height: number
  frameCount: number
  totalDuration: number
} {
  const decoded = decodeGif(buffer)
  return {
    width: decoded.width,
    height: decoded.height,
    frameCount: decoded.frames.length,
    totalDuration: decoded.totalDuration,
  }
}

/** 校验 GIF 文件头（GIF87a / GIF89a） */
export function isLikelyGif(bytes: Uint8Array): boolean {
  if (bytes.length < 6) return false
  const sig = String.fromCharCode(...bytes.slice(0, 6))
  return sig === 'GIF87a' || sig === 'GIF89a'
}
