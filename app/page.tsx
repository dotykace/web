"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Settings, Smartphone, Code, ArrowRight, Sparkles } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartExperience = async () => {
    setIsLoading(true)
    // Small delay for better UX
    setTimeout(() => {
      router.push("/prelude")
    }, 500)
  }

  const handleOpenEditor = () => {
    router.push("/editor")
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(120,119,198,0.05)_50%,transparent_70%)]" />

        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400 rounded-full animate-ping" />
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-indigo-400 rounded-full animate-ping" />

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
          <div className="max-w-4xl w-full text-center space-y-12">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl"
                >
                  <Smartphone className="h-8 w-8 text-white" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-light bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Interactive Flow
                </h1>
              </div>

              <p className="text-xl md:text-2xl text-slate-300 font-light max-w-3xl mx-auto leading-relaxed">
                Zažite interaktívny príbeh o vzťahu medzi človekom a technológiou
              </p>

              <div className="flex items-center justify-center space-x-2 text-slate-400">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm">Experimentálny interaktívny zážitok</span>
                <Sparkles className="h-5 w-5" />
              </div>
            </motion.div>

            {/* Main Actions */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
            >
              {/* Start Experience Card */}
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <Play className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Začať zážitok</CardTitle>
                  <CardDescription className="text-slate-300">Spustite interaktívny príbeh od začiatku</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                      onClick={handleStartExperience}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 h-12 text-lg font-medium group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300"
                  >
                    {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          <span>Načítava...</span>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2">
                          <span>Spustiť</span>
                          <ArrowRight className="h-5 w-5" />
                        </div>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Editor Card */}
              <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-300">
                    <Code className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl text-white">Flow Editor</CardTitle>
                  <CardDescription className="text-slate-300">Upravte a vytvárajte interaktívne toky</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                      onClick={handleOpenEditor}
                      variant="outline"
                      className="w-full border-purple-500/50 text-purple-300 hover:bg-purple-500/10 hover:border-purple-400 h-12 text-lg font-medium group-hover:shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Otvoriť Editor</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Features */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <Play className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-white">Interaktívny príbeh</h3>
                <p className="text-sm text-slate-400">Zažite príbeh, kde vaše rozhodnutia ovplyvňujú priebeh</p>
              </div>

              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-white">Mobilný zážitok</h3>
                <p className="text-sm text-slate-400">Optimalizované pre mobilné zariadenia a dotykové ovládanie</p>
              </div>

              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <Code className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-medium text-white">Editovateľné</h3>
                <p className="text-sm text-slate-400">Vytvárajte a upravujte vlastné interaktívne toky</p>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-center text-slate-500 text-sm"
            >
              <p>Experimentálny projekt • Interaktívne médiá</p>
            </motion.div>
          </div>
        </div>
      </div>
  )
}
