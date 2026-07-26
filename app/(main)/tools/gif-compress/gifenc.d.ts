/**
 * gifenc 官方包未附带 TypeScript 类型，这里按其 README / 源码补充最小声明。
 * https://github.com/mattdesl/gifenc
 */
declare module 'gifenc' {
  /** 调色板：[r, g, b] 或 [r, g, b, a] 数组 */
  export type Palette = number[][]

  export type QuantizeFormat = 'rgb565' | 'rgb444' | 'rgba4444'

  export function quantize(
    rgba: Uint8Array | Uint8ClampedArray,
    maxColors: number,
    options?: {
      format?: QuantizeFormat
      oneBitAlpha?: boolean | number
      clearAlpha?: boolean
      clearAlphaThreshold?: number
      clearAlphaColor?: number
    }
  ): Palette

  export function applyPalette(
    rgba: Uint8Array | Uint8ClampedArray,
    palette: Palette,
    format?: QuantizeFormat
  ): Uint8Array

  export function nearestColorIndex(
    colors: Palette,
    pixel: ArrayLike<number>
  ): number

  export function GIFEncoder(options?: {
    auto?: boolean
    initialCapacity?: number
  }): {
    writeFrame(
      index: Uint8Array,
      width: number,
      height: number,
      options?: {
        palette?: Palette
        first?: boolean
        transparent?: boolean
        transparentIndex?: number
        /** 帧延时，毫秒 */
        delay?: number
        repeat?: number
        dispose?: number
      }
    ): void
    finish(): void
    bytes(): Uint8Array
    bytesView(): Uint8Array
    reset(): void
  }
}
