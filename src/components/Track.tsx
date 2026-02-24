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
      setHitIntensity(6) // Point light intensity peak
      setHitZ(impactZ - z) // Store relative Z position
    }
  }))

  useFrame((_state, delta) => {
    if (hitIntensity > 0) {
      setHitIntensity(prev => Math.max(0, prev - delta * 6)) // Faster fade for punchy feel
    }
  })

  return (
    <group position={[x, -1, z]} rotation={[0.15, 0, 0]}>
      {/* Piano Key Body */}
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
            emissiveIntensity={0.8} // Constant base glow
            transparent={true}
            opacity={0.85} // Semi-transparent "frosted" look
            toneMapped={false}
            metalness={0.2}
            roughness={0.1}
          />
        </mesh>
      </RigidBody>

      {/* Internal "Crystal" Glow Effect */}
      {hitIntensity > 0 && (
        <group position={[0, 0, hitZ]}>
          {/* Main Internal Bulb - placed inside the key */}
          <pointLight 
            intensity={hitIntensity * 4} 
            distance={15} // Increased distance to travel along the key
            decay={2}
            color={color} 
          />
          
          {/* Longitudinal Beam Effect: Simulated by stretching a mesh inside */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[width * 0.8, 0.2, 3]} />
            <meshStandardMaterial 
              color={color} 
              emissive={color} 
              emissiveIntensity={hitIntensity * 2} 
              transparent 
              opacity={hitIntensity / 10} 
              toneMapped={false}
            />
          </mesh>
        </group>
      )}
      
      {/* Label at the front commented out to avoid font errors */}
      {/* <Text
        position={[0, 0.3, 4.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {note}
      </Text> */}
    </group>
  )
})
