import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Plus} from "lucide-react";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {LoadingSpinner} from "@/components/ui/loading-spinner";
import {addDoc, collection} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {useState} from "react";

export default function CreateRoom({adminId}) {
  const [newRoomName, setNewRoomName] = useState("")
  const [loading, setLoading] = useState(false)
  const createRoom = async () => {
    if (!newRoomName.trim() || !adminId) return
    setLoading(true)
    try {
      const roomCode = generateRoomCode()
      await addDoc(collection(db, "rooms"), {
        id: roomCode,
        name: newRoomName.trim(),
        adminId,
        isActive: true,
        isStarted: false,
        createdAt: new Date(),
        participants: [],
        chapterPermissions: {},
        globalUnlockedChapters: [],
      })
      setNewRoomName("")
    } catch (error) {
      console.error("❌ Error creating room:", error)
    } finally {
      setLoading(false)
    }
  }
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Vytvoriť novú miestnosť
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Názov miestnosti"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            className="flex-1"
          />
          <Button onClick={createRoom} disabled={loading || !newRoomName.trim()}>
            {loading ? <LoadingSpinner className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            Vytvoriť
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}