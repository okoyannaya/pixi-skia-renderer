import type { CanvasKit } from 'canvaskit-wasm'

const CUSTOM_CANVASKIT_SCRIPT_URL = '/wasm/custom-canvaskit.js'
const CUSTOM_CANVASKIT_WASM_URL = '/wasm/custom-canvaskit.wasm'

declare global {
  interface Window {
    CanvasKitInit?: (options: { locateFile: (file: string) => string }) => Promise<CanvasKit>
  }
}

let canvasKitPromise: Promise<CanvasKit> | null = null

export function loadCanvasKit(): Promise<CanvasKit> {
  canvasKitPromise ??= loadCustomCanvasKit()

  return canvasKitPromise
}

async function loadCustomCanvasKit(): Promise<CanvasKit> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    throw new Error('Custom CanvasKit can only be loaded in a browser.')
  }

  await injectCustomCanvasKitScript()

  if (typeof window.CanvasKitInit !== 'function') {
    throw new Error('Custom CanvasKit script did not expose CanvasKitInit.')
  }

  return window.CanvasKitInit({
    locateFile: (file) => (file.endsWith('.wasm') ? CUSTOM_CANVASKIT_WASM_URL : file),
  })
}

function injectCustomCanvasKitScript(): Promise<void> {
  const existingScript = document.querySelector<HTMLScriptElement>(
    `script[src="${CUSTOM_CANVASKIT_SCRIPT_URL}"]`,
  )

  if (existingScript) {
    return Promise.resolve()
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = CUSTOM_CANVASKIT_SCRIPT_URL
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Custom CanvasKit script was not found.'))
    document.head.appendChild(script)
  })
}
