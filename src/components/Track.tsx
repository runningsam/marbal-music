import { useState, forwardRef, useImperativeHandle } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'


interface TrackProps {
  id: string
  x: number
  z: number
  width: number
  note: string
  color: string
}

export interface TrackHitApi {
  handleHit: (z: number) => void
}

export const Track = forwardRef<TrackHitApi, TrackProps>(({ x, z, width, color }, ref) => {
  const [hitIntensity, setHitIntensity] = useState(0)
  const [hitZ, setHitZ] = useState(0)

  useImperativeHandle(ref, () => ({
    handleHit: (impactZ: number) => {
      setHitIntensity(1.5) // Peak intensity for bloom
      setHitZ(impactZ - z)
    }
  }))

  useFrame((_state, delta) => {
    if (hitIntensity > 0) {
      setHitIntensity(prev => Math.max(0, prev - delta * 1.5)) 
    }
  })

  return (
    <group position={[x, -1, z]} rotation={[0.15, 0, 0]}>
      {/* 1. Main Key Body - Standard material with high emissive boost */}
      <RigidBody 
        type="fixed" 
        restitution={0} 
        friction={0.1}
        collisionGroups={0x00010002}
        userData={{ isTrack: true }}
      >
        <mesh receiveShadow>
          <boxGeometry args={[width, 0.4, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.1 + hitIntensity * 1.5} // Further reduced
            toneMapped={false}
            transparent={true}
            opacity={0.9}
            metalness={0.2}
            roughness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* 2. Visual Effects Component */}
      {hitIntensity > 0 && (
        <>
          {/* Internal point light to light up the ball and the track surface near the hit */}
          <pointLight 
            position={[0, 0.2, hitZ]}
            intensity={hitIntensity * 3} // Further reduced
            distance={3}
            decay={2}
            color={color}
          />
        </>
      )}
    </group>
  )
})
