"use client"

import { ReactNode, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { readFromStorage } from "@/scripts/local-storage"
import AdminForm from "@/components/login/AdminForm"
import PlayerForm from "@/components/login/PlayerForm"
import DotykaceLogo from "@/components/DotykaceLogo"
export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const [tryLogIn, setTryLogIn] = useState(false)

  const handleModeSwitch = (isAdmin: boolean) => {
    setIsLogin(isAdmin)
    setError("") // Clear errors when switching modes
  }

  useEffect(() => {
    const stayLoggedIn = readFromStorage("stayLoggedIn")
    console.log("Checking stayLoggedIn:", stayLoggedIn)
    if (!stayLoggedIn) {
      setTryLogIn(true)
      return
    }
    const adminId = readFromStorage("adminId")

    const playerName = readFromStorage("playerName")
    const roomId = readFromStorage("roomId")
    if (adminId) {
      router.push("/dotykace/admin")
      return
    } else if (playerName && roomId) {
      router.push("/dotykace/room")
      return
    }
    setTryLogIn(true)

    // todo how do i detect if the user is admin or player?
  }, [])

  const loadingText = "Načítání"

  if (!tryLogIn) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-warm p-4 flex items-center justify-center">
        <div className="text-center text-white text-lg sm:text-xl animate-gentle-pulse">
          {loadingText}...
        </div>
      </div>
    )
  }

  function renderError(message: string) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm animate-fade-in">
        {message}
      </div>
    )
  }
  const appSubtitle = "Interaktivní zkušenost s mobilem"

  const loginTitle = isLogin
    ? "Přihlášení administrátora"
    : "Připojit se do aplikace"
  const loginSubtitle = isLogin
    ? "Přihlaste se jako administrátor"
    : "Zadejte kód místnosti a vaše jméno"

  const playerLabel = "Hráč"
  const adminLabel = "Administrátor"

  return (
    <div className="fixed inset-0 w-screen h-[100dvh] overflow-y-auto bg-gradient-warm p-2 sm:p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-2 sm:space-y-5 flex flex-col animate-fade-in py-4 sm:py-0">
        {/* Logo */}
        <div className="text-center flex-shrink-0">
          <DotykaceLogo width={200} />
          <p className="text-white/95 m-1 sm:m-2 text-base sm:text-xl font-medium tracking-wide">
            {appSubtitle}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-white/20 backdrop-blur-md rounded-full p-1.5 flex-shrink-0 shadow-lg shadow-black/10">
          <Button
            variant={!isLogin ? "default" : "ghost"}
            className={`flex-1 rounded-full text-sm font-semibold transition-all duration-300 ${
              !isLogin
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/90 hover:text-white hover:bg-white/10"
            }`}
            onClick={() => handleModeSwitch(false)}
          >
            {playerLabel}
          </Button>
          <Button
            variant={isLogin ? "default" : "ghost"}
            className={`flex-1 rounded-full text-sm font-semibold transition-all duration-300 ${
              isLogin
                ? "bg-white text-gray-900 shadow-md"
                : "text-white/90 hover:text-white hover:bg-white/10"
            }`}
            onClick={() => handleModeSwitch(true)}
          >
            {adminLabel}
          </Button>
        </div>

        {/* Login/Join Form */}
        <Card className="glass-card border-0 flex-shrink-0 animate-scale-in">
          <CardHeader className="text-center px-4 sm:px-6 pt-4 sm:pt-6 pb-1 sm:pb-3">
            <CardTitle className="text-base sm:text-xl md:text-2xl text-gray-900 leading-tight font-bold">
              {loginTitle}
            </CardTitle>
            <CardDescription className="text-gray-500 text-xs sm:text-sm mt-1">
              {loginSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
            {error && (renderError(error) as ReactNode)}

            {isLogin
              ? ((<AdminForm setError={setError} />) as ReactNode)
              : ((<PlayerForm setError={setError} />) as ReactNode)}
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <div className="fixed w-16 h-16 bg-white/30 rounded-full pointer-events-none decorative-float-1 blur-sm"></div>
        <div className="fixed w-12 h-12 bg-amber-200/40 rounded-full pointer-events-none decorative-float-2 blur-sm"></div>
        <div className="fixed w-10 h-10 bg-red-300/30 rounded-full pointer-events-none decorative-float-3 blur-sm"></div>
        <div
          className="fixed w-8 h-8 bg-orange-200/40 rounded-full pointer-events-none decorative-float-3 blur-sm"
          style={{ animationDelay: "5s" }}
        ></div>
      </div>
    </div>
  )
}
