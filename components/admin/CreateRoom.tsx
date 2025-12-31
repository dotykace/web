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
    <div className="space-y-2 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
      <p className="text-sm font-semibold text-gray-700">
        Vytvoriť novú miestnosť
      </p>
      <div className="flex items-center gap-2">
        <Input
          placeholder="Názov miestnosti"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className="h-10 flex-grow text-sm rounded-xl border-2 border-orange-100 focus:border-orange-400 
                     focus:ring-2 focus:ring-orange-200 transition-all duration-200"
        />
        <Button
          size="icon"
          className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 
                     hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-md shadow-orange-200/50 
                     transition-all duration-200 disabled:opacity-50"
          onClick={createRoom}
          disabled={loading || !newRoomName.trim()}
        >
          {loading ? (
            <LoadingSpinner className="w-4 h-4" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
