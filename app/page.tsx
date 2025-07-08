"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceUser } from "@/lib/dotykace-types"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { useRouter } from "next/navigation"

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [roomCode, setRoomCode] = useState("")
  const [playerName, setPlayerName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
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

  const handleUserJoin = async () => {
    if (!roomCode || !playerName) {
      setError("Prosím vyplňte všetky polia")
      return
    }

    setLoading(true)
    setError("")

    try {
      const roomsRef = collection(db, "rooms")
      const idQuery = query(roomsRef, where("id", "==", roomCode.toUpperCase()))
      const querySnapshot = await getDocs(idQuery)

      if (querySnapshot.empty) {
        setError("Miestnosť nebola nájdená")
        return
      }

      const roomDoc = querySnapshot.docs[0]
      const roomData = roomDoc.data()

      if (!roomData.isActive) {
        setError("Miestnosť nie je aktívna")
        return
      }

      localStorage.setItem("dotykace_playerName", playerName)
      localStorage.setItem("dotykace_roomId", roomDoc.id)
      router.push("/dotykace/room")
    } catch (err) {
      setError("Chyba pri pripájaní do miestnosti")
      console.error("Join room error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <div className="absolute inset-0 bg-yellow-300 rounded-full flex items-center justify-center text-4xl">
                ^_^
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-400 rounded-full"></div>
            </div>
            <h1 className="text-4xl font-bold text-blue-600 mb-2">dotykáče</h1>
            <p className="text-gray-700">Interaktívny mobilný zážitok</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1">
            <Button
                variant={isLogin ? "default" : "ghost"}
                className={`flex-1 rounded-full ${isLogin ? "bg-white text-gray-900" : "text-white"}`}
                onClick={() => setIsLogin(true)}
            >
              Admin
            </Button>
            <Button
                variant={!isLogin ? "default" : "ghost"}
                className={`flex-1 rounded-full ${!isLogin ? "bg-white text-gray-900" : "text-white"}`}
                onClick={() => setIsLogin(false)}
            >
              Hráč
            </Button>
          </div>

          {/* Login/Join Form */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">
                {isLogin ? "Admin prihlásenie" : "Pripojiť sa do hry"}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isLogin ? "Prihláste sa ako administrátor" : "Zadajte kód miestnosti a vaše meno"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
              )}

              {isLogin ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-900 font-medium">
                        Používateľské meno
                      </Label>
                      <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="Zadajte používateľské meno"
                          className="bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-900 font-medium">
                        Heslo
                      </Label>
                      <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Zadajte heslo"
                          onKeyPress={(e) => e.key === "Enter" && handleAdminLogin()}
                          className="bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <Button onClick={handleAdminLogin} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                      {loading ? <LoadingSpinner className="mr-2" /> : null}
                      Prihlásiť sa
                    </Button>
                  </>
              ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="roomCode" className="text-gray-900 font-medium">
                        Kód miestnosti
                      </Label>
                      <Input
                          id="roomCode"
                          type="text"
                          value={roomCode}
                          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                          className="text-center text-lg font-mono bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500"
                          placeholder="ABCD"
                          maxLength={4}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="playerName" className="text-gray-900 font-medium">
                        Vaše meno
                      </Label>
                      <Input
                          id="playerName"
                          type="text"
                          value={playerName}
                          onChange={(e) => setPlayerName(e.target.value)}
                          placeholder="Zadajte vaše meno"
                          className="bg-white border-2 border-gray-300 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                    <Button onClick={handleUserJoin} disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                      {loading ? <LoadingSpinner className="mr-2" /> : null}
                      Pripojiť sa
                    </Button>
                  </>
              )}
            </CardContent>
          </Card>

          {/* Decorative Elements */}
          <div className="fixed top-10 left-10 w-16 h-16 bg-blue-400 rounded-full opacity-60"></div>
          <div className="fixed bottom-20 right-10 w-12 h-12 bg-yellow-300 rounded-full opacity-60"></div>
          <div className="fixed top-1/3 right-5 w-8 h-8 bg-red-400 rounded-full opacity-60"></div>
        </div>
      </div>
  )
}
