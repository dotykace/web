import { useEffect, useState } from "react"
import { collection, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function useParticipants({ room }) {
  const [participants, setParticipants] = useState<Array<any>>([])
  const participantsCol = collection(db, "rooms", room.docId, "participants")
  useEffect(() => {
    console.log("new room docId:", room.docId)
    getParticipantsOnce(room).then((fetchedParticipants) => {
      setParticipants(fetchedParticipants)
    })
    if (room.participants) return
    onSnapshot(participantsCol, (snapshot) => {
      const newParticipants = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setParticipants(newParticipants)
      console.log("Realtime participants:", newParticipants)
    })
  }, [room])

  return { participants }
}
export async function getParticipantsOnce(room) {
  console.log(room)
  if (room.participants) {
    return room.participants
  }
  const roomDocId = room.docId
  const participantsCol = collection(db, "rooms", roomDocId, "participants")
  const snapshot = await getDocs(participantsCol)
  console.log("Fetched participants snapshot for room", roomDocId)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
