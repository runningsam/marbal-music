import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

const Logo = () => (
  <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 0 12px rgba(74, 158, 255, 0.5))' }}>
    <defs>
      <linearGradient id="marbleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4a9eff" />
        <stop offset="100%" stopColor="#00ffcc" />
      </linearGradient>
      <radialGradient id="innerGlow" cx="30%" cy="30%" r="70%">
        <stop offset="0%" stopColor="white" stopOpacity="0.4" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#marbleGrad)" fillOpacity="0.15" stroke="url(#marbleGrad)" strokeWidth="1.5" />
    <circle cx="50" cy="50" r="35" fill="url(#marbleGrad)" />
    <circle cx="50" cy="50" r="35" fill="url(#innerGlow)" />
    <path d="M30 50C30 50 35 40 40 40C45 40 50 60 55 60C60 60 65 50 65 50" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.8" />
    <path d="M35 55C35 55 38 48 42 48C46 48 50 62 54 62C58 62 61 55 61 55" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
  </svg>
)

export function UI() {
  const audioInitialized = useGameStore((state) => state.audioInitialized)
  const isPlaying = useGameStore((state) => state.isPlaying)
  const bpm = useGameStore((state) => state.bpm)
  const setBpm = useGameStore((state) => state.setBpm)
  const playSequence = useGameStore((state) => state.playSequence)
  
  const [sequence, setSequence] = useState('3:4n 3:4n 4:4n 5:4n 5:4n 4:4n 3:4n 2:4n 1:4n 1:4n 2:4n 3:4n 3:4n. 2:8n 2:2n')
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '40px',
      color: '#fff',
      textRendering: 'optimizeLegibility'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start'
      }}>
        <div style={{ 
          animation: 'slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          display: 'flex',
          alignItems: 'center',
          gap: '24px'
        }}>
          <Logo />
          <div>
            <h1 style={{ 
              fontSize: '3.5rem', 
              fontWeight: 700,
              lineHeight: 1,
              margin: 0,
              background: 'linear-gradient(135deg, #fff 0%, #4a9eff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase'
            }}>
              Marble
            </h1>
            <h2 style={{
              fontSize: '1rem',
              fontWeight: 200,
              letterSpacing: '0.4em',
              marginTop: '4px',
              opacity: 0.5,
              textTransform: 'uppercase'
            }}>
              Audio Odyssey
            </h2>
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'flex-end',
          pointerEvents: 'auto'
        }}>
          {/* Top Button Row */}
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '12px',
            alignItems: 'center'
          }}>
            {/* Quick Play Button */}
            <button 
              onClick={() => {
                if (!audioInitialized) useGameStore.getState().initAudio()
                playSequence(sequence)
              }}
              style={{
                background: 'rgba(74, 158, 255, 0.2)',
                backdropFilter: 'blur(12px)',
                padding: '12px 24px',
                borderRadius: '100px',
                border: '1px solid rgba(74, 158, 255, 0.5)',
                fontSize: '0.8rem',
                fontWeight: 700,
                letterSpacing: '0.1em',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '1rem' }}>▶</span> EXECUTE
            </button>

            <button 
              onClick={() => setShowSettings(!showSettings)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(12px)',
                padding: '12px 24px',
                borderRadius: '100px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '0.8rem',
                letterSpacing: '0.1em',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                color: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: showSettings ? '0 0 20px rgba(74, 158, 255, 0.2)' : 'none'
              }}
            >
              <span style={{ 
                width: '8px', 
                height: '8px', 
                borderRadius: '50%', 
                background: isPlaying ? '#00ffaa' : '#ff4444',
                boxShadow: `0 0 10px ${isPlaying ? '#00ffaa' : '#ff4444'}`
              }} />
              {showSettings ? 'CLOSE' : 'SETTINGS'}
            </button>
          </div>

          {/* Settings Panel */}
          <div style={{
            background: 'rgba(10, 10, 20, 0.6)',
            backdropFilter: 'blur(24px)',
            padding: '24px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            width: '360px',
            maxHeight: showSettings ? '800px' : '0px',
            opacity: showSettings ? 1 : 0,
            overflow: 'hidden',
            visibility: showSettings ? 'visible' : 'hidden',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5)',
            transform: showSettings ? 'translateY(0)' : 'translateY(-20px)'
          }}>
            <label style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
              Simplified Notation (Jianpu: -1 | 1 | +1, rest: 0)
            </label>
            <p style={{ fontSize: '0.6rem', opacity: 0.3, marginBottom: '8px', lineHeight: 1.4 }}>
              e.g. 3:4n (Mi), +1:8n (High Do), -5:2n (Low Sol). 0 for silence.
            </p>
            <textarea
              value={sequence}
              onChange={(e) => setSequence(e.target.value)}
              placeholder="Paste your score here..."
              style={{
                width: '100%',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#4a9eff',
                padding: '16px',
                fontSize: '0.9rem',
                fontFamily: 'monospace',
                resize: 'none',
                height: '180px',
                marginBottom: '20px',
                outline: 'none',
                lineHeight: '1.6'
              }}
            />
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>Tempo (BPM)</label>
                <span style={{ fontSize: '0.8rem', color: '#4a9eff', fontWeight: 600 }}>{bpm}</span>
              </div>
              <input 
                type="range" 
                min="60" 
                max="240" 
                value={bpm}
                onChange={(e) => setBpm(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#4a9eff',
                  cursor: 'pointer'
                }}
              />
            </div>

            <button
              onClick={() => {
                if (!audioInitialized) useGameStore.getState().initAudio()
                playSequence(sequence)
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(74, 158, 255, 0.4) 0%, rgba(74, 158, 255, 0.1) 100%)',
                border: '1px solid #4a9eff',
                borderRadius: '12px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                letterSpacing: '0.1em'
              }}
            >
              Execute Protocol
            </button>
          </div>
        </div>
      </div>

      {!audioInitialized && (
        <div 
          onClick={() => useGameStore.getState().initAudio()}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            pointerEvents: 'auto',
            cursor: 'pointer',
            textAlign: 'center',
            padding: '40px 80px',
            background: 'rgba(5, 5, 10, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            border: '1px solid rgba(74, 158, 255, 0.3)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            animation: 'fadeIn 1s ease-out'
          }}
        >
          <div style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            marginBottom: '12px',
            letterSpacing: '0.1em'
          }}>
            INITIALIZE NEURAL LINK
          </div>
          <div style={{ fontSize: '0.9rem', opacity: 0.4 }}>
            Click anywhere into the void to begin the frequency transmission.
          </div>
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between'
      }}>
        <div style={{ opacity: 0.4, fontSize: '0.8rem', fontWeight: 300 }}>
          EST. 2026 // GENERATIVE AUDIO PROTOCOL
        </div>

        <div style={{
          display: 'flex',
          gap: '16px',
          pointerEvents: 'auto'
        }}>
          <button
            onClick={() => useGameStore.getState().togglePlay()}
            style={{
              padding: '16px 40px',
              background: isPlaying ? 'rgba(255, 255, 255, 0.05)' : 'rgba(74, 158, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${isPlaying ? 'rgba(255, 255, 255, 0.2)' : 'rgba(74, 158, 255, 0.4)'}`,
              borderRadius: '12px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase'
            }}
          >
            {isPlaying ? 'Pause Sequence' : 'Resume Sequence'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -45%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        button:hover {
          background: rgba(255, 255, 255, 0.12) !important;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px rgba(0, 0, 0, 0.5);
        }
        button:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}
