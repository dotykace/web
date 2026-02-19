"use client"

import { useEffect, useState } from "react"
import { readFromStorage } from "@/scripts/local-storage"
import DotykaceLogo from "@/components/DotykaceLogo"
import { Card, CardContent } from "@/components/ui/card"
import { PartyPopper, Smartphone } from "lucide-react"

export default function DotykacePage() {
  const [finished, setFinished] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const isFinished = readFromStorage("dotykaceFinished")
    setFinished(!!isFinished)
    setLoaded(true)
  }, [])

  if (!loaded) {
    return (
      <div className="fixed inset-0 bg-gradient-warm flex items-center justify-center">
        <div className="animate-spin-smooth rounded-full border-3 border-white/30 border-t-white h-10 w-10" />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gradient-warm p-4 flex items-center justify-center overflow-hidden">
      <div className="fixed w-16 h-16 bg-white/30 rounded-full pointer-events-none decorative-float-1 blur-sm" />
      <div className="fixed w-12 h-12 bg-amber-200/40 rounded-full pointer-events-none decorative-float-2 blur-sm" />
      <div
        className="fixed w-10 h-10 bg-red-300/30 rounded-full pointer-events-none decorative-float-3 blur-sm"
        style={{ animationDelay: "3s" }}
      />

      <div className="w-full max-w-md space-y-6 flex flex-col items-center animate-fade-in">
        <DotykaceLogo width={240} />

        {finished ? (
          <Card className="glass-card border-0 w-full animate-scale-in">
            <CardContent className="text-center py-10 px-8">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Zážitek dokončen!
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Dokončili jste zážitek Dotykáče.
                <br />
                Děkujeme za vaši účast!
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-0 w-full animate-scale-in">
            <CardContent className="text-center py-10 px-8">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-10 h-10 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Dotykáče
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Interaktivní zkušenost s mobilem
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
