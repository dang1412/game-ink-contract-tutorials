import { Container, Graphics, Renderer } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

const WORLD_WIDTH = 800
const WORLD_HEIGHT = 800
const PIXEL_SIZE = 40

export class ViewportMap {
  viewport: Viewport
  renderer: Renderer
  container: Container

  constructor(canvas: HTMLCanvasElement) {
    console.log('ViewportMap')
    const renderer = this.renderer = new Renderer({
      width: 800,
      height: 800,
      antialias: true,
      view: canvas,
      backgroundColor: 0xffffff
    })

    const viewport = this.viewport = new Viewport({
      screenWidth: 800,
      screenHeight: 800,
      worldWidth: 800,    // update when open scene
      worldHeight: 800,  // update when open scene
      passiveWheel: false,
      events: renderer.events,
    })

    const container = this.container = new Container()
    this.viewport.addChild(container)

    this.init()
  }

  private init() {
    this.viewport
      .drag()
      .pinch()
      .decelerate({
        friction: 0.95
      })
      .wheel()
      .clamp({direction: 'all'})
      .clampZoom({minScale: 0.5, maxScale: 3})

    for (const [x, y] of [[200,200], [500, 500], [200, 500], [500, 200]]) {
      const rect = new Graphics()
      rect.beginFill('green')
      rect.drawRect(x, y, 100, 100)
      rect.endFill()
      this.container.addChild(rect)
    }

    this.drawGrid()
    this.runUpdate()
  }

  private runUpdate() {
    if (this.viewport.dirty) {
      this.renderer.render(this.viewport)
      this.viewport.dirty = false
    }

    requestAnimationFrame(() => this.runUpdate())
  }

  private drawGrid() {
    const g = new Graphics()
    this.container.addChild(g)
    g.lineStyle(1, 0x888888, 0.4, undefined, true)

    const pixelWidth = WORLD_WIDTH / PIXEL_SIZE
    const pixelHeight = WORLD_HEIGHT / PIXEL_SIZE

    // draw vertical lines
    for (let i = 0; i <= pixelWidth; i++) {
      const pos = i * PIXEL_SIZE
      g.moveTo(pos, 0)
      g.lineTo(pos, WORLD_HEIGHT)
    }

    // draw horizon lines
    for (let i = 0; i <= pixelHeight; i++) {
      const pos = i * PIXEL_SIZE
      g.moveTo(0, pos)
      g.lineTo(WORLD_WIDTH, pos)
    }
  }
}