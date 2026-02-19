// hooks/useAudioManager.tsx
import { useEffect, useRef, useState, useCallback } from "react"
import { readFromStorage } from "@/scripts/local-storage"

interface UseAudioManagerOptions {
  loop?: boolean
  volume?: number // 0.0 to 1.0
}

interface Sound {
  buffer: AudioBuffer
  loop: boolean
  volume: number
}

interface PlayingInstance {
  source: AudioBufferSourceNode
  gainNode: GainNode
}

interface SoundMapEntry {
  filename: string
  opts?: UseAudioManagerOptions
}

export interface PlayOnceOptions extends SoundMapEntry {
  onFinish?: () => void
  type: "sound" | "voice"
}

interface SoundMap {
  [key: string]: SoundMapEntry
}

export function useAudioManager() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)

  // Preloaded sounds map: key -> Sound
  const soundsRef = useRef<Record<string, Sound>>({})

  // Playing instances map: key -> currently playing sources
  const playingRef = useRef<Record<string, PlayingInstance[]>>({})

  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({})
  const [muted, setMuted] = useState(false)

  const getAudioContext = () => {
    if (!audioContextRef.current) {
      console.log("Creating new AudioContext")
      audioContextRef.current = new AudioContext()
    }
    return audioContextRef.current
  }

  // All sounds route through this node so mute/unmute affects everything at once
  const getMasterGain = useCallback(() => {
    if (!masterGainRef.current) {
      const context = getAudioContext()
      masterGainRef.current = context.createGain()
      masterGainRef.current.connect(context.destination)
    }
    return masterGainRef.current
  }, [])

  const resumeAudioContext = useCallback(() => {
    const context = getAudioContext()
    if (context && context.state !== "running") {
      console.log("Resuming suspended AudioContext")
      context.resume().catch((error) => {
        console.error("Error resuming AudioContext:", error)
      })
    }
  },[audioContextRef.current])

  const addToPlaying = (key: string, instance: PlayingInstance) => {
    // Track instance
    if (!playingRef.current[key]) playingRef.current[key] = []
    playingRef.current[key].push(instance)
    setIsPlaying((prev) => ({ ...prev, [key]: true }))
  }

  const removeFromPlaying = (key: string, instance: PlayingInstance) => {
    playingRef.current[key] = playingRef.current[key].filter(
      (inst) => inst.source !== instance.source,
    )
    if (playingRef.current[key].length === 0) {
      setIsPlaying((prev) => ({ ...prev, [key]: false }))
    }
  }

  const getPath = (filename: string, type = "sound") => {
    if (type === "voice") {
      const selectedVoice = readFromStorage("selectedVoice") || "male"
      console.log("Using voice:", selectedVoice)
      return `/audio/${selectedVoice}/${filename}`
    }
    return `/audio/${filename}`
  }

  const fetchSound = async (
    filename: string,
    type = "sound",
  ): Promise<AudioBuffer> => {
    const context = getAudioContext()
    if (!context) throw new Error("AudioContext not available")
    const response = await fetch(getPath(filename, type))
    const arrayBuffer = await response.arrayBuffer()
    return await context.decodeAudioData(arrayBuffer)
  }

  // --- Load a sound and decode it
  const loadSound = useCallback(
    async (key: string, filename: string, opts?: UseAudioManagerOptions) => {
      const buffer = await fetchSound(filename)

      soundsRef.current[key] = {
        buffer,
        loop: opts?.loop ?? false,
        volume: opts?.volume ?? 1,
      }
      setIsPlaying((prev) => ({ ...prev, [key]: false }))
    },
    [],
  )

  // --- Preload multiple sounds at once
  const preloadAll = useCallback(
    async (soundMap: SoundMap) => {
      const promises = Object.entries(soundMap).map(
        ([key, { filename, opts }]) => loadSound(key, filename, opts),
      )
      await Promise.all(promises)
    },
    [loadSound],
  )

  // --- Play a sound by key
  const play = useCallback(async (sound) => {
    const context = getAudioContext()
    if (!context) {
      console.warn("AudioContext not available")
      return
    }
    if (context.state === "suspended") {
      console.log("Resuming suspended AudioContext")
      await context.resume()
    }
    const gainNode = context.createGain()
    gainNode.gain.value = sound.volume

    const source = context.createBufferSource()
    source.buffer = sound.buffer
    source.loop = sound.loop

    source.connect(gainNode).connect(getMasterGain())
    source.start()
    return { source, gainNode }
  }, [])

  const playPreloaded = useCallback(
    async (key: string) => {
      const sound = soundsRef.current[key]
      if (!sound) {
        console.warn(`Sound ${key} not loaded`)
        return
      }
      const { source, gainNode } = await play(sound)

      addToPlaying(key, { source, gainNode })

      source.onended = () => {
        source.disconnect()
        gainNode.disconnect()
        removeFromPlaying(key, { source, gainNode })
      }
    },
    [play],
  )

  const playOnce = useCallback(
    async ({ filename, opts, type, onFinish }: PlayOnceOptions) => {
      const buffer = await fetchSound(filename, type)
      const sound = {
        buffer,
        loop: opts?.loop ?? false,
        volume: opts?.volume ?? 1,
      }
      const duration = buffer.duration
      let timeOut: ReturnType<typeof setTimeout> | null = null
      if (!sound.loop) {
        timeOut = setTimeout(
          () => {
            console.log("Sound timeout reached, calling onFinish if exists")
            if (onFinish) onFinish()
          },
          (duration - 0.1) * 1000,
        )
      }
      const { source, gainNode } = await play(sound)
      addToPlaying(filename, { source, gainNode })
      source.onended = () => {
        source.disconnect()
        gainNode.disconnect()
        removeFromPlaying(filename, { source, gainNode })
        if (timeOut) clearTimeout(timeOut)
      }
    },
    [play],
  )

  // --- Stop all instances of a sound
  const stop = useCallback((key: string) => {
    const instances = playingRef.current[key]
    if (!instances) return

    instances.forEach(({ source, gainNode }) => {
      source.stop()
      source.disconnect()
      gainNode.disconnect()
    })

    playingRef.current[key] = []
    setIsPlaying((prev) => ({ ...prev, [key]: false }))
  }, [])

  // --- Toggle a sound
  const toggle = useCallback(
    (key, onReplay) => {
      if (isPlaying[key]) {
        console.log("Stopping", key)
        stop(key)
      } else {
        console.log("Toggling play for", key)
        onReplay()
      }
    },
    [isPlaying, stop],
  )

  const togglePreloaded = (key: string) => {
    toggle(key, () => playPreloaded(key))
  }

  const toggleOnce = (options: PlayOnceOptions) => {
    toggle(options.filename, () => playOnce(options))
  }

  const stopAll = useCallback(() => {
    Object.keys(playingRef.current).forEach(stop)
  }, [stop])

  const toggleMute = useCallback(() => {
    const gain = getMasterGain()
    setMuted((prev) => {
      const next = !prev
      gain.gain.value = next ? 0 : 1
      return next
    })
  }, [getMasterGain])

  // --- Cleanup on unmount
  useEffect(() => {
    stopAll()
  }, [stop])

  return {
    resumeAudioContext,
    preloadAll,
    playPreloaded,
    playOnce,
    stop,
    stopAll,
    togglePreloaded,
    toggleOnce,
    isPlaying,
    muted,
    toggleMute,
  }
}
