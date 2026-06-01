import type * as PIXI from 'pixi.js-legacy'

export interface LineHitAreaOptions {
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
  minWidth?: number
}

export function enablePointerTarget(object: PIXI.DisplayObject): void {
  object.eventMode = 'static'
  object.cursor = 'pointer'
}

export function createLineHitArea(options: LineHitAreaOptions): PIXI.IHitArea {
  const halfWidth = Math.max(options.width, options.minWidth ?? 14) / 2
  const dx = options.x2 - options.x1
  const dy = options.y2 - options.y1
  const lengthSquared = dx * dx + dy * dy

  return {
    contains(x: number, y: number): boolean {
      if (lengthSquared === 0) {
        return squaredDistance(x, y, options.x1, options.y1) <= halfWidth * halfWidth
      }

      const projection = ((x - options.x1) * dx + (y - options.y1) * dy) / lengthSquared
      const t = Math.max(0, Math.min(1, projection))
      const closestX = options.x1 + t * dx
      const closestY = options.y1 + t * dy

      return squaredDistance(x, y, closestX, closestY) <= halfWidth * halfWidth
    },
  }
}

function squaredDistance(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x1 - x2
  const dy = y1 - y2

  return dx * dx + dy * dy
}
