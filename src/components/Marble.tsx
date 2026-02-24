import { useRef, useEffect, useState } from 'react'
import { RigidBody, RapierRigidBody } from '@react-three/rapier'
import * as Tone from 'tone'
import { useGameStore } from '../store/gameStore'
import { BurstEffect } from './BurstEffect'

interface MarbleProps {
  id: string
  x: number
  z: number
  note: string
  duration: string
  color: string
}

export function Marble({ id, x, z, note, duration, color }: MarbleProps) {
  const synthRef = useRef<Tone.PolySynth | null>(null)
  const rbRef = useRef<RapierRigidBody>(null)
  const playedCountRef = useRef(0)
  const [exploded, setExploded] = useState(false)

  const initSynth = () => {
    if (!synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1.5 }
      }).toDestination()
      synthRef.current.volume.value = -3 
    }
    return synthRef.current!
  }

  useEffect(() => {
    // Moderate initial push
    if (rbRef.current) {
      rbRef.current.applyImpulse({ x: 0, y: 0, z: 3 }, true)
    }

    // Auto-destroy if it falls off or something, but the collision usually handles it now
    const timer = setTimeout(() => {
      useGameStore.getState().removeMarble(id)
    }, 8000)

    return () => {
      clearTimeout(timer)
      synthRef.current?.dispose()
    }
  }, [id])

  const handleCollision = async () => {
    if (playedCountRef.current < 1 && !exploded) {
      const { playbackStartTime, effects, tracks } = useGameStore.getState()
      
      // Find the track by X position to trigger flash
      const track = tracks.find(t => Math.abs(t.x - x) < 0.1)
      if (track) {
        const hitEvent = new CustomEvent('track-hit', { detail: { trackId: track.id, z } })
        window.dispatchEvent(hitEvent)
      }

      if (Tone.context.state !== 'running') {
        await Tone.start()
      }
      
      const offset = playbackStartTime > 0 ? Date.now() - playbackStartTime : 0
      console.log(`[Sound Hit] Offset: ${offset}ms | Note: ${note} | Duration: ${duration}`)
      
      const synth = initSynth()
      synth.triggerAttackRelease(note, duration)
      playedCountRef.current++
      
      if (effects.explosiveMarbles) {
        // Trigger burst
        setExploded(true)
        
        // Remove from store after effect finishes
        setTimeout(() => {
          useGameStore.getState().removeMarble(id)
        }, 2000)
      }
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
      collisionGroups={0x00020001}
      // If exploded, we change the sensor property to true so it doesn't collide anymore
      sensor={exploded}
    >
      {!exploded ? (
        <>
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
        </>
      ) : (
        <BurstEffect color={color} />
      )}
    </RigidBody>
  )
}

