import { describe, expect, it, vi } from 'vitest'
import * as PIXI from 'pixi.js-legacy'

import { hitTestDisplayObject } from './hitTest'
import { createLineHitArea, enablePointerTarget } from './pointerTarget'

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

  it('uses custom hit areas for stroked lines', () => {
    const root = new PIXI.Container()
    const graphics = new PIXI.Graphics()

    graphics.lineStyle(10, 0xffffff, 1).moveTo(0, 0).lineTo(150, 100)
    graphics.hitArea = createLineHitArea({ x1: 0, y1: 0, x2: 150, y2: 100, width: 10 })
    graphics.position.set(40, 30)
    graphics.angle = 25
    enablePointerTarget(graphics)
    root.addChild(graphics)
    updateWorldTransforms(root)

    expect(hitTestDisplayObject(root, graphics.worldTransform.apply(new PIXI.Point(75, 50)))).toBe(
      graphics,
    )
    expect(
      hitTestDisplayObject(root, graphics.worldTransform.apply(new PIXI.Point(75, 75))),
    ).toBeNull()
  })
})

function createRect(color: number): PIXI.Graphics {
  const graphics = new PIXI.Graphics()
  graphics.beginFill(color).drawRect(0, 0, 80, 80).endFill()
  enablePointerTarget(graphics)
  graphics.on('pointerdown', vi.fn())

  return graphics
}

function updateWorldTransforms(container: PIXI.Container): void {
  const cacheParent = container.enableTempParent()
  container.updateTransform()
  container.disableTempParent(cacheParent)
}
