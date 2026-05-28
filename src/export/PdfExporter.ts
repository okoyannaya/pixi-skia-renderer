import type { CanvasKit } from 'canvaskit-wasm'
import type * as PIXI from 'pixi.js-legacy'

import { createPdfDocument } from './customCanvasKitPdf'
import { downloadBytes } from './download'
import type { PixiToSkiaRenderer } from '../skia/PixiToSkiaRenderer'

export interface PdfExportOptions {
  filename: string
  width: number
  height: number
}

export function exportPixiContainerToPdf(
  canvasKit: CanvasKit,
  renderer: PixiToSkiaRenderer,
  container: PIXI.Container,
  options: PdfExportOptions,
): void {
  const pdf = createPdfDocument(canvasKit)

  try {
    const pageCanvas = pdf.beginPage(options.width, options.height)

    renderer.render(container, {
      canvas: pageCanvas,
      width: options.width,
      height: options.height,
    })

    pdf.endPage()
    const bytes = pdf.close()
    downloadBytes(bytes, options.filename, 'application/pdf')
  } finally {
    pdf.delete?.()
  }
}
