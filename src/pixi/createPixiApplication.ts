import * as PIXI from 'pixi.js-legacy'

import { SCENE_HEIGHT, SCENE_WIDTH } from '../shared/constants'

export function createPixiApplication(): PIXI.Application<HTMLCanvasElement> {
  return new PIXI.Application<HTMLCanvasElement>({
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
    backgroundColor: 0xf1f1f1,
    antialias: true,
    forceCanvas: true,
  })
}
