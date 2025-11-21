import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";

export default function CreateRoom({ adminId }: { adminId: string | null }) {
  const [newRoomName, setNewRoomName] = useState("");
  const [loading, setLoading] = useState(false);
  const createRoom = async () => {
    if (!newRoomName.trim() || !adminId) return;
    setLoading(true);
    try {
      const roomCode = generateRoomCode();
      await addDoc(collection(db, "rooms"), {
        id: roomCode,
        name: newRoomName.trim(),
        adminId,
        isActive: true,
        isStarted: false,
        createdAt: new Date(),
        chapterPermissions: {},
        globalUnlockedChapters: [],
      });
      setNewRoomName("");
    } catch (error) {
      console.error("❌ Error creating room:", error);
    } finally {
      setLoading(false);
    }
  };
  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
  };

  return (
    <div className="space-y-1 rounded-md border bg-muted/30 p-3">
      <p className="text-sm font-medium text-muted-foreground">
        Vytvoriť novú miestnosť
      </p>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Názov miestnosti"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="h-8 flex-grow text-sm"
        />
        <Button
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={createRoom}
          disabled={loading || !newRoomName.trim()}
        >
          {loading ? (
            <LoadingSpinner className="w-4 h-4" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
