import { useRef, useEffect } from 'react'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as Tone from 'tone'
import { useGameStore } from '../store/gameStore'

interface MarbleProps {
  id: string
  x: number
  z: number
  note: string
  duration: string
  color: string
}

export function Marble({ id, x, z, note, duration, color }: MarbleProps) {
  const synthRef = useRef<Tone.Synth | null>(null)
  const rbRef = useRef<RapierRigidBody>(null)
  const playedCountRef = useRef(0)

  const initSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1.5 }
      }).toDestination()
      synthRef.current.volume.value = -3 
    }
    return synthRef.current
  }

  useEffect(() => {
    // Moderate initial push, let tilt do the rest
    if (rbRef.current) {
      rbRef.current.applyImpulse({ x: 0, y: 0, z: 3 }, true)
    }

    // Auto-destroy after 6 seconds to save performance
    const timer = setTimeout(() => {
      useGameStore.getState().removeMarble(id)
    }, 6000)

    return () => {
      clearTimeout(timer)
      synthRef.current?.dispose()
    }
  }, [id])

  const handleCollision = async (event: any) => {
    if (playedCountRef.current < 1) {
      // DEBUG: Let's see what is inside 'event' to find where userData is
      // console.log('Collision Event details:', Object.keys(event), event.other?.userData)
      
      const isTrack = event.other?.userData?.isTrack || event.colliderObject?.userData?.isTrack
      
      // If we don't find isTrack, we still play for now to diagnose
      if (Tone.context.state !== 'running') {
        await Tone.start()
      }
      
      const { playbackStartTime } = useGameStore.getState()
      const offset = playbackStartTime > 0 ? Date.now() - playbackStartTime : 0
      
      console.log(`[Sound Hit] Offset: ${offset}ms | Note: ${note} | Duration: ${duration}`)
      
      const synth = initSynth()
      // Directly use musical notation ('4n', '8n', etc.)
      synth.triggerAttackRelease(note, duration)
      playedCountRef.current++
    }
  }

  return (
    <RigidBody
      ref={rbRef}
      position={[x, 5, z]}
      colliders="ball"
      restitution={0}
      friction={0.1}
      onCollisionEnter={handleCollision}
      userData={{ isMarble: true }}
      // Collision Groups: Marble is group 2 (0x0002).
      // It should collide with Track (group 1 -> 0x0001) 
      // but NOT with other marbles.
      // Format: 16-bit membership | 16-bit filter
      // 0x0002 (group 2) | 0x0001 (mask for group 1 only) = 0x00020001
      collisionGroups={0x00020001}
    >
      <mesh>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={2}
          metalness={0.7}
          roughness={0.1}
        />
      </mesh>
      <pointLight intensity={1.5} distance={5} color={color} />
    </RigidBody>
  )
}
