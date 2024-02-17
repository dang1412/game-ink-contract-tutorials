import { Container, Graphics, Renderer } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { Minimap } from './Minimap'

const WORLD_WIDTH = 800
const WORLD_HEIGHT = 800
const PIXEL_SIZE = 40

export class ViewportMap {
  viewport: Viewport
  renderer: Renderer
  container: Container

  wrapper: Container
  minimap: Minimap

  constructor(private canvas: HTMLCanvasElement) {
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

    this.wrapper = new Container()
    this.minimap = new Minimap(renderer)
    this.minimap.container.position.set(10, 10)

    this.wrapper.addChild(this.viewport)
    this.wrapper.addChild(this.minimap.container)

    this.init()
  }

  updateMinimap() {
    const { top, left, worldScreenWidth, worldScreenHeight, worldWidth, worldHeight } = this.viewport
    this.minimap.update(worldWidth, worldHeight, top, left, worldScreenWidth, worldScreenHeight, this.container)
  }

  resize(w: number, h: number) {
    this.renderer.resize(w, h)
    this.viewport.resize(w, h)
  }

  private init() {
    this.viewport
      .drag()
      .pinch()
      .decelerate({
        friction: 0.95
      })
      .wheel()
      // .clamp({direction: 'all'})
      .clampZoom({minScale: 0.5, maxScale: 3})

    for (const [x, y] of [[160,160], [600, 600], [160, 600], [600, 160]]) {
      const rect = new Graphics()
      rect.beginFill('green')
      rect.drawRect(x, y, 120, 120)
      rect.endFill()
      this.container.addChild(rect)
    }

    this.updateMinimap()
    this.drawGrid()
    this.runUpdate()

    this.viewport.on('clicked', (e) => {
      console.log('clicked', e.screen, e.world)
    })

    this.viewport.on('zoomed', () => this.updateMinimap())
    this.viewport.on('moved', () => this.updateMinimap())

    this.viewport.on('drag-start', (e) => {
      console.log('drag-start', e.screen, e.world)
    })

    this.viewport.on('drag-end', (e) => {
      console.log('drag-end', e.screen, e.world)
      const { width, height, worldHeight, worldWidth, x, y, screenHeight, screenWidth, screenHeightInWorldPixels, screenWidthInWorldPixels } = this.viewport
      console.log(width, height, worldHeight, worldWidth, x, y, screenHeight, screenWidth, screenHeightInWorldPixels, screenWidthInWorldPixels)
    })

    this.canvas.addEventListener('mousedown', (e) => {
      const screenX = e.pageX - this.canvas.offsetLeft
      const screenY = e.pageY - this.canvas.offsetTop
      console.log(screenX, screenY)

      // continue calculate pixelX, pixelY follow the above formula
      const scaled = this.viewport.scaled
      const worldX = (screenX - this.viewport.x) / scaled
      const worldY = (screenY - this.viewport.y) / scaled

      console.log('Pixel xy', Math.floor(worldX / PIXEL_SIZE), Math.floor(worldY / PIXEL_SIZE))
    })
  }

  private runUpdate() {
    if (this.viewport.dirty) {
      this.renderer.render(this.wrapper)
      this.viewport.dirty = false
    }

    requestAnimationFrame(() => this.runUpdate())
  }

  private drawGrid() {
    const g = new Graphics()
    this.viewport.addChild(g)
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