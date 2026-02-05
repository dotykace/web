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
              <FormLabel className="text-gray-800 font-semibold text-sm">
                Používatelské jméno
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Zadejte používatelské jméno"
                  className="input-unified"
                  autoFocus
                />
              </FormControl>
              <FormMessage className="text-red-500 text-sm" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-800 font-semibold text-sm">
                Heslo
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Zadejte heslo"
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
          Přihlásit se
        </Button>
      </form>
    </Form>
  );
}
