import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { DotykaceUser } from "@/lib/dotykace-types";
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
import { setToStorage } from "@/scripts/local-storage";

const adminFormSchema = z.object({
  username: z.string().min(1, "Používatelské jméno je povinné"),
  password: z.string().min(1, "Heslo je povinné"),
});

type AdminFormValues = z.infer<typeof adminFormSchema>;

export default function AdminForm({
  setError,
}: {
  setError: (error: string) => void;
}) {
  const router = useRouter();

  const form = useForm<AdminFormValues>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: AdminFormValues) => {
    setError("");

    try {
      const usersRef = collection(db, "admins");
      const q = query(usersRef, where("username", "==", values.username));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("Nesprávné přihlašovací údaje");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data() as DotykaceUser;

      if (userData.password !== values.password || userData.role !== "admin") {
        setError("Nesprávné přihlašovací údaje");
        return;
      }

      setToStorage("adminId", userDoc.id);
      router.push("/dotykace/admin");
    } catch (err) {
      setError("Chyba při přihlašování");
      console.error("Login error:", err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-semibold">
                Používatelské jméno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Zadejte používatelské jméno"
                  className="bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                  autoFocus
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-900 font-semibold">
                Heslo
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Zadejte heslo"
                  className="bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg"
                />
              </FormControl>
              <FormMessage className="text-red-600" />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
        >
          {isLoading && <LoadingSpinner className="mr-2" />}
          Přihlásit se
        </Button>
      </form>
    </Form>
  );
}
