import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { Stars, Grid, Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../store/gameStore'
import { Marble } from './Marble'
import { Track } from './Track'

export function Scene() {
  const { camera } = useThree()
  const addMarble = useGameStore((state) => state.addMarble)
  const marbles = useGameStore((state) => state.marbles)
  const tracks = useGameStore((state) => state.tracks)
  const isPlaying = useGameStore((state) => state.isPlaying)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    // Better angle for keyboard (pushed back for 17 keys)
    camera.position.lerp(new THREE.Vector3(0, 12, 16), 0.05)
    camera.lookAt(0, -3, 0)
  })

  const handleClick = (event: any) => {
    event.stopPropagation()
    const point = event.point
    // Always drop further forward on the track
    addMarble(point.x, -1)
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
      
      {/* Invisible Click Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} onClick={handleClick} visible={false}>
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
