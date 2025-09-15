import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {CheckCircle, Download, Play, Trash2, UnlockKeyhole, Users} from "lucide-react";
import RoomParticipants from "@/components/admin/RoomParticipants";
import {ChapterPermissions, DotykaceRoom} from "@/lib/dotykace-types";
import {deleteDoc, doc, Timestamp, updateDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";

export default function RenderRoom({room, processedRooms}) {
  const canUnlockChapterForAll = (room: DotykaceRoom, chapter: number) => {
    return room.participants.some((p) => (p.completedChapters || []).includes(chapter - 1) || chapter === 1)
  }

  const isChapterGloballyUnlocked = (room: DotykaceRoom, chapter: number) => {
    return room.globalUnlockedChapters?.includes(chapter) || false
  }

  const allowNextChapterForAll = async (room: DotykaceRoom, nextChapter: number) => {
    try {
      const currentPermissions = room.chapterPermissions || {}
      const updatedPermissions: ChapterPermissions = { ...currentPermissions }
      const currentGlobalUnlocked = room.globalUnlockedChapters || []
      const updatedGlobalUnlocked = [...currentGlobalUnlocked]

      if (!updatedGlobalUnlocked.includes(nextChapter)) {
        updatedGlobalUnlocked.push(nextChapter)
        updatedGlobalUnlocked.sort((a, b) => a - b)
      }

      room.participants.forEach((participant) => {
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
        ...room.participants.map((p) => {
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

  return (
    <Card key={room.docId} className="border-l-4 border-l-blue-500">
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
            {room.globalUnlockedChapters && room.globalUnlockedChapters.length > 0 && (
              <div className="mt-2">
                        <span className="text-sm text-green-600 font-medium">
                          Globálne odomknuté kapitoly: {room.globalUnlockedChapters.join(", ")}
                        </span>
              </div>
            )}
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
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Users className="w-4 h-4" />
          <span>{room.participants?.length || 0} účastníkov</span>
        </div>

        {/* Bulk Actions */}
        {room.participants && room.participants.length > 0 && room.isStarted && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-sm mb-3 text-blue-900">Hromadné akcie - Kapitoly:</h4>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map((chapterNum) => (
                <Button
                  key={chapterNum}
                  size="sm"
                  variant={isChapterGloballyUnlocked(room, chapterNum) ? "default" : "outline"}
                  className={
                    isChapterGloballyUnlocked(room, chapterNum)
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-blue-100 hover:bg-blue-200 border-blue-300"
                  }
                  onClick={() => allowNextChapterForAll(room, chapterNum)}
                  disabled={!canUnlockChapterForAll(room, chapterNum)}
                >
                  {isChapterGloballyUnlocked(room, chapterNum) ? (
                    <CheckCircle className="w-3 h-3 mr-1" />
                  ) : (
                    <UnlockKeyhole className="w-3 h-3 mr-1" />
                  )}
                  {isChapterGloballyUnlocked(room, chapterNum)
                    ? `Kapitola ${chapterNum} odomknutá`
                    : `Povoliť kapitolu ${chapterNum} všetkým`}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Participant Progress Table */}
        {room.participants && room.participants.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-sm">Pokrok hráčov:</h4>
              <div className="text-xs text-gray-500 flex items-center gap-4">
                        <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Dokončené
                        </span>
                <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Aktuálne
                        </span>
                <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          Povolené
                        </span>
                <span className="inline-flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          Zamknuté
                        </span>
              </div>
            </div>

            <div className="bg-white rounded-lg border overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-800 min-w-[120px]">Hráč</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">0</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">1</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">2</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">3</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-800 w-12">4</th>
                    <th className="text-center p-3 text-sm font-semibold text-gray-800 min-w-[100px]">
                      Akcie
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                  <RoomParticipants participants={room.participants} room={room}/>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}