import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  LockKeyhole,
  Play,
  Trash2,
  UnlockKeyhole,
  Users,
} from "lucide-react";
import { ChapterPermissions, DotykaceRoom } from "@/lib/dotykace-types";
import { deleteDoc, doc, Timestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import ProgressTable from "@/components/admin/ProgressTable";
import useParticipants from "@/hooks/use-participants";
export const chapterList = [0, 1, 2, 3, 4, 5];
export default function RenderRoom({
  room,
  processedRooms,
}: {
  room: DotykaceRoom;
  processedRooms: React.MutableRefObject<Set<string>>;
}) {
  const { participants } = useParticipants({ room });
  // todo maybe remove this restriction?
  const canUnlockChapterForAll = (room: DotykaceRoom, chapter: number) => {
    return participants.some(
      (p) => (p.completedChapters || []).includes(chapter - 1) || chapter === 1
    );
  };

  const isChapterGloballyUnlocked = (room: DotykaceRoom, chapter: number) => {
    return room.globalUnlockedChapters?.includes(chapter) || false;
  };

  const allowNextChapterForAll = async (
    room: DotykaceRoom,
    nextChapter: number
  ) => {
    //if(!canUnlockChapterForAll(room, nextChapter)) return
    try {
      const currentPermissions = room.chapterPermissions || {};
      const updatedPermissions: ChapterPermissions = { ...currentPermissions };
      const currentGlobalUnlocked = room.globalUnlockedChapters || [];
      const updatedGlobalUnlocked = [...currentGlobalUnlocked];

      if (!updatedGlobalUnlocked.includes(nextChapter)) {
        updatedGlobalUnlocked.push(nextChapter);
        updatedGlobalUnlocked.sort((a, b) => a - b);
      }

      participants.forEach((participant) => {
        const completedChapters = participant.completedChapters || [];
        const previousChapter = nextChapter - 1;

        if (completedChapters.includes(previousChapter) || nextChapter === 1) {
          const playerPermissions = updatedPermissions[participant.id] || {
            allowedChapters: [],
            playerName: participant.name,
          };
          if (!playerPermissions.allowedChapters.includes(nextChapter)) {
            playerPermissions.allowedChapters.push(nextChapter);
            playerPermissions.allowedChapters.sort((a, b) => a - b);
          }
          updatedPermissions[participant.id] = playerPermissions;
        }
      });

      await updateDoc(doc(db, "rooms", room.docId!), {
        chapterPermissions: updatedPermissions,
        globalUnlockedChapters: updatedGlobalUnlocked,
      });

      const keysToDelete = Array.from(processedRooms.current).filter((key) =>
        key.startsWith(room.docId!)
      );
      keysToDelete.forEach((key) => processedRooms.current.delete(key));
    } catch (error) {
      console.error("❌ Error updating chapter permissions for all:", error);
    }
  };

  const startRoom = async (roomDocId: string) => {
    try {
      // Spusti room a automaticky odomkni introduction (kapitolu 0)
      await updateDoc(doc(db, "rooms", roomDocId), {
        isStarted: true,
        globalUnlockedChapters: [0, 5],
      });
    } catch (error) {
      console.error("❌ Error starting room:", error);
    }
  };

  const deleteRoom = async (roomDocId: string) => {
    try {
      await deleteDoc(doc(db, "rooms", roomDocId));
      const keysToDelete = Array.from(processedRooms.current).filter((key) =>
        key.startsWith(roomDocId)
      );
      keysToDelete.forEach((key) => processedRooms.current.delete(key));
    } catch (error) {
      console.error("❌ Error deleting room:", error);
    }
  };

  const exportData = async (room: DotykaceRoom) => {
    try {
      const csvData = [
        [
          "Meno",
          "Čas pripojenia",
          "Aktuálna kapitola",
          "Dokončené kapitoly",
          "Povolené kapitoly",
        ],
        ...participants.map((p) => {
          const permissions = room.chapterPermissions?.[p.id];
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
          ];
        }),
      ];
      const csvContent = csvData.map((row) => row.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${room.name}_data.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting data:", error);
    }
  };

  const BulkActions = () => {
    return (
      <>
        {chapterList.map((chapterNum) => {
          const isChapterUnlocked = isChapterGloballyUnlocked(room, chapterNum);

          return (
            <td key={chapterNum} className="p-2 text-center">
              <div className="flex items-center justify-center">
                <Button
                  onClick={() => allowNextChapterForAll(room, chapterNum)}
                  className={`w-10 h-10 gap-1 rounded-xl p-2 flex items-center justify-center text-xs font-bold 
                              transition-all duration-200
                              ${
                                isChapterUnlocked
                                  ? "bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-md shadow-orange-200/50 hover:from-orange-500 hover:to-amber-600"
                                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 border border-gray-200"
                              }`}
                  variant="ghost"
                >
                  {isChapterUnlocked ? (
                    <UnlockKeyhole className="w-3.5 h-3.5" />
                  ) : (
                    <LockKeyhole className="w-3.5 h-3.5" />
                  )}
                  {chapterNum}
                </Button>
              </div>
            </td>
          );
        })}
      </>
    );
  };

  return (
    <Card key={room.docId} className="card-elevated border-l-4 border-l-orange-500 text-black">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-3 text-2xl">
              {room.name}
              <Badge 
                variant={room.isActive ? "default" : "secondary"}
                className={room.isActive ? "bg-green-100 text-green-700 border-green-200" : ""}
              >
                {room.isActive ? "Aktívna" : "Neaktívna"}
              </Badge>
              {room.isStarted && (
                <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                  Spustená
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              Kód miestnosti:{" "}
              <span className="font-mono font-bold text-xl text-orange-600 bg-orange-50 px-2 py-0.5 rounded-lg">
                {room.id}
              </span>
            </CardDescription>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-3">
              <Users className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{participants?.length || 0} účastníkov</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => startRoom(room.docId!)}
              disabled={room.isStarted}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 
                         text-white font-semibold rounded-xl shadow-md shadow-green-200/50 transition-all duration-200
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-1" />
              {room.isStarted ? "Spustená" : "Začať"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportData(room)}
              className="rounded-xl border-2 border-gray-200 hover:border-orange-200 hover:bg-orange-50 transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => deleteRoom(room.docId!)}
              className="rounded-xl bg-red-500 hover:bg-red-600 transition-all duration-200"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Participant Progress Table */}
        {participants && participants.length > 0 && (
          <ProgressTable
            room={room}
            headerButtons={BulkActions}
            participants={participants}
          />
        )}
      </CardContent>
    </Card>
  );
}
