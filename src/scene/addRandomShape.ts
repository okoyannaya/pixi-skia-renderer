import * as PIXI from 'pixi.js-legacy'

import { createLineHitArea, enablePointerTarget } from '../interaction/pointerTarget'
import { SCENE_HEIGHT, SCENE_WIDTH } from '../shared/constants'

export function addRandomShape(
  container: PIXI.Container,
  logEvent: (message: string) => void,
): PIXI.Graphics {
  const graphics = new PIXI.Graphics()
  const color = Math.floor(Math.random() * 0xffffff)
  const x = 80 + Math.random() * (SCENE_WIDTH - 160)
  const y = 80 + Math.random() * (SCENE_HEIGHT - 160)

  if (Math.random() > 0.5) {
    graphics.beginFill(color, 0.8)
    graphics.drawRect(-35, -25, 70, 50)
    graphics.endFill()
  } else {
    graphics.lineStyle(6, color, 1)
    graphics.moveTo(-55, -25)
    graphics.lineTo(55, 25)
    graphics.hitArea = createLineHitArea({ x1: -55, y1: -25, x2: 55, y2: 25, width: 6 })
  }

  graphics.position.set(x, y)
  graphics.angle = -35 + Math.random() * 70
  graphics.scale.set(0.7 + Math.random() * 1.3)
  enablePointerTarget(graphics)
  graphics.on('pointerdown', () => logEvent('random shape pointerdown'))
  graphics.on('pointerup', () => logEvent('random shape pointerup'))

  container.addChild(graphics)
  return graphics
}
