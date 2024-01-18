import { useCallback, useEffect, useRef } from 'react'
import { ViewportMap } from './ViewportMap'

interface Props {}

export const GameMap: React.FC<Props> = (props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = canvasRef.current
    if (c) {
      const vpmap = new ViewportMap(c)
    }
  }, [])
  
  return (
    <>
      <canvas ref={canvasRef} style={{border: '1px solid #ccc'}} />
    </>
  )
}
