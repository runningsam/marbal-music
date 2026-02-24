import { useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { Marble } from './Marble'
import { Track } from './Track'

export function Scene() {
  const { camera } = useThree()
  const addMarble = useGameStore((state) => state.addMarble)
  const marbles = useGameStore((state) => state.marbles)
  const tracks = useGameStore((state) => state.tracks)


  useFrame(() => {
    // Better angle for keyboard (pushed back for 17 keys)
    camera.position.lerp(new THREE.Vector3(0, 12, 16), 0.05)
    camera.lookAt(0, -3, 0)
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    const point = event.point
    addMarble(point.x, point.z)
  }

  return (
    <>
      <color attach="background" args={['#020205']} />
      <fog attach="fog" args={['#020205', 10, 50]} />
      
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[0, 20, 0]}
        intensity={1.2}
      />
      
      {/* Invisible Click Plane - Aligned with the track surface (y=-0.8, rotated 0.15) */}
      <mesh 
        rotation={[-Math.PI / 2 + 0.15, 0, 0]} 
        position={[0, -0.8, 0]} 
        onClick={handleClick} 
        visible={false}
      >
        <planeGeometry args={[100, 100]} />
      </mesh>
      
      {/* Minimal Stage - Removed Grid for cleaner look */}


      {tracks.map((track) => (
        <Track key={track.id} {...track} />
      ))}

      {marbles.map((marble) => (
        <Marble 
          key={marble.id} 
          id={marble.id} 
          x={marble.x} 
          z={marble.z} 
          note={marble.note} 
          duration={marble.duration}
          color={marble.color} 
        />
      ))}
    </>
  )
}
