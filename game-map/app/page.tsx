'use client'

import dynamic from 'next/dynamic'

import styles from "./page.module.css"

const GameMapLoad = () => import('@/app/GameMap').then(m => m.GameMap)
const GameMap = dynamic(GameMapLoad, {ssr: false})

export default function Home() {
  return (
    <main className={styles.main}>
      <GameMap />
    </main>
  )
}
