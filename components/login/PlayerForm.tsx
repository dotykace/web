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
import { readFromStorage, setToStorage } from "@/scripts/local-storage";
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
              <FormLabel className="text-gray-900 font-semibold">
                Kód místnosti
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="ABCD"
                  className="bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-center text-lg font-mono uppercase rounded-lg"
                  maxLength={4}
                  autoFocus
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="playerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-semibold">
                Jméno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Zadejte vaše jméno"
                  className="bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg"
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          {isLoading && <LoadingSpinner className="mr-2" />}
          {loginButtonText}
        </Button>
      </form>
    </Form>
  );
}
