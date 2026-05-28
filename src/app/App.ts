import type { Surface } from 'canvaskit-wasm'

import { exportPixiContainerToPdf } from '../export/PdfExporter'
import { SkiaPointerBridge } from '../interaction/SkiaPointerBridge'
import { inspectCanvasKitPdfSupport } from '../pdf/pdfSpike'
import { createPixiApplication } from '../pixi/createPixiApplication'
import { addRandomShape } from '../scene/addRandomShape'
import { createDemoScene } from '../scene/createDemoScene'
import { SCENE_HEIGHT, SCENE_WIDTH } from '../shared/constants'
import { createSkiaSurface } from '../skia/createSkiaSurface'
import { createPixiToSkiaRenderer, type PixiToSkiaRenderer } from '../skia/PixiToSkiaRenderer'
import { loadCanvasKit } from '../skia/loadCanvasKit'

export function mountApp(root: HTMLElement): void {
  root.innerHTML = `
    <main class="app-shell">
      <aside class="controls-panel">
        <button id="add-random-shape" type="button">Сгенерировать случайную линию/фигуру</button>
        <button id="export-pdf" type="button">Экспорт в PDF</button>
        <button id="reset-scene" type="button">Сбросить сцену</button>

        <section class="log-panel" aria-label="Лог событий">
          <h2>Лог событий</h2>
          <pre id="event-log">Сцена готовится...</pre>
        </section>
      </aside>

      <section class="canvas-panel">
        <article class="scene-card">
          <header class="scene-card-header">
            <h1>Канвас 1</h1>
            <p>Pixi.js</p>
          </header>
          <div id="pixi-host" class="canvas-host"></div>
        </article>

        <article class="scene-card">
          <header class="scene-card-header">
            <h1>Канвас 2</h1>
            <p>Skia</p>
          </header>
          <canvas
            id="skia-canvas"
            class="render-canvas"
            width="${SCENE_WIDTH}"
            height="${SCENE_HEIGHT}"
            aria-label="Skia canvas"
          ></canvas>
        </article>
      </section>
    </main>
  `

  void bootstrap(root)
}

async function bootstrap(root: HTMLElement): Promise<void> {
  const pixiHost = getRequiredElement<HTMLDivElement>(root, '#pixi-host')
  const skiaCanvas = getRequiredElement<HTMLCanvasElement>(root, '#skia-canvas')
  const addRandomButton = getRequiredElement<HTMLButtonElement>(root, '#add-random-shape')
  const exportPdfButton = getRequiredElement<HTMLButtonElement>(root, '#export-pdf')
  const resetButton = getRequiredElement<HTMLButtonElement>(root, '#reset-scene')
  const eventLog = getRequiredElement<HTMLPreElement>(root, '#event-log')
  const events: string[] = []

  const logEvent = (message: string): void => {
    events.unshift(`${new Date().toLocaleTimeString()} ${message}`)
    eventLog.textContent = events.slice(0, 12).join('\n')
  }

  const pixiApp = createPixiApplication()
  pixiHost.appendChild(pixiApp.view)

  let scene = await createDemoScene(logEvent)
  pixiApp.stage.addChild(scene.container)

  const canvasKit = await loadCanvasKit()
  const skiaSurface = await createSkiaSurface(skiaCanvas)
  let skiaRenderer = createPixiToSkiaRenderer(canvasKit, scene.assets)
  const skiaPointerBridge = new SkiaPointerBridge(skiaCanvas, () => scene.container)
  skiaPointerBridge.attach()

  const render = (): void => {
    try {
      renderBothCanvases(pixiApp, scene.container, skiaRenderer, skiaSurface)
    } catch (error) {
      logEvent(formatError(error))
      pixiApp.ticker.remove(render)
    }
  }

  pixiApp.ticker.add(render)
  logEvent('demo scene ready')

  addRandomButton.addEventListener('click', () => {
    addRandomShape(scene.container, logEvent)
    logEvent('random shape added')
    render()
  })

  resetButton.addEventListener('click', async () => {
    resetButton.disabled = true

    try {
      pixiApp.stage.removeChild(scene.container)
      scene = await createDemoScene(logEvent)
      pixiApp.stage.addChild(scene.container)
      skiaRenderer = createPixiToSkiaRenderer(canvasKit, scene.assets)
      logEvent('scene reset')
      render()
    } catch (error) {
      logEvent(formatError(error))
    } finally {
      resetButton.disabled = false
    }
  })

  exportPdfButton.addEventListener('click', async () => {
    exportPdfButton.disabled = true

    try {
      const report = await inspectCanvasKitPdfSupport()

      if (report.pdfBackendAvailable) {
        updateWorldTransforms(pixiApp.stage)
        exportPixiContainerToPdf(canvasKit, skiaRenderer, scene.container, {
          filename: 'pixi-skia-scene.pdf',
          width: SCENE_WIDTH,
          height: SCENE_HEIGHT,
        })
        logEvent('PDF exported')
      } else {
        logEvent('PDF backend requires custom CanvasKit build')
      }
    } catch (error) {
      logEvent(formatError(error))
    } finally {
      exportPdfButton.disabled = false
    }
  })
}

function renderBothCanvases(
  pixiApp: ReturnType<typeof createPixiApplication>,
  container: import('pixi.js-legacy').Container,
  skiaRenderer: PixiToSkiaRenderer,
  skiaSurface: Surface,
): void {
  pixiApp.renderer.render(pixiApp.stage)
  updateWorldTransforms(pixiApp.stage)

  skiaRenderer.render(container, {
    canvas: skiaSurface.getCanvas(),
    width: SCENE_WIDTH,
    height: SCENE_HEIGHT,
  })

  skiaSurface.flush()
}

function updateWorldTransforms(container: import('pixi.js-legacy').Container): void {
  const cacheParent = container.enableTempParent()
  container.updateTransform()
  container.disableTempParent(cacheParent)
}

function getRequiredElement<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector)

  if (!element) {
    throw new Error(`Element "${selector}" was not found.`)
  }

  return element
}

function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`
  }

  return String(error)
}
