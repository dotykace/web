import {useCallback, useState} from "react";
import {readFromStorage} from "@/scripts/local-storage";
import {useChatContext} from "@/context/ChatContext";
import {CHAPTER2_PROGRESS_KEY, CHAPTER3_PROGRESS_KEY} from "@/components/ChapterPage";

const ChapterMetaData = {
  2: {
    color: {
      text: "text-purple-600",
      button: "bg-purple-600 hover:bg-purple-700 shadow-purple-500/30"
    },
    progressKey: CHAPTER2_PROGRESS_KEY,
    startId: "chapter-2-start"
  },
  3: {
    color: {
      text: "text-orange-500",
      button: "bg-orange-500 hover:bg-orange-600 shadow-orange-400/30"
    },
    progressKey: CHAPTER3_PROGRESS_KEY,
    startId: "chapter-3-start"
  }
}

export default function AudioChapterStart({number, component}) {
  const color = ChapterMetaData[number].color
  const progressKey = ChapterMetaData[number].progressKey
  const startId = ChapterMetaData[number].startId
  const [hasStarted, setHasStarted] = useState(false)

  const storedProgress = readFromStorage(progressKey)
  const subHeaderText = storedProgress ? "Máme uložený postup z předchozího hraní. Chceš začít znovu, nebo pokračovat?" : "Jsi ready?"
  const startButtonText = storedProgress ? "Pokračovat" : "Spustit"

  const {goToNextInteraction} = useChatContext()

  const startChapter = useCallback((resetProgress) => {
    if (resetProgress) {
      localStorage.removeItem(progressKey)
      goToNextInteraction(startId)
    }
    setHasStarted(true)
  }, [goToNextInteraction])

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
            {storedProgress && (
              <button
                onClick={() => startChapter(true)}
                className="w-full mb-4 bg-gray-300 hover:bg-gray-400
                           text-gray-800 font-bold py-2 px-2 rounded-full shadow-lg shadow-gray-400/30
                           transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Začít znovu
              </button>
            )}
            <button
              onClick={() => startChapter(false)}
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