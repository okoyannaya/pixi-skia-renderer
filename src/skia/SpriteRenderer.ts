import * as PIXI from 'pixi.js-legacy'

import type { SkiaRendererContext } from './types'

export function renderSprite(sprite: PIXI.Sprite, context: SkiaRendererContext): void {
  const image = context.assets.getSkImage(context.canvasKit, sprite.texture)

  if (!image) {
    return
  }

  const textureWidth = sprite.texture.width || image.getImageInfo().width || 1
  const textureHeight = sprite.texture.height || image.getImageInfo().height || 1
  const left = -sprite.anchor.x * textureWidth
  const top = -sprite.anchor.y * textureHeight

  context.canvas.drawImage(image, left, top, null)
}
