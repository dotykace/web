import React, { useRef, useEffect } from "react"
import AudioControl from "@/components/AudioControl"

export default function FullScreenVideo({ videoSrc, onEnded }) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [isIOS, setIsIOS] = React.useState(false)
  const [isMuted, setIsMuted] = React.useState(true)

  useEffect(() => {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)
    setIsMuted(ios)
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
