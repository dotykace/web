"use client"

export default function ScrollLine() {
  return (
    <div className="flex items-center justify-center w-screen h-screen">
      <div
        className="relative overflow-hidden rounded-full"
        style={{
          width: "15vw",
          height: "66vh",
        }}
      >
        {/* Background track */}
        <div className="absolute inset-0 bg-white/30 rounded-full"></div>

        {/* Animated wave */}
        <div className="absolute inset-0">
          <div className="animate-swipeWave absolute bottom-0 left-0 w-full h-full bg-gradient-to-t from-transparent via-white to-transparent blur-xl"></div>
        </div>
      </div>

      {/* Tailwind custom animation */}
      <style jsx global>{`
        @keyframes swipeWave {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        .animate-swipeWave {
          animation: swipeWave 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
