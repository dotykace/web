import {readFromStorage, setToStorage} from "@/scripts/local-storage";
import {doc, runTransaction} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {DotykaceParticipant} from "@/lib/dotykace-types";

export default function useDB() {

  const playerId = readFromStorage("playerId")
  const roomId = readFromStorage("roomId")

  if (!roomId || !playerId) {
    throw Error("Room ID or Player ID not found in localStorage.")
  }

  const participantRef = doc(db, "rooms", roomId, "participants", playerId)
  if (!participantRef) {
    throw Error("Participant reference could not be created.")
  }

  const updatePlayerData = async (updateCallback: (oldData: DotykaceParticipant) => Partial<DotykaceParticipant>, onFinish: () => void) => {
    try {
      await runTransaction(db, async (transaction) => {
        const data = await transaction.get(participantRef)
        if (!data.exists()) {
          throw new Error("Participant document does not exist!")
        }
        const participantData = data.data() as DotykaceParticipant
        const updates = updateCallback(participantData)
        transaction.update(participantRef, updates)
      })
      console.log("Participant updated successfully.")
    } catch (error) {
      console.error("Error updating participant:", error)
    } finally {
      onFinish()
    }
  }

  const updateChapter = async (chapterNumber: number, onFinish) => {
    await updatePlayerData((oldData) => {
      const completedChapters = new Set(oldData.completedChapters || [])
      completedChapters.add(chapterNumber)
      const arrayFromSet = Array.from(completedChapters).sort((a, b) => a - b)
      const currentChapter = Math.min(chapterNumber + 1, 4)

      setToStorage("completedChapters", arrayFromSet)
      setToStorage("chapter", currentChapter)
      console.log(`Chapter ${chapterNumber} end interaction reached, setting chapter to ${currentChapter}`)

      return {
        completedChapters: arrayFromSet,
        currentChapter: currentChapter,
      }
    }, onFinish)
  }
  const updateVoice = async (newVoice:string) => {
    await updatePlayerData((oldData) => {
      const responses = {
        ...oldData.responses,
        voiceOption: newVoice,
      }
      return {
        responses: responses
      } as Partial<DotykaceParticipant>
    }, ()=>{})
  }

  return {updateVoice, updateChapter, participantRef}
}