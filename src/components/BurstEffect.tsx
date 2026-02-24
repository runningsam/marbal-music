import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BurstEffectProps {
  color: string
}

export function BurstEffect({ color }: BurstEffectProps) {
  const count = 80 // Increased from 40 to 80
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  // Initialize particles
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const speed = 0.05 + Math.random() * 0.25 // Slightly wider speed range
      const velocity = new THREE.Vector3(
        Math.sin(phi) * Math.cos(angle) * speed,
        Math.sin(phi) * Math.sin(angle) * speed,
        Math.cos(phi) * speed
      )
      // Boost upward slightly
      velocity.y += 0.12
      temp.push({ velocity, pos: new THREE.Vector3(0, 0, 0), scale: 0.3 + Math.random() * 0.7 })
    }
    return temp
  }, [count])


  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_state, delta) => {
    if (!meshRef.current) return

    const timeScale = Math.min(delta * 60, 2) // Cap timeScale

    particles.forEach((particle, i) => {
      // Move speed
      const moveVec = particle.velocity.clone().multiplyScalar(timeScale)
      particle.pos.add(moveVec)
      
      // Gravity
      particle.velocity.y -= 0.006 * timeScale
      // Air friction
      particle.velocity.multiplyScalar(Math.pow(0.97, timeScale))
      
      // Decay scale - slowed down from 0.92 to 0.96 for longer trails
      particle.scale *= Math.pow(0.96, timeScale)

      dummy.position.copy(particle.pos)
      dummy.scale.setScalar(Math.max(0, particle.scale))
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })



  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.8} />
    </instancedMesh>
  )
}
