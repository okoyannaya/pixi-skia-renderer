import { beforeEach, describe, expect, it, vi } from 'vitest'

import { exportPixiContainerToPdf } from './PdfExporter'

const pdfCanvas = { id: 'pdf-canvas' }
const pdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46])
const pdfDocument = {
  beginPage: vi.fn(() => pdfCanvas),
  close: vi.fn(() => pdfBytes),
  delete: vi.fn(),
  endPage: vi.fn(),
}

vi.mock('./customCanvasKitPdf', () => ({
  createPdfDocument: vi.fn(() => pdfDocument),
}))

vi.mock('./download', () => ({
  downloadBytes: vi.fn(),
}))

describe('exportPixiContainerToPdf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the Pixi container into a Skia PDF page and downloads the bytes', async () => {
    const { createPdfDocument } = await import('./customCanvasKitPdf')
    const { downloadBytes } = await import('./download')
    const canvasKit = { PdfDocument: vi.fn() }
    const renderer = {
      render: vi.fn(),
    }
    const container = { id: 'pixi-container' }

    exportPixiContainerToPdf(canvasKit as never, renderer as never, container as never, {
      filename: 'scene.pdf',
      width: 640,
      height: 420,
    })

    expect(createPdfDocument).toHaveBeenCalledWith(canvasKit)
    expect(pdfDocument.beginPage).toHaveBeenCalledWith(640, 420)
    expect(renderer.render).toHaveBeenCalledWith(container, {
      canvas: pdfCanvas,
      width: 640,
      height: 420,
    })
    expect(pdfDocument.endPage).toHaveBeenCalled()
    expect(pdfDocument.close).toHaveBeenCalled()
    expect(downloadBytes).toHaveBeenCalledWith(pdfBytes, 'scene.pdf', 'application/pdf')
    expect(pdfDocument.delete).toHaveBeenCalled()
  })
})

