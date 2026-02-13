import React, {useRef} from "react"
import AudioControl from "@/components/AudioControl";

export default function FullScreenVideo({ videoSrc, onEnded }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  const [isMuted, setIsMuted] = React.useState(isIOS)

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
      <AudioControl onClick={toggleMute} audioEnabled={!isMuted}/>
      <video
        onEnded={onEnded}
        ref={videoRef}
        className="absolute top-0 left-0 w-full h-full"
        src={`/videos/${videoSrc}`}
        playsInline
        autoPlay={true}
        muted={isMuted}
      />
    </div>
  )
}
