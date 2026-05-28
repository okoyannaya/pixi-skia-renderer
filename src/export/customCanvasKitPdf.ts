import type { Canvas, CanvasKit } from 'canvaskit-wasm'

export interface CustomPdfDocument {
  beginPage(width: number, height: number): Canvas
  endPage(): void
  close(): Uint8Array
  delete?(): void
}

export interface CustomCanvasKitPdfConstructor {
  new (): CustomPdfDocument
}

export type CanvasKitWithPdf = CanvasKit & {
  PdfDocument?: CustomCanvasKitPdfConstructor
}

export function hasCustomPdfBackend(canvasKit: CanvasKit): canvasKit is CanvasKitWithPdf {
  const candidate = canvasKit as CanvasKitWithPdf

  return typeof candidate.PdfDocument === 'function'
}

export function createPdfDocument(canvasKit: CanvasKit): CustomPdfDocument {
  const candidate = canvasKit as CanvasKitWithPdf

  if (!hasCustomPdfBackend(candidate) || !candidate.PdfDocument) {
    throw new Error(
      'CanvasKit PDF backend is not available. Build and load custom CanvasKit with PdfDocument binding.',
    )
  }

  return new candidate.PdfDocument()
}
