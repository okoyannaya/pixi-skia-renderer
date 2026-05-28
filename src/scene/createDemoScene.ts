import * as PIXI from 'pixi.js-legacy'

import { AssetRegistry } from './AssetRegistry'

const SPRITE_IMAGE_URL = '/images/b.png'

export interface DemoScene {
  container: PIXI.Container
  assets: AssetRegistry
}

export async function createDemoScene(logEvent: (message: string) => void): Promise<DemoScene> {
  const assets = new AssetRegistry()
  const mainContainer = new PIXI.Container()
  const subContainer = new PIXI.Container()
  const g1 = new PIXI.Graphics()
  const g2 = new PIXI.Graphics()
  const g3 = new PIXI.Graphics()
  const g4 = new PIXI.Graphics()

  g1.beginFill(0xff0000).drawEllipse(0, 0, 200, 100).endFill()
  g1.position.set(360, 145)
  g1.angle = 30
  wirePointerEvents(g1, 'g1', logEvent)

  g2.beginFill(0x0000ff).drawRect(-50, -75, 100, 150).endFill()
  g2.position.set(300, 235)
  g2.angle = 15
  g2.scale.set(1.5, 1.7)
  wirePointerEvents(g2, 'g2', logEvent)

  g3.lineStyle(10, 0x111111, 1).moveTo(0, 0).lineTo(150, 100)
  g3.angle = -20
  wirePointerEvents(g3, 'g3', logEvent)

  g4.lineStyle(10, 0xffff00, 1).moveTo(0, 70).lineTo(150, -30)
  g4.angle = 20
  wirePointerEvents(g4, 'g4', logEvent)

  subContainer.position.set(230, 105)
  subContainer.addChild(g3, g4)

  const { bytes, texture } = await loadPngTexture(SPRITE_IMAGE_URL)
  assets.registerPngTexture(texture, bytes)

  const sprite = new PIXI.Sprite(texture)
  sprite.position.set(330, 285)
  sprite.width = 150
  sprite.height = 150
  sprite.anchor.set(0.5)
  wirePointerEvents(sprite, 'sprite', logEvent)

  mainContainer.addChild(sprite, subContainer, g1, g2)

  return {
    container: mainContainer,
    assets,
  }
}

async function loadPngTexture(url: string): Promise<{ bytes: Uint8Array; texture: PIXI.Texture }> {
  const [bytes, texture] = await Promise.all([fetchPngBytes(url), loadPixiTexture(url)])

  return { bytes, texture }
}

async function fetchPngBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to load sprite image "${url}".`)
  }

  return new Uint8Array(await response.arrayBuffer())
}

function loadPixiTexture(url: string): Promise<PIXI.Texture> {
  const texture = PIXI.Texture.from(url)

  if (texture.baseTexture.valid) {
    return Promise.resolve(texture)
  }

  return new Promise((resolve, reject) => {
    texture.baseTexture.once('loaded', () => resolve(texture))
    texture.baseTexture.once('error', () => reject(new Error(`Failed to load Pixi texture "${url}".`)))
  })
}

function wirePointerEvents(
  object: PIXI.DisplayObject,
  name: string,
  logEvent: (message: string) => void,
): void {
  object.eventMode = 'static'
  object.cursor = 'pointer'
  object.on('pointerdown', () => logEvent(`${name} pointerdown`))
  object.on('pointerup', () => logEvent(`${name} pointerup`))
}
