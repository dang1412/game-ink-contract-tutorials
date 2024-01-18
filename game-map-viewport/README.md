# Game Map

Trong bài viết này mình sẽ hướng dẫn cách sử dụng thư viện Pixi.js, Pixi-Viewport để tạo bản đồ sử dụng trong game `Pixelland`

- Mạng lưới kẻ ô (grid)
- Zoom và pan
- Minimap
- Fullscreen

## Tạo map với pixi-viewport

```ts
import { Renderer } from 'pixi.js'
import { Viewport } from 'pixi-viewport'

class ViewportMap {
  viewport: Viewport
  renderer: Renderer

  constructor(canvas: HTMLCanvasElement) {
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

    const rect = new Graphics()
    rect.clear()
    rect.beginFill('green')
    rect.drawRect(100, 100, 100, 100)
    rect.endFill()

    this.viewport.addChild(rect)

    this.runUpdate()
  }

  private runUpdate() {
    if (this.viewport.dirty) {
      this.renderer.render(this.viewport)
      this.viewport.dirty = false
    }

    requestAnimationFrame(() => this.runUpdate())
  }
}
```
