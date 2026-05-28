import type { CanvasKit, Paint } from 'canvaskit-wasm'

export function createFillPaint(
  canvasKit: CanvasKit,
  color: number,
  alpha: number,
): Paint {
  const paint = new canvasKit.Paint()
  paint.setAntiAlias(true)
  paint.setStyle(canvasKit.PaintStyle.Fill)
  paint.setColor(toSkiaColor(canvasKit, color, alpha))

  return paint
}

export function createStrokePaint(
  canvasKit: CanvasKit,
  color: number,
  alpha: number,
  width: number,
): Paint {
  const paint = new canvasKit.Paint()
  paint.setAntiAlias(true)
  paint.setStyle(canvasKit.PaintStyle.Stroke)
  paint.setStrokeWidth(width)
  paint.setColor(toSkiaColor(canvasKit, color, alpha))

  return paint
}

function toSkiaColor(canvasKit: CanvasKit, color: number, alpha: number): Float32Array {
  const red = (color >> 16) & 0xff
  const green = (color >> 8) & 0xff
  const blue = color & 0xff

  return canvasKit.Color(red, green, blue, alpha)
}
