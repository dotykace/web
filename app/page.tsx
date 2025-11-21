"use client";

import { ReactNode, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { readFromStorage } from "@/scripts/local-storage";
import AdminForm from "@/components/login/AdminForm";
import PlayerForm from "@/components/login/PlayerForm";
import DotykaceLogo from "@/components/DotykaceLogo";
export default function HomePage() {
  const [isLogin, setIsLogin] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [tryLogIn, setTryLogIn] = useState(false);

  const handleModeSwitch = (isAdmin: boolean) => {
    setIsLogin(isAdmin);
    setError(""); // Clear errors when switching modes
  };

  useEffect(() => {
    const stayLoggedIn = readFromStorage("stayLoggedIn");
    console.log("Checking stayLoggedIn:", stayLoggedIn);
    if (!stayLoggedIn) {
      setTryLogIn(true);
      return;
    }
    const adminId = readFromStorage("adminId");

    const playerName = readFromStorage("playerName");
    const roomId = readFromStorage("roomId");
    if (adminId) {
      router.push("/dotykace/admin");
      return;
    } else if (playerName && roomId) {
      router.push("/dotykace/room");
      return;
    }
    setTryLogIn(true);

    // todo how do i detect if the user is admin or player?
  }, []);

  const loadingText = "Načítání";

  if (!tryLogIn) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4 flex items-center justify-center">
        <div className="text-center text-white text-lg sm:text-xl">
          {loadingText}...
        </div>
      </div>
    );
  }

  function renderError(message: string) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">
        {message}
      </div>
    );
  }
  const appSubtitle = "Interaktivní zkušenost s mobilem";

  const loginTitle = isLogin
    ? "Přihlášení administrátora"
    : "Připojit se do aplikace";
  const loginSubtitle = isLogin
    ? "Přihlaste se jako administrátor"
    : "Zadejte kód místnosti a vaše jméno";

  const playerLabel = "Hráč";
  const adminLabel = "Administrátor";

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-2 sm:p-4 flex items-center justify-center">
      <div className="w-full max-w-md space-y-2 sm:space-y-4 flex flex-col">
        {/* Logo */}
        <div className="text-center flex-shrink-0">
          <DotykaceLogo width={280} />
          <p className="text-white m-2 text-xl">{appSubtitle}</p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex bg-white/20 backdrop-blur-sm rounded-full p-1 flex-shrink-0">
          <Button
            variant={!isLogin ? "default" : "ghost"}
            className={`flex-1 rounded-full text-sm ${
              !isLogin ? "bg-white text-gray-900" : "text-white"
            }`}
            onClick={() => handleModeSwitch(false)}
          >
            {playerLabel}
          </Button>
          <Button
            variant={isLogin ? "default" : "ghost"}
            className={`flex-1 rounded-full text-sm ${
              isLogin ? "bg-white text-gray-900" : "text-white"
            }`}
            onClick={() => handleModeSwitch(true)}
          >
            {adminLabel}
          </Button>
        </div>

        {/* Login/Join Form */}
        <Card className="bg-white border-2 border-gray-200 shadow-xl rounded-xl flex-shrink-0">
          <CardHeader className="text-center px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
            <CardTitle className="text-sm sm:text-xl md:text-2xl text-gray-900 leading-tight">
              {loginTitle}
            </CardTitle>
            <CardDescription className="text-gray-600 text-xs sm:text-sm mt-1">
              {loginSubtitle}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-4 pb-3 sm:pb-4">
            {error && (renderError(error) as ReactNode)}

            {isLogin
              ? ((<AdminForm setError={setError} />) as ReactNode)
              : ((<PlayerForm setError={setError} />) as ReactNode)}
          </CardContent>
        </Card>

        {/* Decorative Elements */}
        <div className="fixed w-16 h-16 bg-blue-400 rounded-full opacity-60 pointer-events-none decorative-float-1"></div>
        <div className="fixed w-12 h-12 bg-yellow-300 rounded-full opacity-60 pointer-events-none decorative-float-2"></div>
        <div className="fixed w-8 h-8 bg-red-400 rounded-full opacity-60 pointer-events-none decorative-float-3"></div>
        <div className="fixed w-8 h-8 bg-violet-400 rounded-full opacity-60 pointer-events-none decorative-float-3"></div>
      </div>
    </div>
  );
}
