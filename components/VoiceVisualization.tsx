import React from "react"
import Image from "next/image"

export default function VoiceVisualization({
  isActive = true,
}: {
  isActive?: boolean
}) {
  return (
    <div className="relative w-full h-48 flex items-center justify-center overflow-hidden">
      {/* Background animated circles */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-white/10 animate-pulse`}
            style={{
              width: `${60 + i * 20}px`,
              height: `${60 + i * 20}px`,
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${2 + i * 0.5}s`,
            }}
          />
        ))}
      </div>
      {/* Central phone character with pulsing effect */}
      <div className="relative z-10">
        <div
          className={`relative transition-all duration-1000 ${isActive ? "animate-pulse scale-110" : "scale-100"}`}
        >
          <Image
            width={96}
            height={96}
            src="/images/phone-character-simple.png"
            alt="Phone Character"
            width={96}
            height={96}
            className="w-24 h-24 drop-shadow-lg"
          />
          {/* Animated rings around character */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-white/50 animate-ping" />
              <div
                className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping"
                style={{ animationDelay: "1s" }}
              />
            </>
          )}
        </div>
        {/* Sound waves */}
        {isActive && (
          <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 bg-white/70 rounded-full animate-pulse"
                style={{
                  height: `${20 + i * 8}px`,
                  right: `${i * 8}px`,
                  top: "50%",
                  transform: "translateY(-50%)",
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
