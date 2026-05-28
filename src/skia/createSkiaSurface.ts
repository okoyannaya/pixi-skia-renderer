import type { Surface } from 'canvaskit-wasm'

import { loadCanvasKit } from './loadCanvasKit'

export async function createSkiaSurface(canvas: HTMLCanvasElement): Promise<Surface> {
  const canvasKit = await loadCanvasKit()
  const surface = canvasKit.MakeSWCanvasSurface(canvas)

  if (!surface) {
    throw new Error('CanvasKit failed to create a software canvas surface.')
  }

  return surface
}
