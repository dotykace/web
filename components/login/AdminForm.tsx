import {ReactNode, useState} from "react";
import {useRouter} from "next/navigation";
import {collection, getDocs, query, where} from "firebase/firestore";
import {db} from "@/lib/firebase";
import {DotykaceUser} from "@/lib/dotykace-types";
import {FormField} from "@/components/FormField";
import {Button} from "@/components/ui/button";
import {LoadingSpinner} from "@/components/ui/loading-spinner";

export default function AdminForm({setError}){
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)

  const router = useRouter()

  const handleAdminLogin = async () => {
    if (!username || !password) {
      setError("Prosím vyplňte všetky polia")
      return
    }

    setLoading(true)
    setError("")

    try {
      const usersRef = collection(db, "admins")
      const q = query(usersRef, where("username", "==", username))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        setError("Nesprávne prihlasovacie údaje")
        return
      }

      const userDoc = querySnapshot.docs[0]
      const userData = userDoc.data() as DotykaceUser

      if (userData.password !== password || userData.role !== "admin") {
        setError("Nesprávne prihlasovacie údaje")
        return
      }

      localStorage.setItem("dotykace_adminId", userDoc.id)
      router.push("/dotykace/admin")
    } catch (err) {
      setError("Chyba pri prihlasovaní")
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <FormField
        id="username"
        label="Používateľské meno"
        value={username}
        onChange={setUsername}
        placeholder="Zadajte používateľské meno"
      />
      <FormField
        id="password"
        label="Heslo"
        value={password}
        onChange={setPassword}
        placeholder="Zadajte heslo"
        onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
      />
      <Button onClick={handleAdminLogin} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
        {loading ? (<LoadingSpinner className="mr-2" /> as ReactNode) : undefined}
        Prihlásiť sa
      </Button>
    </>
  )
}