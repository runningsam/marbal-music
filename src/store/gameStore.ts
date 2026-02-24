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
  addTrack: (x: number, z: number, width: number, note: string) => void
  removeMarble: (id: string) => void
  playSequence: (sequence: string) => void
  playbackStartTime: number
  bpm: number
  setBpm: (bpm: number) => void
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
    set((state) => ({ isPlaying: !state.isPlaying }))
  },

  addMarble: (x: number, z: number, duration: string = '4n') => {
    // Find the track closest to the click position to determine the note
    const tracks = get().tracks
    const sortedTracks = [...tracks].sort((a, b) => Math.abs(a.x - x) - Math.abs(b.x - x))
    const note = sortedTracks[0]?.note || 'C4'
    
    const id = `marble-${Date.now()}`
    const paletteColor = MARBLE_PALETTE[Math.floor(Math.random() * MARBLE_PALETTE.length)]
    set((state) => ({
      marbles: [...state.marbles, { id, x, z, note, duration, color: paletteColor }]
    }))
  },

  addTrack: (x: number, z: number, width: number, note: string) => {
    const id = `track-${Date.now()}`
    set((state) => ({
      tracks: [...state.tracks, { id, x, z, width, note }]
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
    Tone.Transport.bpm.value = bpm
    set({ bpm })
  },

  playSequence: (sequence: string) => {
    const tokens = sequence.split(/\s+/)
    let cumulativeDelay = 0
    const now = Date.now()
    set({ playbackStartTime: now })

    console.log(`[Sequence] Starting playback. Format: JIANPU (+1, 1, -1, 0:rest)`)

    tokens.forEach((token) => {
      const [tokenValue, notation = '4n'] = token.split(':')
      const durationMs = Tone.Time(notation).toMilliseconds()
      
      // REST: 0 or -
      if (tokenValue !== '0' && tokenValue !== '-') {
        let noteIndex = -1
        let offset = 7 // Default Middle (index 7 is C4)

        if (tokenValue.startsWith('+')) {
          offset = 14
          noteIndex = offset + (parseInt(tokenValue.substring(1)) - 1)
        } else if (tokenValue.startsWith('-')) {
          offset = 0
          noteIndex = offset + (parseInt(tokenValue.substring(1)) - 1)
        } else {
          // Regular middle notes
          noteIndex = offset + (parseInt(tokenValue) - 1)
        }

        const tracks = get().tracks
        if (noteIndex >= 0 && noteIndex < tracks.length) {
          const track = tracks[noteIndex]
          const currentBeatStart = cumulativeDelay
          
          setTimeout(() => {
            const actualSpawnOffset = Date.now() - now
            console.log(`[Spawn] Note ${tokenValue} (${track.note}) dropping as ${notation}`)
            get().addMarble(track.x, -1, notation)
          }, cumulativeDelay)
        }
      }
      
      cumulativeDelay += durationMs
    })

    console.log(`[Sequence] Total duration: ${cumulativeDelay}ms`)
  }
}))
