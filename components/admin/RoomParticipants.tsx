import {CheckCircle, Unlock} from "lucide-react";
import {Button} from "@/components/ui/button";
import {ChapterPermissions, DotykaceRoom} from "@/lib/dotykace-types";
import {doc, updateDoc} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {chapterList} from "@/components/admin/RenderRoom";

export default function RoomParticipants({ participants, room }) {
  const allowNextChapter = async (room: DotykaceRoom, participantId: string, participantName:string, nextChapter: number) => {
    try {
      const currentPermissions = room.chapterPermissions || {}
      const playerPermissions = currentPermissions[participantId] || {
        allowedChapters: [],
        playerName: participantName,
      }

      if (!playerPermissions.allowedChapters.includes(nextChapter)) {
        playerPermissions.allowedChapters.push(nextChapter)
        playerPermissions.allowedChapters.sort((a, b) => a - b)
      }

      const updatedPermissions: ChapterPermissions = {
        ...currentPermissions,
        [participantId]: playerPermissions,
      }

      await updateDoc(doc(db, "rooms", room.docId!), {
        chapterPermissions: updatedPermissions,
      })
    } catch (error) {
      console.error("❌ Error updating chapter permissions:", error)
    }
  }

  return participants.map((participant, index) => {
    const permissions = room.chapterPermissions?.[participant.id]
    const allowedChapters = permissions?.allowedChapters || []
    const currentChapter = participant.currentChapter || 0
    const completedChapters = participant.completedChapters || []

    return (
      <tr
        key={participant.id}
        className={`transition-colors duration-150 hover:bg-blue-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
      >
        <td className="p-2">
          <div>
            <div className="font-semibold text-gray-900 text-xs">{participant.name}</div>
          </div>
        </td>
        {chapterList.map((chapterNum) => {
          const isCompleted = completedChapters.includes(chapterNum)
          const isAllowed = allowedChapters.includes(chapterNum)
          const isCurrent = currentChapter === chapterNum

          return (
            <td key={`${participant.id}-chapter-${chapterNum}`} className="p-2 text-center">
              <div className="flex items-center justify-center">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 shadow-sm ${
                    isCompleted
                      ? "bg-emerald-500 text-white shadow-emerald-200"
                      : isCurrent
                        ? "bg-blue-500 text-white shadow-blue-200 ring-2 ring-blue-200"
                        : isAllowed
                          ? "bg-amber-500 text-white shadow-amber-200"
                          : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-2.5 h-2.5" /> : chapterNum}
                </div>
              </div>
            </td>
          )
        })}
        <td className="p-2">
          <div className="flex justify-center gap-1">
            {[1, 2, 3, 4].map((chapterNum) => {
              const completedChapters = participant.completedChapters || []
              const allowedChapters = permissions?.allowedChapters || []
              const canUnlock = chapterNum === Math.max(...completedChapters) + 1
              const isAllowed = allowedChapters.includes(chapterNum)

              if (!canUnlock || isAllowed || chapterNum === 0) return null

              return (
                <Button
                  key={chapterNum}
                  size="sm"
                  variant="outline"
                  className="h-5 w-5 p-0 text-xs bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:shadow-sm"
                  onClick={() => allowNextChapter(room, participant.id, participant.name, chapterNum)}
                  title={`Odomknúť kapitolu ${chapterNum}`}
                >
                  <Unlock className="w-2.5 h-2.5 text-blue-600" />
                </Button>
              )
            })}
          </div>
        </td>
      </tr>
    )
  })
}