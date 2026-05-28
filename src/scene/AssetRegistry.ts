import type { CanvasKit, Image } from 'canvaskit-wasm'
import type * as PIXI from 'pixi.js-legacy'

export class AssetRegistry {
  private readonly encodedPngByTexture = new WeakMap<PIXI.Texture, Uint8Array>()
  private readonly skImageByTexture = new WeakMap<PIXI.Texture, Image>()

  registerPngTexture(texture: PIXI.Texture, bytes: Uint8Array): void {
    this.encodedPngByTexture.set(texture, bytes)
  }

  getSkImage(canvasKit: CanvasKit, texture: PIXI.Texture): Image | null {
    const cached = this.skImageByTexture.get(texture)

    if (cached) {
      return cached
    }

    const encoded = this.encodedPngByTexture.get(texture)

    if (!encoded) {
      return null
    }

    const image = canvasKit.MakeImageFromEncoded(encoded)

    if (!image) {
      return null
    }

    this.skImageByTexture.set(texture, image)
    return image
  }
}
