import * as PIXI from 'pixi.js-legacy'

export function hitTestDisplayObject(
  root: PIXI.Container,
  point: PIXI.IPointData,
): PIXI.DisplayObject | null {
  return hitTestRecursive(root, point)
}

function hitTestRecursive(
  displayObject: PIXI.DisplayObject,
  point: PIXI.IPointData,
): PIXI.DisplayObject | null {
  if (!displayObject.visible || !displayObject.renderable) {
    return null
  }

  if (displayObject instanceof PIXI.Container) {
    for (let index = displayObject.children.length - 1; index >= 0; index -= 1) {
      const child = displayObject.children[index]

      if (!child) {
        continue
      }

      const hit = hitTestRecursive(child, point)

      if (hit) {
        return hit
      }
    }
  }

  if (!isInteractive(displayObject)) {
    return null
  }

  if (displayObject.hitArea) {
    return containsHitArea(displayObject, point) ? displayObject : null
  }

  if (displayObject instanceof PIXI.Graphics) {
    return displayObject.containsPoint(point) ? displayObject : null
  }

  if (displayObject instanceof PIXI.Sprite) {
    return displayObject.containsPoint(point) ? displayObject : null
  }

  return null
}

function isInteractive(displayObject: PIXI.DisplayObject): boolean {
  return (
    displayObject.interactive ||
    displayObject.eventMode === 'static' ||
    displayObject.eventMode === 'dynamic'
  )
}

function containsHitArea(
  displayObject: PIXI.DisplayObject,
  point: PIXI.IPointData,
): boolean {
  if (!displayObject.hitArea) {
    return false
  }

  const localPoint = displayObject.worldTransform.applyInverse(point)

  return displayObject.hitArea.contains(localPoint.x, localPoint.y)
}
