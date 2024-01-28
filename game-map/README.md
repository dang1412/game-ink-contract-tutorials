# Game Map

Trong bài viết này mình sẽ hướng dẫn cách sử dụng thư viện Pixi.js, Pixi-Viewport để tạo bản đồ sử dụng trong game `Pixelland`

- Mạng lưới kẻ ô (grid)
- Zoom và pan
- Minimap
- Fullscreen

## Tạo map với pixi-viewport

Cài đặt packages

```sh
npm i pixi.js pixi-viewport
```

Với canvas DOM truyền vào tạo renderer instance với width và height, width height này sẽ đc set cho phần tử canvas trên DOM.

```ts
const renderer = new Renderer({
  width: 800,
  height: 800,
  antialias: true,
  view: canvas,
  backgroundColor: 0xffffff
})
```

Tạo viewport instance với chiều dài rộng màn hình (screenWidth, screenHeight), chiều dài rộng thế giới (worldWidth, worldHeight) giống với kích thước canvas đã set ở trên (800, 800).
Điều này tương đương với việc khởi điểm scale=1 chúng ta sẽ nhìn thấy toàn bộ thế giới trong canvas. Với scale = 2 chiều dài, rộng thế giới x2 (1600, 1600) tức là với view (800, 800) ta chỉ nhìn thấy 1/4 thế giới và có thể di chuyển view qua lại để nhìn thế giới ở các vị trí khác nhau.

```ts
const viewport = new Viewport({
  screenWidth: 800,
  screenHeight: 800,
  worldWidth: 800,
  worldHeight: 800,
  events: renderer.events,
})
```

Ở đây set events có ý nghĩa là viewport sẽ nhận events từ renderer đã tạo ở trên của pixi. Sau đó ta dùng renderer để vẽ (render) viewport liên tục mỗi khi viewport có update.

```ts
private runUpdate() {
  if (this.viewport.dirty) {
    this.renderer.render(this.viewport)
    this.viewport.dirty = false
  }

  requestAnimationFrame(() => this.runUpdate())
}
```


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
