# Agent Technical Knowledge & Workflow

## Mandatory Workflow Rules
- **Constant Type Checking**: After EVERY code modification, you MUST run `npx tsc --noEmit` to verify type safety. Do not assume the code is correct without this check. If errors are found, fix them immediately.

## Context
When building web applications that combine a high-precision audio sequencer (like Tone.js) with a physics engine (like Rapier) or visual loops (requestAnimationFrame), tab switching causes a "desync explosion" because:
1. `requestAnimationFrame` pauses completely.
2. `setTimeout`/`setInterval` are heavily throttled.
3. Audio Contexts are often suspended by the browser.

## The "Desync Explosion" Problem
If the audio clock continues but the physics/logic pauses, events scheduled for the audio clock will keep firing or queue up, but their visual/physical effects won't manifest. Upon returning to the tab, the physics engine "catches up" by processing multiple frames/events instantly, leading to a chaotic burst of visuals and sound.

## Implementation Standard (Zustand + Tone.js + React)

### 1. High-Precision Scheduling
Always use `Tone.Transport` instead of `setTimeout` for scheduling events that need to sync with audio. Use `Tone.Draw` to ensure state updates (like spawning objects) are aligned with the animation frame.

### 2. Visibility Listener
Implement a `visibilitychange` listener at the root of the app (`App.tsx`):

```typescript
useEffect(() => {
  const handleVisibilityChange = async () => {
    const { isPlaying, wasPlayingBeforeHidden } = useGameStore.getState()
    
    if (document.hidden) {
      if (isPlaying) {
        // Mark that we were playing to allow auto-resume
        useGameStore.setState({ wasPlayingBeforeHidden: true, isPlaying: false })
        Tone.Transport.pause()
      }
    } else {
      // Upon returning
      if (wasPlayingBeforeHidden) {
        useGameStore.setState({ wasPlayingBeforeHidden: false, isPlaying: true })
        
        // CRITICAL: Force resume audio context (browsers suspend it in background)
        if (Tone.context.state !== 'running') {
          await Tone.context.resume()
        }
        
        Tone.Transport.start()
      }
    }
  }

  document.addEventListener('visibilitychange', handleVisibilityChange)
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
}, [])
```

### 3. State Management
Include a `wasPlayingBeforeHidden` flag in your store to distinguish between "manually paused" and "automatically paused for backgrounding".

## Key Takeaway
Never assume audio and visuals will stay synced in the background. **Always pause both synchronously and force-resume the AudioContext on focus.**
