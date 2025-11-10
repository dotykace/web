"use client"

import {useEffect, useState} from "react";
import {readFromStorage} from "@/scripts/local-storage";
export default function DotykacePage() {
  const [finished, setFinished] = useState(false);
  const defaultText = "Dotykace"
  const finishText = `Dokončili jste zážitek Dotykace.\nDěkujeme!`
  useEffect(() => {
    const isFinished = readFromStorage("dotykaceFinished");
    console.log(isFinished)
    setFinished(()=>!!isFinished);
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600">
      {finished ? (
        <h1>{finishText}</h1>
      ):defaultText}
    </main>
  )
}