# Game Map

Trong bài viết này mình sẽ hướng dẫn cách sử dụng thư viện Pixi.js, Pixi-Viewport để tạo bản đồ sử dụng trong game `Pixelland`

- Zoom và pan với Pixi-viewport
- Mạng lưới kẻ ô (grid)
- Fullscreen
- Minimap

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

Tạo viewport instance với chiều dài rộng màn hình (screenWidth, screenHeight), chiều dài rộng thế giới (worldWidth, worldHeight) giống với kích thước canvas đã set ở trên `(800, 800)`.
Điều này tương đương với việc khởi điểm scale=1 chúng ta sẽ nhìn thấy toàn bộ thế giới trong canvas. Với scale = 2 chiều dài, rộng thế giới x2 `(1600, 1600)` tức là với view `(800, 800)` ta chỉ nhìn thấy 1/4 thế giới và có thể di chuyển view qua lại để nhìn thế giới ở các vị trí khác nhau.

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
`requestAnimationFrame` hơi giống như `setTimeout` nhưng ko phải truyền vào thời gian mà browser sẽ tự quyết thời điểm thực thi hàm truyền vào (ngay trước khi repaint màn hình).

```ts
private runUpdate() {
  if (this.viewport.dirty) {
    this.renderer.render(this.viewport)
    this.viewport.dirty = false
  }

  requestAnimationFrame(() => this.runUpdate())
}
```

Thử vẽ lên bản đồ 1 số hình chữ nhật để check hiển thị

```ts
for (const [x, y] of [[160,160], [600, 600], [160, 600], [600, 160]]) {
  const rect = new Graphics()
  rect.beginFill('green')
  rect.drawRect(x, y, 100, 100)
  rect.endFill()
  this.viewport.addChild(rect)
}
```

Đến đây ta có bản đồ pixi-viewport cơ bản với tính năng zoom, pan

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

    for (const [x, y] of [[160,160], [600, 600], [160, 600], [600, 160]]) {
      const rect = new Graphics()
      rect.beginFill('green')
      rect.drawRect(x, y, 100, 100)
      rect.endFill()
      this.viewport.addChild(rect)
    }

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

## Tạo mạng lưới kẻ ô (grid)

Chúng ta có chiều rộng và dài thế giới `800`, giả sử muốn vẽ lưới ô grid kích thước `40`

```ts
const WORLD_WIDTH = 800
const WORLD_HEIGHT = 800
const PIXEL_SIZE = 40
```

### Vẽ grid

Ta vẽ 20 đường kẻ dọc dài `800` cách nhau `40`, và làm tương tự với 20 đường kẻ ngang.
Khi vẽ thiết lập `lineStyle` với `native=true` để đường kẻ giữ ổn định và không bị to nhỏ khi scale viewport.

```ts
const g = new Graphics()
g.lineStyle(1, 0x888888, 0.4, undefined, true)
```

```ts
export class ViewportMap {
  //...
  private drawGrid() {
    const g = new Graphics()
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

    this.viewwport.addChild(g)
  }
}
```

### Tính tọa độ grid

Để làm việc với grid chúng ta phải tính toán được tọa độ grid 1 cách chính xác xét trên các yếu tố

- Vị trí đang xét trên canvas
- Vị trí view trong thế giới
- Mức scale hiện tại

Ví dụ khi click chuột trên bản đồ ta muốn biết chuột đang ở tọa độ ô thứ mấy ngang và dọc `(x, y)`.

Sử dụng [event `clicked`](https://davidfig.github.io/pixi-viewport/jsdoc/Viewport.html#event:clicked) listener cho viewport

```ts
this.viewport.on('clicked', (e) => {
  console.log('Screen and world:', e.screen, e.world)
  console.log('Pixel xy', Math.floor(e.world.x / PIXEL_SIZE), Math.floor(e.world.y / PIXEL_SIZE))
})
```

Ở đây có 2 loại tọa độ là tọa độ `screen` và tọa độ `world`

- `Screen`: là tọa độ đối với góc trên bên trái của canvas, không ảnh hưởng bởi vị trí của view và scale
- `World`: là tọa độ đối với thế giới trong viewport, ảnh hưởng bởi vị trí của view và scale

Công thức

```
(tọa độ world) = ((tọa độ screen) - (tọa độ view)) / scale

(tọa độ pixel) = (tọa độ world) / PixelSize
```

Trong trường hợp cần xử lý event `mousedown` và `mousemove` để select trên map mà viewport ko hỗ trợ, ta sử dụng trực tiếp event trên canvas.

```ts
this.canvas.addEventListener('mousedown', (e) => {
  const screenX = e.pageX - this.canvas.offsetLeft
  const screenY = e.pageY - this.canvas.offsetTop
  console.log(screenX, screenY)

  // continue calculate pixelX, pixelY follow the above formula
  const worldX = (screenX - this.viewport.x) / this.viewport.scaled
  const worldY = (screenY - this.viewport.y) / this.viewport.scaled

  console.log('Pixel xy', Math.floor(worldX / PIXEL_SIZE), Math.floor(worldY / PIXEL_SIZE))
})
```

## Fullscreen

Đầu tiên để thay đổi kích thước ta cần thông báo cho pixi (renderer) và viewport sự thay đổi

```ts
resize(w: number, h: number) {
  this.renderer.resize(w, h)
  this.viewport.resize(w, h)
}
```

Về phía react ta quan sát sự thay đổi kích thước của canvas sử dụng `ResizeObserver` và gọi hàm resize của map

```tsx
const vpmap = new ViewportMap(c)

// Create an instance of ResizeObserver
const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    // adjust the canvas size since we only watch canvas
    const { width, height } = entry.contentRect
    vpmap.resize(width, height)
  }
})

resizeObserver.observe(c)
```

Để cho canvas mở rộng toàn màn hình dùng class `fullscreen`

```css
.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

Ngoài ra ta cũng có thể dùng api [`requestFullscreen`](https://developer.mozilla.org/en-US/docs/Web/API/Element/requestFullscreen) của phần tử DOM được hỗ trợ bởi browser.

Code đầy đủ [react component](https://github.com/dang1412/game-ink-contract-tutorials/blob/main/game-map/app/GameMap/GameMap.tsx)

## Minimap

Trong phần này ta sẽ tạo 1 minimap ở góc trên bên trái bản đồ, có nhiệm vụ hiển thị toàn bộ bản đồ dạng thu nhỏ và vị trí view hiện tại.

Chúng ta sẽ refactor cấu trúc của map 1 chút, tạo thêm 1 container `wrapper` để chứa `viewport` và `minimap container`

- `wrapper`: Pixi trực tiếp render container này, bao gồm
  - `viewport`: toàn bộ các thành phần trên bản đồ có thể zoom và pan.
  - `mapContainer`: chứa minimap vẽ lại nội dung của viewport dạng thu nhỏ (không ảnh hưởng bởi zoom và pan viewport).
