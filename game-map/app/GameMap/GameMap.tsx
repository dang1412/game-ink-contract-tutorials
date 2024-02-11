import { useCallback, useEffect, useRef, useState } from 'react'
import { ViewportMap } from './ViewportMap'

interface Props {}

export const GameMap: React.FC<Props> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isFull, setIsFull] = useState(false)

  useEffect(() => {
    const c = canvasRef.current
    if (c) {
      const vpmap = new ViewportMap(c)

      // Create an instance of ResizeObserver
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          // adjust the canvas size since we only watch canvas
          const {width, height} = entry.contentRect
          vpmap.resize(width, height)
        }
      })

      resizeObserver.observe(c)

      return () => {
        resizeObserver.disconnect()
      }
    }
  }, [])

  const setFull = useCallback(() => {
    const c = canvasRef.current
    if (isFull) {
      setIsFull(false)
      if (c) {
        // resize canvas
        c.width = c.height = 800
      }
    } else {
      setIsFull(true)
    }
  }, [isFull])

  return (
    <>
      <canvas className={isFull ? 'fullscreen' : ''} ref={canvasRef} style={{border: '1px solid #ccc'}} />
      <p style={{position: 'fixed', top: 0, left: 0}}><button onClick={setFull}>Fullscreen</button></p>
    </>
  )
}
