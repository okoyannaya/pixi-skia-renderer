import * as PIXI from 'pixi.js-legacy'

import { hitTestDisplayObject } from './hitTest'

export class SkiaPointerBridge {
  private readonly canvas: HTMLCanvasElement
  private readonly getRootContainer: () => PIXI.Container

  private readonly handlePointerDown = (event: PointerEvent): void => {
    this.emitPointerEvent('pointerdown', event)
  }

  private readonly handlePointerUp = (event: PointerEvent): void => {
    this.emitPointerEvent('pointerup', event)
  }

  constructor(canvas: HTMLCanvasElement, getRootContainer: () => PIXI.Container) {
    this.canvas = canvas
    this.getRootContainer = getRootContainer
  }

  attach(): void {
    this.canvas.addEventListener('pointerdown', this.handlePointerDown)
    this.canvas.addEventListener('pointerup', this.handlePointerUp)
  }

  detach(): void {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown)
    this.canvas.removeEventListener('pointerup', this.handlePointerUp)
  }

  private emitPointerEvent(type: 'pointerdown' | 'pointerup', event: PointerEvent): void {
    const point = this.getScenePoint(event)
    const hit = hitTestDisplayObject(this.getRootContainer(), point)

    if (!hit) {
      return
    }

    const pixiEvent = {
      type,
      target: hit,
      currentTarget: hit,
      global: new PIXI.Point(point.x, point.y),
      originalEvent: event,
    } as unknown as PIXI.FederatedPointerEvent

    hit.emit(type, pixiEvent)
  }

  private getScenePoint(event: PointerEvent): PIXI.Point {
    const rect = this.canvas.getBoundingClientRect()
    const scaleX = this.canvas.width / rect.width
    const scaleY = this.canvas.height / rect.height

    return new PIXI.Point((event.clientX - rect.left) * scaleX, (event.clientY - rect.top) * scaleY)
  }
}
