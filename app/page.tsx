"use client"

import {ReactNode, useEffect, useState} from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import {readFromStorage} from "@/scripts/local-storage";
import AdminForm from "@/components/login/AdminForm";
import PlayerForm from "@/components/login/PlayerForm";

export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [tryLogIn, setTryLogIn] = useState(false)

  useEffect(() => {
    const stayLoggedIn = readFromStorage("stayLoggedIn")
    console.log("Checking stayLoggedIn:", stayLoggedIn)
    if (!stayLoggedIn) {
      setTryLogIn(true)
      return
    }
    const adminId = localStorage.getItem("dotykace_adminId")
    const playerName = localStorage.getItem("dotykace_playerName")
    const roomId = localStorage.getItem("dotykace_roomId")
    if (adminId) {
      router.push("/dotykace/admin")
      return;
    }
    else if (playerName && roomId) {
      router.push("/dotykace/room")
      return;
    }
    setTryLogIn(true)

    // todo how do i detect if the user is admin or player?
  }, []);

  const loadingText = "Načítání"

  if(!tryLogIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4 flex items-center justify-center">
        <div className="text-center text-white text-xl">{loadingText}...</div>
      </div>
    )
  }

  function renderError(message: string) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
        {message}
      </div>
    )
  }

  const appTitle = "Dotýkače";
  const appSubtitle = "Interaktivní zkušenost s mobilem";

  const loginTitle = isLogin ? "Admin prihlaseni" : "Připojit se do aplikace";
  const loginSubtitle = isLogin ? "Prihláste sa ako administrátor" : "Zadejte kód místnosti a jméno"

  const playerLabel = "Hráč";
  const adminLabel = "Admin";

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
            <h1 className="text-4xl font-bold text-blue-600 mb-2">{appTitle}</h1>
            <p className="text-gray-700">{appSubtitle}</p>
          </div>

          {/* Toggle Buttons */}
          <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1">
            <Button
                variant={!isLogin ? "default" : "ghost"}
                className={`flex-1 rounded-full ${!isLogin ? "bg-white text-gray-900" : "text-white"}`}
                onClick={() => setIsLogin(false)}
            >
              {playerLabel}
            </Button>
            <Button
              variant={isLogin ? "default" : "ghost"}
              className={`flex-1 rounded-full ${isLogin ? "bg-white text-gray-900" : "text-white"}`}
              onClick={() => setIsLogin(true)}
            >
              {adminLabel}
            </Button>
          </div>

          {/* Login/Join Form */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-gray-900">
                {loginTitle}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {loginSubtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {error && renderError(error) as ReactNode}

              {isLogin ? (
                <AdminForm setError={setError} /> as ReactNode
              ) : (
                  <PlayerForm setError={setError} /> as ReactNode
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