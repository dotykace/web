import {ReactNode, useState} from "react";
import {useRouter} from "next/navigation";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {FormField} from "@/components/FormField";
import {Button} from "@/components/ui/button";
import {LoadingSpinner} from "@/components/ui/loading-spinner";
import {setToStorage} from "@/scripts/local-storage";

export default function PlayerForm({setError}){
  const roomCodeLabel = "Kód místnosti";
  const playerNameLabel = "Jméno";
  const playerNamePlaceholder = "Zadejte vaše jméno";
  const loginButtonText = "Připojit se";

  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUserJoin = async () => {
    if (!roomCode || !playerName) {
      setError("Prosím vyplňte všetky polia")
      return
    }

    setLoading(true)
    setError("")

    try {
      const roomsRef = collection(db, "rooms")
      const idQuery = query(roomsRef, where("id", "==", roomCode.toUpperCase()))
      const querySnapshot = await getDocs(idQuery)

      if (querySnapshot.empty) {
        setError("Miestnosť nebola nájdená")
        return
      }

      const roomDoc = querySnapshot.docs[0]
      const roomData = roomDoc.data()

      if (!roomData.isActive) {
        setError("Miestnosť nie je aktívna")
        return
      }

      setToStorage("playerName", playerName)
      setToStorage("roomId", roomDoc.id)
      router.push("/dotykace/room")
    } catch (err) {
      setError("Chyba pri pripájaní do miestnosti")
      console.error("Join room error:", err)
    } finally {
      setLoading(false)
    }
  }

  return(
    <>
      <FormField
        id="roomCode"
        label={roomCodeLabel}
        value={roomCode}
        onChange={(val) => setRoomCode(val.toUpperCase())}
        placeholder="ABCD"
        className="text-center text-lg font-mono"
        maxLength={4}
      />

      <FormField
        id="playerName"
        label={playerNameLabel}
        value={playerName}
        onChange={setPlayerName}
        placeholder={playerNamePlaceholder}
      />
      <Button onClick={handleUserJoin} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
        {loading ? <LoadingSpinner className="mr-2" /> as ReactNode : null}
        {loginButtonText}
      </Button>
    </>
  )
}