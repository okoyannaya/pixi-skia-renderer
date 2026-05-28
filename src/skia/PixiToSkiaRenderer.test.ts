import { describe, expect, it, vi } from 'vitest'
import * as PIXI from 'pixi.js-legacy'

import { createPixiToSkiaRenderer } from './PixiToSkiaRenderer'
import type { AssetRegistry } from '../scene/AssetRegistry'

class TestCanvasElement {
  width = 0
  height = 0

  getContext(): { fillRect: ReturnType<typeof vi.fn>; fillStyle: string } {
    return {
      fillRect: vi.fn(),
      fillStyle: '',
    }
  }
}

if (!globalThis.HTMLCanvasElement) {
  Object.defineProperty(globalThis, 'HTMLCanvasElement', {
    value: TestCanvasElement,
  })
}

if (!globalThis.document) {
  Object.defineProperty(globalThis, 'document', {
    value: {
      createElement: (tagName: string) => {
        if (tagName !== 'canvas') {
          throw new Error(`Unsupported test element: ${tagName}`)
        }

        return new TestCanvasElement()
      },
    },
  })
}

describe('PixiToSkiaRenderer', () => {
  it('renders nested graphics with the Pixi world transform', () => {
    const canvasKit = createCanvasKitStub()
    const canvas = createCanvasStub()
    const renderer = createPixiToSkiaRenderer(canvasKit as never, createAssetRegistryStub())
    const root = new PIXI.Container()
    const nested = new PIXI.Container()
    const graphics = new PIXI.Graphics()

    nested.position.set(40, 25)
    graphics.beginFill(0xff0000).drawRect(0, 0, 80, 40).endFill()
    graphics.position.set(10, 15)
    nested.addChild(graphics)
    root.addChild(nested)
    updateWorldTransforms(root)

    renderer.render(root, {
      canvas: canvas as never,
      width: 640,
      height: 420,
    })

    expect(canvas.clear).toHaveBeenCalledWith(canvasKit.Color(241, 241, 241, 1))
    expect(canvas.concat).toHaveBeenCalledWith([1, 0, 50, 0, 1, 40, 0, 0, 1])
    expect(canvas.drawRect).toHaveBeenCalledWith(
      { x: 0, y: 0, width: 80, height: 40 },
      expect.objectContaining({
        style: 'fill',
        color: canvasKit.Color(255, 0, 0, 1),
      }),
    )
  })

  it('renders sprites as bitmap images with anchor offset', () => {
    const canvasKit = createCanvasKitStub()
    const canvas = createCanvasStub()
    const image = {
      getImageInfo: () => ({ width: 1200, height: 1200 }),
    }
    const assets = {
      getSkImage: vi.fn(() => image),
    } as unknown as AssetRegistry
    const renderer = createPixiToSkiaRenderer(canvasKit as never, assets)
    const texture = PIXI.Texture.WHITE
    const sprite = new PIXI.Sprite(texture)
    const root = new PIXI.Container()

    sprite.anchor.set(0.5)
    sprite.width = 150
    sprite.height = 150
    root.addChild(sprite)
    updateWorldTransforms(root)

    renderer.render(root, {
      canvas: canvas as never,
      width: 640,
      height: 420,
    })

    expect(assets.getSkImage).toHaveBeenCalledWith(canvasKit, texture)
    expect(canvas.drawImage).toHaveBeenCalledWith(image, -8, -8, null)
  })
})

function updateWorldTransforms(container: PIXI.Container): void {
  const cacheParent = container.enableTempParent()
  container.updateTransform()
  container.disableTempParent(cacheParent)
}

function createCanvasStub() {
  return {
    clear: vi.fn(),
    concat: vi.fn(),
    drawImage: vi.fn(),
    drawRect: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
  }
}

function createAssetRegistryStub(): AssetRegistry {
  return {
    getSkImage: vi.fn(),
    registerPngTexture: vi.fn(),
  } as unknown as AssetRegistry
}

function createCanvasKitStub() {
  class PaintStub {
    color: Float32Array | null = null
    style: string | null = null
    strokeWidth = 0

    delete = vi.fn()

    setAntiAlias(): void {}

    setColor(color: Float32Array): void {
      this.color = color
    }

    setStrokeWidth(width: number): void {
      this.strokeWidth = width
    }

    setStyle(style: string): void {
      this.style = style
    }
  }

  return {
    Color: (red: number, green: number, blue: number, alpha: number) =>
      Float32Array.of(red / 255, green / 255, blue / 255, alpha),
    Paint: PaintStub,
    PaintStyle: {
      Fill: 'fill',
      Stroke: 'stroke',
    },
    XYWHRect: (x: number, y: number, width: number, height: number) => ({
      x,
      y,
      width,
      height,
    }),
  }
}
