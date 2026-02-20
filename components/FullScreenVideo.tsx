import React, { useRef, useEffect } from "react"
import AudioControl from "@/components/AudioControl"

export default function FullScreenVideo({ videoSrc, onEnded }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isMuted, setIsMuted] = React.useState(false)

  // On iOS, autoplay requires muted. Start muted, then try to unmute
  // once playback begins (works if the user has already interacted with the page).
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (!isIOS) return

    video.muted = true
    setIsMuted(true)

    const tryUnmute = () => {
      video.muted = false
      // If the browser paused the video because we unmuted, revert
      if (video.paused) {
        video.muted = true
        setIsMuted(true)
        video.play().catch(() => {})
      } else {
        setIsMuted(false)
      }
    }

    video.addEventListener("playing", tryUnmute, { once: true })
    return () => video.removeEventListener("playing", tryUnmute)
  }, [])

  // Release media resources on unmount to prevent iOS Safari "Load failed"
  useEffect(() => {
    return () => {
      const video = videoRef.current
      if (video) {
        video.pause()
        video.removeAttribute("src")
        video.load()
      }
    }
  }, [])

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMuted = !prev
      if (videoRef.current) {
        videoRef.current.muted = newMuted
      }
      return newMuted
    })
  }

  return (
    <div className="relative w-screen h-screen aspect-video rounded-lg overflow-hidden shadow-lg">
      <AudioControl onClick={toggleMute} audioEnabled={!isMuted} />
      <video
        onEnded={onEnded}
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full"
        src={`/videos/${videoSrc}`}
        playsInline
        autoPlay
        muted={isMuted}
      />
    </div>
  )
}
