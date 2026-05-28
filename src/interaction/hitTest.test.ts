import { describe, expect, it, vi } from 'vitest'
import * as PIXI from 'pixi.js-legacy'

import { hitTestDisplayObject } from './hitTest'

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

describe('hitTestDisplayObject', () => {
  it('returns the topmost interactive object', () => {
    const root = new PIXI.Container()
    const bottom = createRect(0xff0000)
    const top = createRect(0x0000ff)

    root.addChild(bottom, top)

    expect(hitTestDisplayObject(root, new PIXI.Point(20, 20))).toBe(top)
  })

  it('ignores non-interactive objects', () => {
    const root = new PIXI.Container()
    const graphics = createRect(0xff0000)

    graphics.eventMode = 'none'
    root.addChild(graphics)

    expect(hitTestDisplayObject(root, new PIXI.Point(20, 20))).toBeNull()
  })

  it('uses transformed bounds for graphics', () => {
    const root = new PIXI.Container()
    const graphics = createRect(0xff0000)

    graphics.position.set(100, 50)
    graphics.angle = 30
    root.addChild(graphics)
    const cacheParent = root.enableTempParent()
    root.updateTransform()
    root.disableTempParent(cacheParent)

    expect(hitTestDisplayObject(root, graphics.worldTransform.apply(new PIXI.Point(25, 25)))).toBe(
      graphics,
    )
  })
})

function createRect(color: number): PIXI.Graphics {
  const graphics = new PIXI.Graphics()
  graphics.beginFill(color).drawRect(0, 0, 80, 80).endFill()
  graphics.eventMode = 'static'
  graphics.on('pointerdown', vi.fn())

  return graphics
}
