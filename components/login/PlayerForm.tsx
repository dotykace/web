import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  readFromStorage,
  setToStorage,
  removeFromStorage,
  enableTesterMode,
  TESTER_ROOM_CODE,
} from "@/scripts/local-storage";
import {
  DotykaceParticipant,
  DotykaceRoom,
  ChapterPermissions,
} from "@/lib/dotykace-types";

const playerFormSchema = z.object({
  roomCode: z
    .string()
    .min(4, "Kód místnosti musí mít 4 znaky")
    .max(4, "Kód místnosti musí mít 4 znaky")
    .transform((val) => val.toUpperCase()),
  playerName: z
    .string()
    .min(1, "Jméno je povinné")
    .min(2, "Jméno musí mít alespoň 2 znaky"),
});

type PlayerFormValues = z.infer<typeof playerFormSchema>;

export default function PlayerForm({
  setError,
}: {
  setError: (error: string) => void;
}) {
  const loginButtonText = "Připojit se";
  const router = useRouter();

  const form = useForm<PlayerFormValues>({
    resolver: zodResolver(playerFormSchema),
    defaultValues: {
      roomCode: "",
      playerName: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const addPlayerToRoom = async (roomDocId: string, playerName: string) => {
    try {
      const newPlayerId = Date.now().toString();
      setToStorage("playerId", newPlayerId);

      // Create the participant document
      const newParticipant: DotykaceParticipant = {
        id: newPlayerId,
        name: playerName,
        roomId: roomDocId,
        joinedAt: new Date(),
        responses: {
          isComplete: false,
          voiceOption: "male",
        },
        currentChapter: 0,
        completedChapters: [],
      };

      const participantRef = doc(
        db,
        "rooms",
        roomDocId,
        "participants",
        newPlayerId
      );
      await setDoc(participantRef, newParticipant);
      console.log("Participant added:", newPlayerId);

      // Also add the player to room's chapterPermissions with chapter 0 allowed
      const roomRef = doc(db, "rooms", roomDocId);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        const roomData = roomSnap.data() as DotykaceRoom;
        const currentPermissions = roomData.chapterPermissions || {};

        const updatedPermissions: ChapterPermissions = {
          ...currentPermissions,
          [newPlayerId]: {
            allowedChapters: [0],
            playerName: playerName,
          },
        };

        await updateDoc(roomRef, {
          chapterPermissions: updatedPermissions,
        });
        console.log("Player permissions added for chapter 0");
      }

      console.log("✅ Player added successfully");
    } catch (error) {
      console.error("❌ Error adding player:", error);
    }
  };

  const onSubmit = async (values: PlayerFormValues) => {
    setError("");

    try {
      // Check for tester mode - room code "TEST"
      if (values.roomCode === TESTER_ROOM_CODE) {
        console.log("🧪 Tester mode activated!");
        localStorage.clear();
        enableTesterMode();
        setToStorage("playerName", values.playerName);
        setToStorage("UN", values.playerName);
        setToStorage("roomId", "TESTER_ROOM");
        setToStorage("playerId", "TESTER_" + Date.now());
        setToStorage("completedChapters", []);
        setToStorage("chapter", 0);
        // Skip waiting room, go directly to chapter 0
        router.push("/chapter/0");
        return;
      }

      const roomsRef = collection(db, "rooms");
      const idQuery = query(roomsRef, where("id", "==", values.roomCode));
      const querySnapshot = await getDocs(idQuery);

      if (querySnapshot.empty) {
        setError("Místnost nebyla nalezena");
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();

      if (!roomData.isActive) {
        setError("Místnost není aktivní");
        return;
      }
      // Always clear all chapter-related data for new signups
      // This ensures new players start fresh from chapter 0
      localStorage.clear();

      setToStorage("playerName", values.playerName);
      setToStorage("roomId", roomDoc.id);
      await addPlayerToRoom(roomDoc.id, values.playerName);
      console.log(`User "${values.playerName}" joining room "${roomDoc.id}"`);
      router.push("/dotykace/room");
    } catch (err) {
      setError("Chyba při připojování do místnosti");
      console.error("Join room error:", err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="roomCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 font-semibold text-sm">
                Kód místnosti
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ABCD"
                  className="input-unified text-center text-lg font-mono uppercase tracking-widest"
                  maxLength={4}
                  autoFocus
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="playerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 font-semibold text-sm">
                Jméno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Zadejte vaše jméno"
                  className="input-unified"
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary h-11 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && <LoadingSpinner className="mr-2" />}
          {loginButtonText}
        </Button>
      </form>
    </Form>
  );
}
