import CanvasKitInit, { type CanvasKit } from 'canvaskit-wasm'
import canvasKitWasmUrl from 'canvaskit-wasm/bin/canvaskit.wasm?url'

let canvasKitPromise: Promise<CanvasKit> | null = null

export function loadCanvasKit(): Promise<CanvasKit> {
  canvasKitPromise ??= CanvasKitInit({
    locateFile: () => canvasKitWasmUrl,
  })

  return canvasKitPromise
}
