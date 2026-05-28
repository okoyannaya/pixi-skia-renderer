import type { Canvas, CanvasKit } from 'canvaskit-wasm'

import type { AssetRegistry } from '../scene/AssetRegistry'

export interface SkiaRenderTarget {
  canvas: Canvas
  width: number
  height: number
}

export interface SkiaRendererContext {
  canvasKit: CanvasKit
  canvas: Canvas
  assets: AssetRegistry
}
