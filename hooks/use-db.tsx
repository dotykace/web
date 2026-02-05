import {readFromStorage, setToStorage} from "@/scripts/local-storage";
import {doc, getDoc, runTransaction} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {DotykaceParticipant} from "@/lib/dotykace-types";

export default function useDB() {

  const playerId = readFromStorage("playerId")
  const roomId = readFromStorage("roomId")

  if (!roomId || !playerId) {
    console.warn("Room ID or Player ID not found in localStorage.")
    return undefined;
  }

  const participantRef = doc(db, "rooms", roomId, "participants", playerId)
  if (!participantRef) {
    console.warn("Participant reference could not be created.")
    return undefined;
  }

  const canShowVideo = async () => {
    // todo get this from room settings in firestore
    const roomRef = doc(db, "rooms", roomId)
    const snapshot = await getDoc(roomRef)
    console.log("Checking if video can be shown for room:", roomId)
    return snapshot.data()?.showVideo || false
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

  const updateChapter = async (chapterNumber: number, onFinish?: () => void) => {
    await updatePlayerData((oldData) => {
      const completedChapters = new Set(oldData.completedChapters || []);
      completedChapters.add(chapterNumber);
      const arrayFromSet = Array.from(completedChapters).sort((a, b) => a - b);
      const currentChapter = Math.min(chapterNumber + 1, 4);

      setToStorage("completedChapters", arrayFromSet);
      setToStorage("chapter", currentChapter);
      console.log(
        `Chapter ${chapterNumber} end interaction reached, setting chapter to ${currentChapter}`
      );

      return {
        completedChapters: arrayFromSet,
        currentChapter: currentChapter,
      };
    }, onFinish || (() => {}));
  };
  const updateVoice = async (newVoice: string) => {
    await updatePlayerData(
      (oldData) => {
        const responses = {
          ...oldData.responses,
          voiceOption: newVoice,
        };
        return {
          responses: responses,
        } as Partial<DotykaceParticipant>;
      },
      () => {}
    );
  };

  const saveChapterData = async (
    chapterNumber: number,
    chapterResponses: Record<string, string>
  ) => {
    await updatePlayerData(
      (oldData) => {
        const existingResponses = oldData.responses || {};
        return {
          responses: {
            ...existingResponses,
            [`chapter${chapterNumber}`]: chapterResponses,
          },
        } as Partial<DotykaceParticipant>;
      },
      () => {}
    );
  };

  return { updateVoice, updateChapter, participantRef, canShowVideo, saveChapterData }
}