import { Canvas } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { Suspense, useEffect } from 'react'
import * as THREE from 'three'
import * as Tone from 'tone'
import { Scene } from './components/Scene'
import { UI } from './components/UI'
import { useGameStore } from './store/gameStore'

export default function App() {
  const initAudio = useGameStore((state) => state.initAudio)

  // Handle Tab Switching / Visibility
  useEffect(() => {
    const handleVisibilityChange = async () => {
      const { isPlaying, wasPlayingBeforeHidden } = useGameStore.getState()
      
      if (document.hidden) {
        if (isPlaying) {
          useGameStore.setState({ wasPlayingBeforeHidden: true, isPlaying: false })
          Tone.Transport.pause()
        }
      } else {
        if (wasPlayingBeforeHidden) {
          useGameStore.setState({ wasPlayingBeforeHidden: false, isPlaying: true })
          // Crucial: Browsers often suspend audio context when tab is hidden
          if (Tone.context.state !== 'running') {
            await Tone.context.resume()
          }
          Tone.Transport.start()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

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
