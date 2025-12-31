import { useRouter } from "next/navigation";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
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
import { readFromStorage, setToStorage, removeFromStorage } from "@/scripts/local-storage";
import { DotykaceParticipant } from "@/lib/dotykace-types";

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

  const addPlayerToRoom = async (roomId: string, playerName: string) => {
    try {
      const newPlayerId = Date.now().toString();
      setToStorage("playerId", newPlayerId);

      const newParticipant: DotykaceParticipant = {
        id: newPlayerId,
        name: playerName,
        roomId,
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
        roomId,
        "participants",
        newPlayerId
      );
      await setDoc(participantRef, newParticipant);
      console.log("Participant added:", newPlayerId);

      console.log("✅ Player added successfully");
    } catch (error) {
      console.error("❌ Error adding player:", error);
    }
  };

  const onSubmit = async (values: PlayerFormValues) => {
    setError("");

    try {
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
      const savedRoomId = readFromStorage("roomId");
      if (savedRoomId) {
        if (savedRoomId !== roomDoc.id) {
          localStorage.clear();
        } else {
          const savedPlayerId = readFromStorage("playerId");
          console.log(
            `User with ID ${savedPlayerId} is re-joining room "${roomDoc.id}"`
          );
          router.push("/dotykace/room");
          return;
        }
      }
      
      // Clear chapter data for new signups to ensure starting from chapter 0
      removeFromStorage("chapter");
      removeFromStorage("completedChapters");
      
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
