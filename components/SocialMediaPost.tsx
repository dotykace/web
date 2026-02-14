import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LocalSvgRenderer } from "@/components/LocalSvgRenderer"

interface SocialMediaPostProps {
  username?: string
  avatar: string
  content: string
  choices?: { text: string; callback: () => {} }[]
}

export default function SocialMediaPost({
  username = "Mobil",
  avatar,
  content,
  choices,
}: SocialMediaPostProps) {
  const timestamp = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
  return (
    <Card className="m-5 h-full rounded-3xl transition-all duration-300 ring-1 ring-white/40 shadow-2xl backdrop-blur-xl bg-white/80 border border-white/50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-4">
          <LocalSvgRenderer filename={avatar} className="w-12 h-12" />
          <div className="flex-1 justify-between">
            <h3 className="font-medium text-gray-800 tracking-wide">{username}</h3>
            <p className="text-xs text-gray-500">{timestamp}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="mb-4">
          <p className="text-lg leading-relaxed text-gray-700 font-light tracking-wide">
            {content}
          </p>
          {choices && choices.length > 0 && (
            <div className="mt-6 flex flex-col space-y-3">
              {choices.map((choice, index) => (
                <Button
                  key={index}
                  className="flex-1 rounded-3xl py-6 backdrop-blur-md bg-blue-500 hover:bg-blue-600 
                             border border-blue-400 text-white font-medium tracking-wide 
                             transition-all duration-300 active:scale-[0.98] shadow-md"
                  onClick={choice.callback}
                >
                  {choice.text}
                </Button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
