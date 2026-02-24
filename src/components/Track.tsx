import { RigidBody } from '@react-three/rapier'
import { Text } from '@react-three/drei'

interface TrackProps {
  id: string
  x: number
  z: number
  width: number
  note: string
  color: string
}

export function Track({ x, z, width, note, color }: TrackProps) {
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
            emissiveIntensity={0.2}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      </RigidBody>
      
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
}
