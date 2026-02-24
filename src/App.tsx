import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense } from 'react'
import * as THREE from 'three'
import { Scene } from './components/Scene'
import { UI } from './components/UI'
import { useGameStore } from './store/gameStore'

export default function App() {
  const initAudio = useGameStore((state) => state.initAudio)

  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 15, 20], fov: 45 }}
        onClick={initAudio}
        gl={{ 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          outputColorSpace: THREE.SRGBColorSpace
        }}
      >
        <Suspense fallback={null}>
          <Physics gravity={[0, -15, 0]}>
            <Scene />
          </Physics>
        </Suspense>
      </Canvas>
      <UI />
    </>
  )
}
