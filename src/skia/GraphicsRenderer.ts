import * as PIXI from 'pixi.js-legacy'

import { createFillPaint, createStrokePaint } from './paint'
import { concatPixiMatrix } from './transform'
import type { SkiaRendererContext } from './types'

export function renderGraphics(
  graphics: PIXI.Graphics,
  context: SkiaRendererContext,
  worldAlpha: number,
): void {
  for (const graphicsData of graphics.geometry.graphicsData) {
    const shape = graphicsData.shape
    const fillStyle = graphicsData.fillStyle
    const lineStyle = graphicsData.lineStyle

    context.canvas.save()
    concatPixiMatrix(context.canvas, graphicsData.matrix)

    if (fillStyle.visible) {
      const fillPaint = createFillPaint(
        context.canvasKit,
        fillStyle.color,
        fillStyle.alpha * worldAlpha,
      )
      drawShape(shape, fillPaint, context)
      fillPaint.delete()
    }

    if (lineStyle.visible && lineStyle.width > 0) {
      const strokePaint = createStrokePaint(
        context.canvasKit,
        lineStyle.color,
        lineStyle.alpha * worldAlpha,
        lineStyle.width,
      )
      drawShape(shape, strokePaint, context)
      strokePaint.delete()
    }

    context.canvas.restore()
  }
}

function drawShape(
  shape: PIXI.IShape,
  paint: import('canvaskit-wasm').Paint,
  context: SkiaRendererContext,
): void {
  switch (shape.type) {
    case PIXI.SHAPES.RECT:
      drawRectangle(shape as PIXI.Rectangle, paint, context)
      break
    case PIXI.SHAPES.ELIP:
      drawEllipse(shape as PIXI.Ellipse, paint, context)
      break
    case PIXI.SHAPES.CIRC:
      drawCircle(shape as PIXI.Circle, paint, context)
      break
    case PIXI.SHAPES.POLY:
      drawPolygon(shape as PIXI.Polygon, paint, context)
      break
    default:
      break
  }
}

function drawRectangle(
  shape: PIXI.Rectangle,
  paint: import('canvaskit-wasm').Paint,
  context: SkiaRendererContext,
): void {
  context.canvas.drawRect(
    context.canvasKit.XYWHRect(shape.x, shape.y, shape.width, shape.height),
    paint,
  )
}

function drawEllipse(
  shape: PIXI.Ellipse,
  paint: import('canvaskit-wasm').Paint,
  context: SkiaRendererContext,
): void {
  context.canvas.drawOval(
    context.canvasKit.XYWHRect(
      shape.x - shape.width,
      shape.y - shape.height,
      shape.width * 2,
      shape.height * 2,
    ),
    paint,
  )
}

function drawCircle(
  shape: PIXI.Circle,
  paint: import('canvaskit-wasm').Paint,
  context: SkiaRendererContext,
): void {
  context.canvas.drawCircle(shape.x, shape.y, shape.radius, paint)
}

function drawPolygon(
  shape: PIXI.Polygon,
  paint: import('canvaskit-wasm').Paint,
  context: SkiaRendererContext,
): void {
  const [firstX, firstY] = shape.points

  if (firstX === undefined || firstY === undefined) {
    return
  }

  const path = createPathFromPolygon(shape, context.canvasKit)
  context.canvas.drawPath(path, paint)
  path.delete()
}

function createPathFromPolygon(
  shape: PIXI.Polygon,
  canvasKit: SkiaRendererContext['canvasKit'],
): import('canvaskit-wasm').Path {
  const canvasKitWithPathBuilder = canvasKit as SkiaRendererContext['canvasKit'] & {
    PathBuilder?: new () => PathBuilderLike
  }

  if (canvasKitWithPathBuilder.PathBuilder) {
    const builder = new canvasKitWithPathBuilder.PathBuilder()

    appendPolygonToPath(builder, shape)

    return builder.detachAndDelete()
  }

  const path = new canvasKit.Path()
  appendPolygonToPath(path, shape)

  return path
}

function appendPolygonToPath(path: MutablePathLike, shape: PIXI.Polygon): void {
  const [firstX, firstY] = shape.points

  if (firstX === undefined || firstY === undefined) {
    return
  }

  path.moveTo(firstX, firstY)

  for (let index = 2; index < shape.points.length; index += 2) {
    const x = shape.points[index]
    const y = shape.points[index + 1]

    if (x !== undefined && y !== undefined) {
      path.lineTo(x, y)
    }
  }

  if (shape.closeStroke) {
    path.close()
  }
}

interface MutablePathLike {
  moveTo(x: number, y: number): unknown
  lineTo(x: number, y: number): unknown
  close(): unknown
}

interface PathBuilderLike extends MutablePathLike {
  detachAndDelete(): import('canvaskit-wasm').Path
}
