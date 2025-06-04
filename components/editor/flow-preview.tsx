"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { InteractionFlow } from "@/types/interaction-system"

interface FlowPreviewProps {
    flow: InteractionFlow
}

export default function FlowPreview({ flow }: FlowPreviewProps) {
    const interactions = Object.values(flow.interactions)
    const startInteraction = flow.interactions[flow.startInteractionId]

    const getInteractionTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            "narrative-text": "bg-blue-100 text-blue-800 border-blue-200",
            "title-card": "bg-purple-100 text-purple-800 border-purple-200",
            "title-screen": "bg-purple-100 text-purple-800 border-purple-200",
            input: "bg-green-100 text-green-800 border-green-200",
            "text-input": "bg-green-100 text-green-800 border-green-200",
            "multiple-choice": "bg-yellow-100 text-yellow-800 border-yellow-200",
            "binary-choice": "bg-orange-100 text-orange-800 border-orange-200",
            "chat-message-bot": "bg-cyan-100 text-cyan-800 border-cyan-200",
            "chat-input": "bg-teal-100 text-teal-800 border-teal-200",
            notification: "bg-red-100 text-red-800 border-red-200",
            "chapter-complete": "bg-emerald-100 text-emerald-800 border-emerald-200",
            "audio-visualization": "bg-indigo-100 text-indigo-800 border-indigo-200",
            "video-intro": "bg-pink-100 text-pink-800 border-pink-200",
            "video-player": "bg-rose-100 text-rose-800 border-rose-200",
        }
        return colors[type] || "bg-slate-100 text-slate-800 border-slate-200"
    }

    return (
        <div className="p-4 space-y-4 h-full overflow-y-auto bg-gradient-to-br from-slate-50 to-blue-50">
            {/* Flow Overview */}
            <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-800">Prehľad Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-600 font-medium">Celkový počet interakcií:</span>
                            <span className="text-slate-900 ml-2 font-semibold">{interactions.length}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Štart:</span>
                            <span className="text-slate-900 ml-2 font-semibold">{flow.startInteractionId}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Verzia:</span>
                            <span className="text-slate-900 ml-2 font-semibold">{flow.version}</span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Checkpointy:</span>
                            <span className="text-slate-900 ml-2 font-semibold">
                {interactions.filter((i) => i.checkpoint).length}
              </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Interaction Types */}
            <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-800">Typy interakcií</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {Array.from(new Set(interactions.map((i) => i.type))).map((type) => {
                            const count = interactions.filter((i) => i.type === type).length
                            return (
                                <Badge key={type} variant="outline" className={getInteractionTypeColor(type)}>
                                    {type} ({count})
                                </Badge>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Flow Statistics */}
            <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-800">Štatistiky</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-slate-600 font-medium">Interakcie s voľbami:</span>
                            <span className="text-slate-900 ml-2 font-semibold">
                {interactions.filter((i) => i.choices && i.choices.length > 0).length}
              </span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Timeout interakcie:</span>
                            <span className="text-slate-900 ml-2 font-semibold">
                {interactions.filter((i) => i.timeoutId).length}
              </span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Priemerné trvanie:</span>
                            <span className="text-slate-900 ml-2 font-semibold">
                {(interactions.reduce((sum, i) => sum + i.maxDuration, 0) / interactions.length / 1000).toFixed(1)}s
              </span>
                        </div>
                        <div>
                            <span className="text-slate-600 font-medium">Najdlhšie trvanie:</span>
                            <span className="text-slate-900 ml-2 font-semibold">
                {(Math.max(...interactions.map((i) => i.maxDuration)) / 1000).toFixed(1)}s
              </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Flow Path */}
            <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-800">Náhľad cesty Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {startInteraction && (
                        <div className="space-y-2">
                            <div className="text-sm text-slate-600 font-medium">Začína od: {startInteraction.id}</div>
                            <FlowPath interaction={startInteraction} flow={flow} visited={new Set()} depth={0} />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Checkpoints */}
            <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-800">Checkpointy</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {interactions
                            .filter((i) => i.checkpoint)
                            .map((interaction) => (
                                <div key={interaction.id} className="flex items-center space-x-2">
                                    <Badge variant="outline" className="border-green-300 text-green-800 bg-green-50">
                                        {interaction.id}
                                    </Badge>
                                    <span className="text-sm text-slate-700 font-medium">{interaction.type}</span>
                                    {interaction.text && (
                                        <span className="text-xs text-slate-600 truncate max-w-[200px]">
                      {interaction.text.length > 30 ? `${interaction.text.substring(0, 30)}...` : interaction.text}
                    </span>
                                    )}
                                </div>
                            ))}
                        {interactions.filter((i) => i.checkpoint).length === 0 && (
                            <div className="text-sm text-slate-600">Žiadne checkpointy nie sú definované</div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Orphaned Interactions */}
            <Card className="bg-white/90 border-slate-200 shadow-sm backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-slate-800">Nedostupné interakcie</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {(() => {
                            const reachable = new Set<string>()
                            const visited = new Set<string>()

                            const markReachable = (interactionId: string) => {
                                if (visited.has(interactionId) || !flow.interactions[interactionId]) return
                                visited.add(interactionId)
                                reachable.add(interactionId)

                                const interaction = flow.interactions[interactionId]
                                if (interaction.nextId) markReachable(interaction.nextId)
                                if (interaction.timeoutId) markReachable(interaction.timeoutId)
                                if (interaction.choices) {
                                    interaction.choices.forEach((choice) => {
                                        if (choice.nextId) markReachable(choice.nextId)
                                    })
                                }
                            }

                            markReachable(flow.startInteractionId)

                            const orphaned = interactions.filter((i) => !reachable.has(i.id))

                            return orphaned.length > 0 ? (
                                orphaned.map((interaction) => (
                                    <div key={interaction.id} className="flex items-center space-x-2">
                                        <Badge variant="outline" className="border-orange-300 text-orange-800 bg-orange-50">
                                            {interaction.id}
                                        </Badge>
                                        <span className="text-sm text-slate-700 font-medium">{interaction.type}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-sm text-slate-600">Všetky interakcie sú dostupné</div>
                            )
                        })()}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function FlowPath({
                      interaction,
                      flow,
                      visited,
                      depth,
                  }: {
    interaction: any
    flow: InteractionFlow
    visited: Set<string>
    depth: number
}) {
    if (depth > 8 || visited.has(interaction.id)) {
        return <div className="text-xs text-slate-500 ml-4">... (cyklická alebo hlboká cesta)</div>
    }

    visited.add(interaction.id)

    return (
        <div className="space-y-1">
            <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 bg-indigo-400 rounded-full flex-shrink-0"></div>
                <span className="text-slate-900 font-semibold">{interaction.id}</span>
                <Badge variant="outline" className="text-xs border-slate-300 text-slate-700 bg-slate-50">
                    {interaction.type}
                </Badge>
                {interaction.checkpoint && <Badge className="text-xs bg-green-100 text-green-800 border-green-200">CP</Badge>}
            </div>

            {interaction.nextId && flow.interactions[interaction.nextId] && (
                <div className="ml-4 border-l border-slate-300 pl-4">
                    <FlowPath
                        interaction={flow.interactions[interaction.nextId]}
                        flow={flow}
                        visited={new Set(visited)}
                        depth={depth + 1}
                    />
                </div>
            )}

            {interaction.choices && interaction.choices.length > 0 && (
                <div className="ml-4 space-y-1">
                    {interaction.choices.map((choice: any, index: number) => {
                        if (choice.nextId && flow.interactions[choice.nextId]) {
                            return (
                                <div key={index} className="border-l border-blue-300 pl-4">
                                    <div className="text-xs text-blue-700 mb-1 font-medium">Voľba: {choice.type}</div>
                                    <FlowPath
                                        interaction={flow.interactions[choice.nextId]}
                                        flow={flow}
                                        visited={new Set(visited)}
                                        depth={depth + 1}
                                    />
                                </div>
                            )
                        }
                        return null
                    })}
                </div>
            )}

            {interaction.timeoutId && flow.interactions[interaction.timeoutId] && (
                <div className="ml-4 border-l border-red-300 pl-4">
                    <div className="text-xs text-red-700 mb-1 font-medium">Timeout</div>
                    <FlowPath
                        interaction={flow.interactions[interaction.timeoutId]}
                        flow={flow}
                        visited={new Set(visited)}
                        depth={depth + 1}
                    />
                </div>
            )}
        </div>
    )
}
