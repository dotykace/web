import {useState} from "react";

const ChapterMetaData = {
  2: {
    color: {
      text: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/30"
    },
  },
  3: {
    color: {
      text: "text-orange-500",
      button: "bg-orange-500 hover:bg-orange-600 shadow-orange-400/30"
    },
  }
}

export default function AudioChapterStart({number, component}) {
  const color = ChapterMetaData[number].color
  const [hasStarted, setHasStarted] = useState(false)

  const subHeaderText = "Jsi ready?"
  const startButtonText = "Spustit"

  if (!hasStarted) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="fixed w-32 h-32 bg-yellow-300/25 rounded-full pointer-events-none blur-2xl"
          style={{ top: "12%", left: "8%" }}
        />

        <div className="w-full max-w-md space-y-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center">
            <span className={`text-3xl font-bold ${color.text}`}>{number}</span>
          </div>

          <div className="w-full bg-white rounded-3xl p-8 text-center shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Kapitola {number}
            </h2>
            <p className={`mb-8 font-medium text-sm ${color.text}`}>
              {subHeaderText}
            </p>
            <button
              onClick={() => setHasStarted(true)}
              className={`w-full ${color.button}
                         text-white font-bold py-2 px-2 rounded-full shadow-lg
                         transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
            >
              {startButtonText}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return component
}