import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import { Download, LockKeyhole, Play, Trash2, UnlockKeyhole, Users} from "lucide-react";
import {ChapterPermissions, DotykaceRoom} from "@/lib/dotykace-types";
import { deleteDoc, doc, Timestamp, updateDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import ProgressTable from "@/components/admin/ProgressTable";
import useParticipants from "@/hooks/use-participants";

export default function RenderRoom({room, processedRooms}) {
  const {participants} = useParticipants({room})
  const canUnlockChapterForAll = (room: DotykaceRoom, chapter: number) => {
    return participants.some((p) => (p.completedChapters || []).includes(chapter - 1) || chapter === 1)
  }

  const isChapterGloballyUnlocked = (room: DotykaceRoom, chapter: number) => {
    return room.globalUnlockedChapters?.includes(chapter) || false
  }

  const allowNextChapterForAll = async (room: DotykaceRoom, nextChapter: number) => {
    if(!canUnlockChapterForAll(room, nextChapter)) return
    try {
      const currentPermissions = room.chapterPermissions || {}
      const updatedPermissions: ChapterPermissions = { ...currentPermissions }
      const currentGlobalUnlocked = room.globalUnlockedChapters || []
      const updatedGlobalUnlocked = [...currentGlobalUnlocked]

      if (!updatedGlobalUnlocked.includes(nextChapter)) {
        updatedGlobalUnlocked.push(nextChapter)
        updatedGlobalUnlocked.sort((a, b) => a - b)
      }

      participants.forEach((participant) => {
        const completedChapters = participant.completedChapters || []
        const previousChapter = nextChapter - 1

        if (completedChapters.includes(previousChapter) || nextChapter === 1) {
          const playerPermissions = updatedPermissions[participant.id] || {
            allowedChapters: [],
            playerName: participant.name,
          }
          if (!playerPermissions.allowedChapters.includes(nextChapter)) {
            playerPermissions.allowedChapters.push(nextChapter)
            playerPermissions.allowedChapters.sort((a, b) => a - b)
          }
          updatedPermissions[participant.id] = playerPermissions
        }
      })

      await updateDoc(doc(db, "rooms", room.docId!), {
        chapterPermissions: updatedPermissions,
        globalUnlockedChapters: updatedGlobalUnlocked,
      })

      const keysToDelete = Array.from(processedRooms.current).filter((key) => key.startsWith(room.docId!))
      keysToDelete.forEach((key) => processedRooms.current.delete(key))
    } catch (error) {
      console.error("❌ Error updating chapter permissions for all:", error)
    }
  }

  const startRoom = async (roomDocId: string) => {
    try {
      // Spusti room a automaticky odomkni introduction (kapitolu 0)
      await updateDoc(doc(db, "rooms", roomDocId), {
        isStarted: true,
        globalUnlockedChapters: [0],
      })
    } catch (error) {
      console.error("❌ Error starting room:", error)
    }
  }

  const deleteRoom = async (roomDocId: string) => {
    try {
      await deleteDoc(doc(db, "rooms", roomDocId))
      const keysToDelete = Array.from(processedRooms.current).filter((key) => key.startsWith(roomDocId))
      keysToDelete.forEach((key) => processedRooms.current.delete(key))
    } catch (error) {
      console.error("❌ Error deleting room:", error)
    }
  }

  const exportData = async (room: DotykaceRoom) => {
    try {
      const csvData = [
        ["Meno", "Čas pripojenia", "Aktuálna kapitola", "Dokončené kapitoly", "Povolené kapitoly"],
        ...participants.map((p) => {
          const permissions = room.chapterPermissions?.[p.id]
          return [
            p.name,
            p.joinedAt
              ? p.joinedAt instanceof Timestamp
                ? p.joinedAt.toDate().toLocaleString()
                : p.joinedAt.toLocaleString()
              : "N/A",
            p.currentChapter?.toString() || "0",
            p.completedChapters?.join(", ") || "žiadne",
            permissions?.allowedChapters?.join(", ") || "žiadne",
          ]
        }),
      ]
      const csvContent = csvData.map((row) => row.join(",")).join("\n")
      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${room.name}_data.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error exporting data:", error)
    }
  }

  const BulkActions = () => {
    return (
      <>
        {[0, 1, 2, 3, 4].map((chapterNum) => {
          const isChapterUnlocked = isChapterGloballyUnlocked(room, chapterNum)
          const canUnlock = canUnlockChapterForAll(room, chapterNum)

          return (
            <td key={chapterNum} className="p-2 text-center">
              <div className="flex items-center justify-center">
                <Button
                  disabled={!canUnlock || isChapterUnlocked}
                  onClick={() => allowNextChapterForAll(room, chapterNum)}
                  className={`w-9 h-9 gap-1 rounded-xl p-2 flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-sm
                  ${
                    isChapterUnlocked
                      ? "bg-amber-500 text-white shadow-amber-200/70 hover:bg-amber-600"
                      : "bg-gray-300 text-gray-600 hover:bg-gray-400"
                  }`}
                  variant="ghost"
                >
                  {isChapterUnlocked ? (
                    <UnlockKeyhole className="w-3 h-3" />
                  ) : (
                    <LockKeyhole className="w-3 h-3" />
                  )}
                  {chapterNum}
                </Button>
              </div>
            </td>
          )
        })}
      </>
    )
  }

  return (
    <Card key={room.docId} className="border-l-4 border-l-blue-500 text-black">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {room.name}
              <Badge variant={room.isActive ? "default" : "secondary"}>
                {room.isActive ? "Aktívna" : "Neaktívna"}
              </Badge>
              {room.isStarted && <Badge variant="destructive">Spustená</Badge>}
            </CardTitle>
            <CardDescription>
              Kód miestnosti: <span className="font-mono font-bold text-lg">{room.id}</span>
            </CardDescription>
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <Users className="w-4 h-4" />
              <span>{participants?.length || 0} účastníkov</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => startRoom(room.docId!)}
              disabled={room.isStarted}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="w-4 h-4 mr-1" />
              {room.isStarted ? "Spustená" : "Začať"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportData(room)}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button size="sm" variant="destructive" onClick={() => deleteRoom(room.docId!)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Participant Progress Table */}
        {participants && participants.length > 0 &&
            <ProgressTable room={room} headerButtons={BulkActions} participants={participants}/>
        }
      </CardContent>
    </Card>
  )
}