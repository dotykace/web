"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { doc, onSnapshot, updateDoc, arrayUnion } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { DotykaceRoom, DotykaceParticipant, DotykaceUserResponses } from "@/lib/dotykace-types"
import { useRouter } from "next/navigation"
import { CheckCircle, Clock, Users } from "lucide-react"

export default function DotykaceRoomPage() {
    const [room, setRoom] = useState<DotykaceRoom | null>(null)
    const [playerName, setPlayerName] = useState("")
    const [roomId, setRoomId] = useState("")
    const [currentStep, setCurrentStep] = useState<"waiting" | "bot-name" | "questions" | "experience" | "complete">(
        "waiting",
    )
    const [botName, setBotName] = useState("")
    const [phoneAnswers, setPhoneAnswers] = useState({
        question1: "",
        question2: "",
        question3: "",
    })
    const [experienceAnswers, setExperienceAnswers] = useState({
        question1: "",
        question2: "",
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const storedPlayerName = localStorage.getItem("dotykace_playerName")
        const storedRoomId = localStorage.getItem("dotykace_roomId")

        if (!storedPlayerName || !storedRoomId) {
            router.push("/")
            return
        }

        setPlayerName(storedPlayerName)
        setRoomId(storedRoomId)

        // Listen to room changes using Firestore real-time listener
        const roomRef = doc(db, "rooms", storedRoomId)
        const unsubscribe = onSnapshot(
            roomRef,
            (doc) => {
                if (doc.exists()) {
                    const roomData = doc.data() as DotykaceRoom
                    setRoom(roomData)

                    // Check if player is already in participants
                    const existingParticipant = roomData.participants?.find((p) => p.name === storedPlayerName)
                    if (!existingParticipant) {
                        addPlayerToRoom(storedRoomId, storedPlayerName)
                    }

                    // Update step based on room state - spustí dotykáče flow
                    if (roomData.isStarted && currentStep === "waiting") {
                        setCurrentStep("bot-name")
                    }
                } else {
                    console.error("Room not found:", storedRoomId)
                    router.push("/")
                }
            },
            (error) => {
                console.error("Error listening to room:", error)
                router.push("/")
            },
        )

        return () => unsubscribe()
    }, [router, currentStep])

    const addPlayerToRoom = async (roomId: string, playerName: string) => {
        try {
            const roomRef = doc(db, "rooms", roomId)
            const newParticipant: DotykaceParticipant = {
                id: Date.now().toString(),
                name: playerName,
                roomId,
                joinedAt: new Date(),
                responses: {
                    isComplete: false,
                },
            }

            await updateDoc(roomRef, {
                participants: arrayUnion(newParticipant),
            })
        } catch (error) {
            console.error("Error adding player to room:", error)
        }
    }

    const submitBotName = () => {
        if (botName.trim()) {
            setCurrentStep("questions")
        }
    }

    const submitPhoneQuestions = () => {
        if (phoneAnswers.question1 && phoneAnswers.question2 && phoneAnswers.question3) {
            setCurrentStep("experience")
        }
    }

    const submitExperienceQuestions = async () => {
        if (experienceAnswers.question1 && experienceAnswers.question2) {
            setLoading(true)
            try {
                // Update participant responses in Firestore
                const responses: DotykaceUserResponses = {
                    botName,
                    phoneUsage: phoneAnswers,
                    experienceRating: experienceAnswers,
                    isComplete: true,
                }

                // Save responses to localStorage for potential later use
                localStorage.setItem("dotykace_responses", JSON.stringify(responses))

                setCurrentStep("complete")
            } catch (error) {
                console.error("Error submitting responses:", error)
            } finally {
                setLoading(false)
            }
        }
    }

    const phoneQuestions = [
        {
            id: "question1",
            text: "Ako často používate váš mobilný telefón denne?",
            options: ["Menej ako 2 hodiny", "2-4 hodiny", "4-6 hodín", "Viac ako 6 hodín"],
        },
        {
            id: "question2",
            text: "Ktorú aplikáciu používate najčastejšie?",
            options: ["Sociálne siete", "Správy/Email", "Hry", "Produktivita"],
        },
        {
            id: "question3",
            text: "Kedy najčastejšie používate telefón?",
            options: ["Ráno", "Cez deň", "Večer", "Pred spaním"],
        },
    ]

    const experienceQuestions = [
        {
            id: "question1",
            text: "Ako sa vám páčil tento interaktívny zážitok?",
            options: ["Výborne", "Dobre", "Priemerně", "Slabo"],
        },
        {
            id: "question2",
            text: "Odporučili by ste túto aktivitu priateľom?",
            options: ["Určite áno", "Pravdepodobne áno", "Pravdepodobne nie", "Určite nie"],
        },
    ]

    const startTouchThePhone = () => {
        // Uložiť meno hráča do TouchThePhone localStorage
        localStorage.setItem("userName", playerName)
        // Presmerovať na intro kapitolu TouchThePhone
        router.push("/chapter/0")
    }

    if (!room) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 flex items-center justify-center">
                <div className="animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 h-8 w-8" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-orange-400 to-red-400 p-4">
            <div className="max-w-md mx-auto space-y-6">
                {/* Header */}
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                    <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-yellow-300 rounded-full flex items-center justify-center text-2xl mx-auto mb-2">
                            ^_^
                        </div>
                        <CardTitle className="text-xl text-gray-900">{room.name}</CardTitle>
                        <CardDescription className="flex items-center justify-center gap-2">
                            <Users className="w-4 h-4" />
                            {room.participants?.length || 0} účastníkov
                        </CardDescription>
                    </CardHeader>
                </Card>

                {/* Content based on current step */}
                {currentStep === "waiting" && (
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="text-center py-12">
                            <Clock className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Čakáme na začiatok</h3>
                            <p className="text-gray-600 mb-4">Administrátor ešte nespustil interaktívny zážitok</p>
                            <div className="text-sm text-gray-500">
                                Pripojený ako: <span className="font-semibold">{playerName}</span>
                            </div>

                            {/* Show participants list */}
                            {room.participants && room.participants.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Pripojení hráči:</h4>
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {room.participants.map((participant, index) => (
                                            <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                                {participant.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {currentStep === "bot-name" && (
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                        <CardHeader>
                            <CardTitle className="text-center text-gray-900">Pomenujte svojho bota</CardTitle>
                            <CardDescription className="text-center">
                                Vyberte kreatívne meno pre vášho virtuálneho asistenta
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="botName">Meno bota</Label>
                                <Input
                                    id="botName"
                                    value={botName}
                                    onChange={(e) => setBotName(e.target.value)}
                                    placeholder="Napríklad: Robo, Alexa, Jarvis..."
                                    className="text-center text-lg"
                                />
                            </div>
                            <Button
                                onClick={submitBotName}
                                disabled={!botName.trim()}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                            >
                                Pokračovať
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {currentStep === "questions" && (
                    <div className="space-y-4">
                        {phoneQuestions.map((question, index) => (
                            <Card key={question.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-gray-900">Otázka {index + 1}/3</CardTitle>
                                    <CardDescription>{question.text}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={phoneAnswers[question.id as keyof typeof phoneAnswers]}
                                        onValueChange={(value) =>
                                            setPhoneAnswers((prev) => ({
                                                ...prev,
                                                [question.id]: value,
                                            }))
                                        }
                                    >
                                        {question.options.map((option) => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={option} />
                                                <Label htmlFor={option} className="flex-1 cursor-pointer">
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        ))}
                        <Button
                            onClick={submitPhoneQuestions}
                            disabled={!phoneAnswers.question1 || !phoneAnswers.question2 || !phoneAnswers.question3}
                            className="w-full bg-green-600 hover:bg-green-700"
                        >
                            Pokračovať na hodnotenie
                        </Button>
                    </div>
                )}

                {currentStep === "experience" && (
                    <div className="space-y-4">
                        {experienceQuestions.map((question, index) => (
                            <Card key={question.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="text-lg text-gray-900">Hodnotenie {index + 1}/2</CardTitle>
                                    <CardDescription>{question.text}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <RadioGroup
                                        value={experienceAnswers[question.id as keyof typeof experienceAnswers]}
                                        onValueChange={(value) =>
                                            setExperienceAnswers((prev) => ({
                                                ...prev,
                                                [question.id]: value,
                                            }))
                                        }
                                    >
                                        {question.options.map((option) => (
                                            <div key={option} className="flex items-center space-x-2">
                                                <RadioGroupItem value={option} id={option} />
                                                <Label htmlFor={option} className="flex-1 cursor-pointer">
                                                    {option}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        ))}
                        <Button
                            onClick={submitExperienceQuestions}
                            disabled={loading || !experienceAnswers.question1 || !experienceAnswers.question2}
                            className="w-full bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full border-2 border-white border-t-transparent h-4 w-4 mr-2" />
                            ) : null}
                            Dokončiť
                        </Button>
                    </div>
                )}

                {currentStep === "complete" && (
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                        <CardContent className="text-center py-12">
                            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Ďakujeme za účasť!</h3>
                            <p className="text-gray-600 mb-4">Vaše odpovede boli úspešne odoslané</p>
                            <div className="text-sm text-gray-500 mb-6">
                                Váš bot: <span className="font-semibold">{botName}</span>
                            </div>

                            {/* Option to continue to TouchThePhone */}
                            <div className="space-y-3">
                                <Button onClick={startTouchThePhone} className="w-full bg-blue-600 hover:bg-blue-700">
                                    Pokračovať na TouchThePhone
                                </Button>
                                <Button onClick={() => router.push("/")} variant="outline" className="w-full">
                                    Späť na hlavnú stránku
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
