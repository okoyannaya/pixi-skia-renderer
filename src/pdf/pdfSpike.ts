import type { CanvasKit } from 'canvaskit-wasm'

import { hasCustomPdfBackend } from '../export/customCanvasKitPdf'
import { loadCanvasKit } from '../skia/loadCanvasKit'

const PDF_API_PATTERN = /pdf|document|page|skpdf|stream/i

export interface PdfSpikeReport {
  canvasKitLoaded: boolean
  pdfBackendAvailable: boolean
  matchingApiKeys: string[]
  checkedAt: string
}

export async function inspectCanvasKitPdfSupport(): Promise<PdfSpikeReport> {
  const canvasKit = await loadCanvasKit()
  const matchingApiKeys = Object.keys(canvasKit).filter((key) => PDF_API_PATTERN.test(key)).sort()

  return {
    canvasKitLoaded: true,
    pdfBackendAvailable: hasCustomPdfBackend(canvasKit) || hasPdfDocumentApi(matchingApiKeys),
    matchingApiKeys,
    checkedAt: new Date().toISOString(),
  }
}

export async function drawCanvasKitSmokeRect(canvas: HTMLCanvasElement): Promise<void> {
  const canvasKit = await loadCanvasKit()
  const surface = canvasKit.MakeSWCanvasSurface(canvas)

  if (!surface) {
    throw new Error('CanvasKit failed to create a software canvas surface.')
  }

  const paint = new canvasKit.Paint()
  paint.setColor(canvasKit.Color(40, 117, 240, 1))
  paint.setStyle(canvasKit.PaintStyle.Fill)
  paint.setAntiAlias(true)

  const stroke = new canvasKit.Paint()
  stroke.setColor(canvasKit.Color(18, 18, 18, 1))
  stroke.setStyle(canvasKit.PaintStyle.Stroke)
  stroke.setStrokeWidth(4)
  stroke.setAntiAlias(true)

  const skCanvas = surface.getCanvas()
  skCanvas.clear(canvasKit.WHITE)
  skCanvas.drawRect(canvasKit.XYWHRect(48, 48, 220, 120), paint)
  skCanvas.drawRect(canvasKit.XYWHRect(48, 48, 220, 120), stroke)
  surface.flush()

  paint.delete()
  stroke.delete()
  surface.delete()
}

function hasPdfDocumentApi(keys: string[]): boolean {
  return keys.some((key) => /pdf/i.test(key) && /document|make|create/i.test(key))
}

export function formatPdfSpikeReport(report: PdfSpikeReport): string {
  const apiList = report.matchingApiKeys.length > 0 ? report.matchingApiKeys.join(', ') : 'не найдено'

  return [
    `CanvasKit loaded: ${report.canvasKitLoaded ? 'yes' : 'no'}`,
    `PDF backend available: ${report.pdfBackendAvailable ? 'yes' : 'no'}`,
    `Matching API keys: ${apiList}`,
    `Checked at: ${report.checkedAt}`,
  ].join('\n')
}

export function getPdfSpikeConclusion(report: PdfSpikeReport): string {
  if (report.pdfBackendAvailable) {
    return 'PDF API найден. Следующий шаг: нарисовать SkRect в PDF document и скачать файл.'
  }

  return 'В стандартном canvaskit-wasm PDF API не найден. Для векторного PDF нужен custom CanvasKit/Skia wasm с binding к SkPDF/SkDocument.'
}

export function assertPdfBackendAvailable(report: PdfSpikeReport): asserts report is PdfSpikeReport {
  if (!report.pdfBackendAvailable) {
    throw new Error(getPdfSpikeConclusion(report))
  }
}

export type CanvasKitWithPossiblePdfApi = CanvasKit & Record<string, unknown>
