import * as PIXI from 'pixi.js-legacy'

import { renderGraphics } from './GraphicsRenderer'
import { renderSprite } from './SpriteRenderer'
import { concatPixiMatrix } from './transform'
import type { SkiaRendererContext, SkiaRenderTarget } from './types'
import type { AssetRegistry } from '../scene/AssetRegistry'

export class PixiToSkiaRenderer {
  private readonly context: Omit<SkiaRendererContext, 'canvas'>

  constructor(context: Omit<SkiaRendererContext, 'canvas'>) {
    this.context = context
  }

  render(container: PIXI.Container, target: SkiaRenderTarget): void {
    const context: SkiaRendererContext = {
      ...this.context,
      canvas: target.canvas,
    }

    target.canvas.clear(this.context.canvasKit.Color(241, 241, 241, 1))
    this.renderDisplayObject(container, context)
  }

  private renderDisplayObject(
    displayObject: PIXI.DisplayObject,
    context: SkiaRendererContext,
  ): void {
    if (!displayObject.visible || !displayObject.renderable) {
      return
    }

    if (displayObject instanceof PIXI.Graphics) {
      context.canvas.save()
      concatPixiMatrix(context.canvas, displayObject.worldTransform)
      renderGraphics(displayObject, context, displayObject.worldAlpha)
      context.canvas.restore()
      return
    }

    if (displayObject instanceof PIXI.Sprite) {
      context.canvas.save()
      concatPixiMatrix(context.canvas, displayObject.worldTransform)
      renderSprite(displayObject, context)
      context.canvas.restore()
      return
    }

    if (displayObject instanceof PIXI.Container) {
      for (const child of displayObject.children) {
        this.renderDisplayObject(child, context)
      }
    }
  }
}

export function createPixiToSkiaRenderer(
  canvasKit: SkiaRendererContext['canvasKit'],
  assets: AssetRegistry,
): PixiToSkiaRenderer {
  return new PixiToSkiaRenderer({
    canvasKit,
    assets,
  })
}
