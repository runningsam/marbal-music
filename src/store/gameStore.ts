import { create } from 'zustand'
import * as Tone from 'tone'

interface GameState {
  isPlaying: boolean
  audioInitialized: boolean
  marbles: { id: string; x: number; z: number; note: string; duration: string; color: string }[]
  tracks: { id: string; x: number; z: number; width: number; note: string; color: string }[]
  
  initAudio: () => void
  togglePlay: () => void
  addMarble: (x: number, z: number, duration?: string) => void
  addTrack: (x: number, z: number, width: number, note: string, color?: string) => void
  removeMarble: (id: string) => void
  playSequence: (sequence: string) => void
  stopSequence: () => void
  wasPlayingBeforeHidden: boolean
  playbackStartTime: number
  bpm: number
  setBpm: (bpm: number) => void
  
  // Effects Settings
  effects: {
    explosiveMarbles: boolean
  }
  toggleExplosiveMarbles: () => void
}


const NOTES = [
  'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 
  'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 
  'C5', 'D5', 'E5'
]

const COLORS = NOTES.map((_, i) => `hsl(${(i * 360) / NOTES.length}, 70%, 60%)`)

const MARBLE_PALETTE = [
  '#ff0055', // Neon Pink
  '#00ffcc', // Cyber Teal
  '#4a9eff', // Premium Blue
  '#ffcc00', // Gold
  '#ff4400', // Deep Orange
  '#aa00ff', // Electric Purple
  '#00ff88', // Spring Green
  '#ffffff', // Pure White
]

export const useGameStore = create<GameState>((set, get) => ({
  isPlaying: false,
  audioInitialized: false,
  wasPlayingBeforeHidden: false,
  marbles: [],
  tracks: NOTES.map((note, i) => ({
    id: `track-${note}-${i}`,
    x: (i - 8) * 1.1, // Adjusted spacing for 17 keys
    z: 0,
    width: 1.0, // Thinner keys
    note,
    color: COLORS[i]
  })),

  initAudio: () => {
    if (get().audioInitialized) return
    Tone.start()
    set({ audioInitialized: true, isPlaying: true })
  },

  togglePlay: () => {
    const isPlaying = get().isPlaying
    if (isPlaying) {
      Tone.Transport.pause()
    } else {
      Tone.Transport.start()
    }
    // If manually toggling, we clear the auto-resume flag
    set({ isPlaying: !isPlaying, wasPlayingBeforeHidden: false })
  },

  addMarble: (x: number, z: number, duration: string = '4n') => {
    const tracks = get().tracks
    // Find the track closest to the click position to determine the note
    let closestTrack = tracks[0]
    let minDistance = Infinity
    
    tracks.forEach(track => {
      const dist = Math.abs(track.x - x)
      if (dist < minDistance) {
        minDistance = dist
        closestTrack = track
      }
    })

    const note = closestTrack?.note || 'C4'
    const id = `marble-${crypto.randomUUID()}`
    const paletteColor = MARBLE_PALETTE[Math.floor(Math.random() * MARBLE_PALETTE.length)]
    
    set((state) => ({
      marbles: [...state.marbles, { id, x, z, note, duration, color: paletteColor }]
    }))
  },

  addTrack: (x: number, z: number, width: number, note: string, color?: string) => {
    const id = `track-${Date.now()}`
    const noteIndex = NOTES.indexOf(note)
    const finalColor = color || (noteIndex !== -1 ? COLORS[noteIndex] : '#ffffff')
    set((state) => ({
      tracks: [...state.tracks, { id, x, z, width, note, color: finalColor }]
    }))
  },

  removeMarble: (id: string) => {
    set((state) => ({
      marbles: state.marbles.filter((m) => m.id !== id)
    }))
  },

  playbackStartTime: 0,
  bpm: 120,

  setBpm: (bpm: number) => {
    Tone.Transport.bpm.rampTo(bpm, 0.1)
    set({ bpm })
  },

  effects: {
    explosiveMarbles: true
  },

  toggleExplosiveMarbles: () => {
    set((state) => ({
      effects: {
        ...state.effects,
        explosiveMarbles: !state.effects.explosiveMarbles
      }
    }))
  },

  stopSequence: () => {
    Tone.Transport.stop()
    Tone.Transport.cancel()
    set({ isPlaying: false })
  },

  playSequence: (sequence: string) => {
    // Clear previous sequence
    Tone.Transport.stop()
    Tone.Transport.cancel()

    const tokens = sequence.split(/\s+/)
    let currentTime = 0
    
    console.log(`[Sequence] Scheduling with Tone.Transport. BPM: ${get().bpm}`)

    tokens.forEach((token) => {
      const [tokenValue, notation = '4n'] = token.split(':')
      const duration = Tone.Time(notation).toSeconds()
      
      if (tokenValue !== '0' && tokenValue !== '-') {
        let noteIndex = -1
        let offset = 7 // Default Middle

        if (tokenValue.startsWith('+')) {
          offset = 14
          noteIndex = offset + (parseInt(tokenValue.substring(1)) - 1)
        } else if (tokenValue.startsWith('-')) {
          offset = 0
          noteIndex = offset + (parseInt(tokenValue.substring(1)) - 1)
        } else {
          noteIndex = offset + (parseInt(tokenValue) - 1)
        }

        const tracks = get().tracks
        if (noteIndex >= 0 && noteIndex < tracks.length) {
          const track = tracks[noteIndex]
          
          // Use Tone.Transport.schedule for high precision
          Tone.Transport.schedule((time) => {
            // We use Tone.Draw to sync with React/Three state updates efficiently
            Tone.Draw.schedule(() => {
              get().addMarble(track.x, -1, notation)
            }, time)
          }, currentTime)
        }
      }
      
      currentTime += duration
    })

    Tone.Transport.start()
    set({ isPlaying: true, playbackStartTime: Date.now() })
    console.log(`[Sequence] Total duration: ${currentTime.toFixed(2)}s`)
  }
}))
