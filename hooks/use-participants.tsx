import { useEffect, useState } from "react";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { DotykaceRoom, DotykaceParticipant } from "@/lib/dotykace-types";

interface RoomWithParticipants extends DotykaceRoom {
  participants?: DotykaceParticipant[];
}

export default function useParticipants({
  room,
}: {
  room: RoomWithParticipants;
}) {
  const [participants, setParticipants] = useState<DotykaceParticipant[]>([]);

  useEffect(() => {
    if (!room.docId) return;

    // If participants are already provided, use them
    if (room.participants) {
      setParticipants(room.participants);
      return;
    }

    const participantsCol = collection(db, "rooms", room.docId, "participants");
    console.log("Setting up participants listener for room:", room.docId);

    // Set up realtime listener
    const unsubscribe = onSnapshot(participantsCol, (snapshot) => {
      const newParticipants = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as DotykaceParticipant
      );
      setParticipants(newParticipants);
      console.log("Realtime participants update:", newParticipants.length);
    });

    // Cleanup on unmount or when room changes
    return () => {
      console.log("Cleaning up participants listener for room:", room.docId);
      unsubscribe();
    };
  }, [room.docId, room.participants]);

  return { participants };
}

export async function getParticipantsOnce(
  room: RoomWithParticipants
): Promise<DotykaceParticipant[]> {
  if (room.participants) {
    return room.participants;
  }
  const roomDocId = room.docId;
  if (!roomDocId) {
    return [];
  }
  const participantsCol = collection(db, "rooms", roomDocId, "participants");
  const snapshot = await getDocs(participantsCol);
  console.log("Fetched participants snapshot for room", roomDocId);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() }) as DotykaceParticipant
  );
}
